import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Timer,
  UserPlus,
  SendHorizontal,
  XCircle,
  Flag,
  Smile,
} from 'lucide-react';
import { useToast } from '../hooks/useToast.js';
import { useDialog } from '../hooks/useDialog.js';
import { apiFetch } from '../api.js';
import { useSocket } from '../contexts/SocketContext.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import CustomEmojiPicker from '../components/CustomEmojiPicker.jsx';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';

const Chat = () => {
  const [viewState, setViewState] = useState('intro');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const { userId } = useUser();
  const socket = useSocket();
  const addToast = useToast();
  const dialog = useDialog();
  const messagesEndRef = useRef(null);
  const inputAreaRef = useRef(null);
  const isLowWidth = window.innerWidth < 412;

  useOnClickOutside(inputAreaRef, () => setShowEmoji(false));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, viewState]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (expiresAt) {
        const now = new Date();
        const end = new Date(expiresAt);
        const diff = end - now;
        if (diff <= 0) {
          setTimeLeft('Expired');
          setViewState('intro');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(
            `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
          );
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await apiFetch('/api/chat/status');
        const data = await res.json();

        if (data.status === 'active') {
          setViewState('active');
          setMessages(data.messages);
          setExpiresAt(data.expiresAt);
          setCurrentChatId(data.chatId);
        } else if (data.status === 'scanning') {
          setViewState('scanning');
        } else {
          setViewState('intro');
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat_matched', ({ chatId, expiresAt }) => {
      setViewState('active');
      setExpiresAt(expiresAt);
      setCurrentChatId(chatId);
      addToast('Match found! Say hello.', 'success');
      setMessages([]);
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        // Limit to last 10 messages on client side for visual consistency
        const updated = [...prev, msg];
        return updated.slice(-10);
      });
    });

    socket.on('chat_ended', () => {
      setViewState('intro');
      setMessages([]);
      setExpiresAt(null);
      setCurrentChatId(null);
      addToast('Chat ended.', 'info');
    });

    return () => {
      socket.off('chat_matched');
      socket.off('receive_message');
      socket.off('chat_ended');
    };
  }, [socket]);

  const handleOptIn = async () => {
    setViewState('scanning');
    try {
      const res = await apiFetch('/api/chat/opt-in', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'active') {
        setViewState('active');
        setCurrentChatId(data.chatId);
        addToast('Connected instantly!', 'success');
      }
    } catch (e) {
      setViewState('intro');
      addToast('Failed to join pool', 'error');
    }
  };

  const handleCancel = async (skipConfirm = false) => {
    if (!skipConfirm && viewState === 'active') {
      const confirmed = await dialog.confirm('End this chat session?', {
        title: 'End Chat',
        isDanger: true,
      });
      if (!confirmed) return;
    }

    await apiFetch('/api/chat/leave', { method: 'POST' });
    setViewState('intro');
  };

  const handleReportChat = async () => {
    if (!currentChatId) return;

    const confirmed = await dialog.confirm(
      'Report this chat conversation? This will end the chat.',
      { title: 'Report Chat', isDanger: true },
    );
    if (!confirmed) return;

    await apiFetch('/api/report', {
      method: 'POST',
      body: JSON.stringify({
        targetType: 'chat',
        targetId: currentChatId,
        reason: 'User reported chat',
      }),
    });
    addToast('Chat reported.', 'info');
    handleCancel(true); // Skip second confirmation
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage;
    setNewMessage('');
    setShowEmoji(false);

    try {
      await apiFetch('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    } catch (e) {
      addToast('Failed to send', 'error');
      setNewMessage(content);
    }
  };

  const onEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  if (viewState === 'active') {
    return (
      <div
        className='centered-page-container full-width'
        style={{ padding: 0, height: '100%', overflow: 'hidden' }}>
        <div className='chat-container-inner'>
          <div
            className='app-header'
            style={{
              position: 'static',
              borderBottom: '1px solid var(--glass-border)',
              background: 'var(--bg-surface)',
            }}>
            <div className='logo-container'>
              <span
                style={{
                  color: 'var(--accent-green)',
                  fontSize: '2rem',
                  lineHeight: '0',
                }}>
                •
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  Anonymous
                </div>
                <div
                  style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Online • Encrypted
                </div>
              </div>
            </div>
            {expiresAt && <div className='chat-timer'>{timeLeft}</div>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleReportChat}
                className='icon-button'
                style={{ color: 'var(--text-muted)' }}
                title='Report'>
                <Flag size={20} />
              </button>
              <button
                onClick={() => handleCancel(false)}
                className='icon-button'
                style={{ color: 'var(--accent-red)' }}
                title='End Chat'>
                <XCircle size={24} />
              </button>
            </div>
          </div>

          <div
            className='chat-messages-area'
            style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div className='system-message'>
              <ShieldCheck
                size={14}
                style={{ display: 'inline', marginRight: 4 }}
              />
              Messages are ephemeral. Only last 10 messages are visible.
            </div>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message-bubble ${msg.senderId === userId ? 'mine' : ''}`}>
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form
            className='chat-input-area'
            onSubmit={sendMessage}
            ref={inputAreaRef}
            style={{ position: 'relative' }}>
            <input
              className='comment-input'
              style={{
                borderRadius: '99px',
                padding: '0.8rem 1.2rem',
                paddingRight: '40px',
              }}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Message...'
            />
            <button
              type='button'
              onClick={() => setShowEmoji(!showEmoji)}
              style={{
                position: 'absolute',
                right: '80px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}>
              <Smile size={24} />
            </button>
            {showEmoji && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '80px',
                  right: isLowWidth ? '340px' : '400px',
                  zIndex: 100,
                }}>
                <CustomEmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
            <button
              className='send-button'
              type='submit'
              disabled={!newMessage.trim()}
              style={{
                background: newMessage.trim()
                  ? 'var(--primary)'
                  : 'var(--input-bg)',
                borderRadius: '50%',
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
              <SendHorizontal
                size={20}
                color={newMessage.trim() ? 'white' : 'var(--text-muted)'}
              />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (viewState === 'scanning') {
    return (
      <div className='centered-page-container full-width'>
        <div
          className='chat-page-wrapper small-container'
          style={{ maxWidth: '400px', margin: 'auto' }}>
          <div className='scanner-container'>
            <div className='scanner-radar'>
              <UserPlus size={32} color='var(--primary)' />
            </div>
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
              }}>
              Searching...
            </h2>
            <p className='muted-text'>Finding you a partner in the void.</p>
            <button
              className='cancel-button'
              style={{
                marginTop: '2rem',
                border: '1px solid var(--glass-border)',
                borderRadius: '99px',
                padding: '0.6rem 2rem',
              }}
              onClick={() => handleCancel(true)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='centered-page-container full-width'>
      <div
        className='chat-page-wrapper small-container'
        style={{ maxWidth: '480px', margin: 'auto' }}>
        <div className='intro-section'>
          <h1 className='chat-page-title'>Live Chat</h1>
          <p className='chat-page-subtitle'>Experience ephemeral connection.</p>
        </div>

        <div
          className='features-list'
          style={{ textAlign: 'left', margin: '2rem 0' }}>
          <div
            className='card'
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
            }}>
            <div
              style={{
                padding: '0.6rem',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--accent-green)',
              }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Anonymous</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No profiles. Just keys.
              </div>
            </div>
          </div>
          <div
            className='card'
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
            }}>
            <div
              style={{
                padding: '0.6rem',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--accent-red)',
              }}>
              <Timer size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Ephemeral</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Chat self-destructs.
              </div>
            </div>
          </div>
        </div>

        <button
          className='opt-in-button'
          onClick={handleOptIn}
          style={{
            width: '100%',
            padding: '1rem',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '16px',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 8px 20px -4px var(--primary-glow)',
          }}>
          Start Searching
        </button>
      </div>
    </div>
  );
};

export default Chat;

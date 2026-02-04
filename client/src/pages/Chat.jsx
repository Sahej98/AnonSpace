import React, { useState, useEffect, useRef } from 'react';
import {
  MessagesSquare,
  ShieldCheck,
  Timer,
  UserPlus,
  Wifi,
  Search,
  SendHorizontal,
  XCircle,
} from 'lucide-react';
import { useToast } from '../hooks/useToast.js';
import { apiFetch } from '../api.js';
import { useSocket } from '../contexts/SocketContext.jsx';
import { useUser } from '../contexts/UserContext.jsx';

const Chat = () => {
  const [viewState, setViewState] = useState('intro'); // intro, scanning, active
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const { userId } = useUser();
  const socket = useSocket();
  const addToast = useToast();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial Status Check
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await apiFetch('/api/chat/status');
        const data = await res.json();

        if (data.status === 'active') {
          setViewState('active');
          setMessages(data.messages);
          setExpiresAt(data.expiresAt);
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

  // Socket Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('chat_matched', ({ chatId, expiresAt }) => {
      setViewState('active');
      setExpiresAt(expiresAt);
      addToast('Match found! Say hello.', 'success');
      setMessages([]);
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [msg, ...prev].slice(0, 5)); // Keep only last 5
    });

    socket.on('chat_ended', () => {
      setViewState('intro');
      setMessages([]);
      setExpiresAt(null);
      addToast('Chat ended by partner or expired.', 'info');
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
        addToast('Connected instantly!', 'success');
      }
    } catch (e) {
      setViewState('intro');
      addToast('Failed to join pool', 'error');
    }
  };

  const handleCancel = async () => {
    await apiFetch('/api/chat/leave', { method: 'POST' });
    setViewState('intro');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await apiFetch('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({ content: newMessage }),
      });
      setNewMessage('');
    } catch (e) {
      addToast('Failed to send', 'error');
    }
  };

  if (viewState === 'active') {
    return (
      <div className='centered-page-container full-width'>
        <div className='chat-page-wrapper active'>
          <div className='card-header'>
            <div className='card-title'>
              <span style={{ color: 'var(--accent-green)' }}>●</span>
              <span>Anonymous Partner</span>
            </div>
            <button onClick={handleCancel} title='Leave Chat'>
              <XCircle size={20} color='var(--accent-red)' />
            </button>
          </div>

          <div className='chat-messages-area'>
            <div ref={messagesEndRef} />
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message-bubble ${msg.senderId === userId ? 'mine' : ''}`}>
                <p>{msg.content}</p>
              </div>
            ))}
            <div className='system-message'>
              Only the last 5 messages are visible.
            </div>
          </div>

          <form className='chat-input-area' onSubmit={sendMessage}>
            <input
              className='comment-input'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Type a message...'
            />
            <button className='send-button' type='submit'>
              <SendHorizontal />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (viewState === 'scanning') {
    return (
      <div className='centered-page-container full-width'>
        <div className='chat-page-wrapper small-container'>
          <div className='intro-section'>
            <h1 className='chat-page-title'>Searching...</h1>
          </div>
          <div className='scanner-container'>
            <div className='scanner-radar'>
              <UserPlus size={32} color='var(--primary)' />
            </div>
            <p className='scanning-text'>Looking for a partner...</p>
            <button
              className='cancel-button'
              style={{
                marginTop: '1rem',
                border: '1px solid var(--glass-border)',
                borderRadius: '99px',
              }}
              onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='centered-page-container full-width'>
      <div className='chat-page-wrapper small-container'>
        <div className='intro-section'>
          <div className='icon-wrapper'>
            <MessagesSquare size={28} color='var(--primary)' />
            <div
              className='wifi-pulse'
              style={{ position: 'absolute', top: -8, right: -8 }}>
              <Wifi size={14} />
            </div>
          </div>
          <h1 className='chat-page-title'>Anonymous Chat</h1>
          <p className='chat-page-subtitle'>
            Connect with a random user. Messages disappear.
          </p>
        </div>

        <div
          className='features-list'
          style={{ textAlign: 'left', margin: '1rem 0 2rem' }}>
          <div
            className='feature-item'
            style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className='feature-icon'>
              <ShieldCheck size={20} color='var(--accent-green)' />
            </div>
            <div className='feature-text'>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                100% Anonymous
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                You are matched using your random ID.
              </p>
            </div>
          </div>
          <div
            className='feature-item'
            style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className='feature-icon'>
              <Timer size={20} color='var(--accent-red)' />
            </div>
            <div className='feature-text'>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ephemeral</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Chat ends in 12h. Only last 5 messages visible.
              </p>
            </div>
          </div>
        </div>

        <div
          className='opt-in-section'
          style={{
            borderTop: '1px solid var(--glass-border)',
            paddingTop: '1.5rem',
            marginTop: 'auto',
          }}>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              marginBottom: '1rem',
            }}>
            By continuing, you agree to be respectful.
          </p>
          <button
            className='opt-in-button'
            onClick={handleOptIn}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 600,
            }}>
            I Agree & Start Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  X,
  Heart,
  MessageSquare,
  Reply,
  UserPlus,
  Check,
  Search,
} from 'lucide-react';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';
import { AnimatePresence, motion } from 'framer-motion';
import { apiFetch } from '../api.js';
import { useSocket } from '../contexts/SocketContext.jsx';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);
  const socket = useSocket();
  const navigate = useNavigate();

  useOnClickOutside(notifRef, () => setShowNotifications(false));

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_notification', (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });
    return () => socket.off('new_notification');
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/api/notifications');
      if (res.ok) setNotifications(await res.json());
    } catch (e) {}
  };

  const handleRead = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (e) {}
  };

  const handleReadAll = async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tag/${searchQuery.trim()}`);
      setSearchQuery('');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={16} fill='var(--primary)' color='var(--primary)' />;
      case 'comment':
        return <MessageSquare size={16} color='var(--accent-green)' />;
      case 'reply':
        return <Reply size={16} color='var(--accent-green)' />;
      case 'chat_match':
        return <UserPlus size={16} color='var(--primary)' />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <header className='app-header'>
      <div className='logo-container'>
        <img
          src='/logo.png'
          alt='AnonSpace'
          className='logo-image'
          onError={(e) => (e.target.style.display = 'none')}
        />
        <span className='logo-text'>AnonSpace</span>
      </div>

      <div className='header-actions' ref={notifRef}>
        <form onSubmit={handleSearch} className='search-bar-container'>
          <Search
            size={14}
            color='var(--text-muted)'
            style={{ marginRight: '0.5rem' }}
          />
          <input
            type='text'
            className='search-input'
            placeholder='Search tags...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <button
          className='icon-button'
          aria-label='Notifications'
          onClick={() => setShowNotifications(!showNotifications)}>
          <Bell size={20} />
          {unreadCount > 0 && <span className='icon-badge' />}
        </button>

        <AnimatePresence>
          {showNotifications && (
            <motion.div
              className='notification-dropdown'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}>
              <div className='notification-header'>
                <span>Notifications</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleReadAll} title='Mark all read'>
                    <Check size={16} />
                  </button>
                  <button onClick={() => setShowNotifications(false)}>
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className='notification-list'>
                {notifications.length === 0 && (
                  <p
                    style={{
                      padding: '1rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                    }}>
                    No notifications.
                  </p>
                )}
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className='notification-item'
                    style={{
                      background: notif.read
                        ? 'transparent'
                        : 'var(--glass-highlight)',
                    }}
                    onClick={() => handleRead(notif._id)}>
                    <div style={{ marginTop: '0.2rem' }}>
                      {getIcon(notif.type)}
                    </div>
                    <div className='notification-content'>
                      <p className='notification-text'>
                        <span
                          style={{
                            fontWeight: 700,
                            color: notif.senderAlias?.color,
                          }}>
                          {notif.senderAlias?.name}
                        </span>{' '}
                        {notif.text}
                      </p>
                      <p className='notification-time'>
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!notif.read && <div className='notification-dot' />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;

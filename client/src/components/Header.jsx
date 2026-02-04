import React, { useState, useRef } from 'react';
import { Bell, X, Heart, TrendingUp, Eye } from 'lucide-react';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';
import { AnimatePresence, motion } from 'framer-motion';

const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    text: 'Someone liked your confession.',
    time: '2m ago',
    read: false,
    icon: Heart,
  },
  {
    id: 2,
    text: 'New trending topic: #Exams',
    time: '1h ago',
    read: false,
    icon: TrendingUp,
  },
  {
    id: 3,
    text: 'Your post reached 100 views!',
    time: '4h ago',
    read: true,
    icon: Eye,
  },
];

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useOnClickOutside(notifRef, () => setShowNotifications(false));

  const unreadCount = DUMMY_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className='app-header'>
      <div className='logo-container'>
        <img src='/logo.png' alt='AnonSpace Logo' className='logo-image' />
        <span className='logo-text'>AnonSpace</span>
      </div>

      <div className='header-actions' ref={notifRef}>
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
                <button onClick={() => setShowNotifications(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className='notification-list'>
                {DUMMY_NOTIFICATIONS.map((notif) => (
                  <div key={notif.id} className='notification-item'>
                    <div
                      className='notification-dot'
                      style={{ opacity: notif.read ? 0 : 1 }}
                    />
                    <div className='notification-content'>
                      <p className='notification-text'>{notif.text}</p>
                      <p className='notification-time'>{notif.time}</p>
                    </div>
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

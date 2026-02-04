import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { useToast } from '../hooks/useToast.js';
import {
  Moon,
  Sun,
  Monitor,
  Bell,
  Trash2,
  LogOut,
  Copy,
  RefreshCcw,
} from 'lucide-react';

const SettingsItem = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
  isActive,
  isToggle = true,
  customAction,
}) => {
  return (
    <div
      className='feature-item'
      onClick={onClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        marginBottom: '0.75rem',
      }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className='feature-icon'>
          <Icon size={20} color='var(--text-main)' />
        </div>
        <div className='feature-text' style={{ textAlign: 'left' }}>
          <h3
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-main)',
            }}>
            {title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        </div>
      </div>
      {customAction
        ? customAction
        : isToggle && (
            <div className={`toggle-switch ${isActive ? 'active' : ''}`}>
              <div className='toggle-thumb' />
            </div>
          )}
    </div>
  );
};

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { userId, logout } = useUser();
  const [notifications, setNotifications] = useState(true);
  const addToast = useToast();

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    addToast('User ID copied to clipboard.', 'success');
  };

  const handleReplayIntro = () => {
    localStorage.removeItem('anonspaceOnboarding');
    window.location.reload();
  };

  return (
    <div className='centered-page-container full-width'>
      <div className='chat-page-wrapper small-container'>
        <div className='intro-section'>
          <div className='icon-wrapper'>
            <Monitor size={28} color='var(--primary)' />
          </div>
          <h1 className='chat-page-title'>Settings</h1>
          <p className='chat-page-subtitle'>Customize your experience.</p>
        </div>

        <div className='features-list'>
          <div
            className='feature-item'
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              borderColor: 'var(--primary)',
              marginBottom: '1rem',
            }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                }}>
                YOUR SECRET ID
              </span>
              <button onClick={handleCopyId}>
                <Copy size={16} color='var(--primary)' />
              </button>
            </div>
            <code
              style={{
                display: 'block',
                wordBreak: 'break-all',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
              }}>
              {userId}
            </code>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-dim)',
                marginTop: '0.5rem',
              }}>
              Save this ID! You need it to login on other devices.
            </p>
          </div>

          <SettingsItem
            icon={theme === 'dark' ? Moon : Sun}
            title='Appearance'
            subtitle={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            isActive={theme === 'light'}
            onClick={toggleTheme}
          />

          <SettingsItem
            icon={Bell}
            title='Notifications'
            subtitle='Receive alerts for replies'
            isActive={notifications}
            onClick={() => setNotifications(!notifications)}
          />

          <SettingsItem
            icon={RefreshCcw}
            title='Replay Intro'
            subtitle='View onboarding screens again'
            isToggle={false}
            onClick={handleReplayIntro}
          />

          <SettingsItem
            icon={LogOut}
            title='Log Out & Clear Storage'
            subtitle='Removes ID from this device'
            isToggle={false}
            onClick={logout}
          />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            AnonSpace v1.2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;

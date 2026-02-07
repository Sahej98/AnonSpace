import React, { createContext, useState, useEffect, useContext } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useSocket } from './SocketContext.jsx';
import { apiFetch } from '../api.js';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(() =>
    localStorage.getItem('anonspaceUserId'),
  );
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() =>
    localStorage.getItem('anonspaceOnboarding'),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWakeUpMessage, setShowWakeUpMessage] = useState(false);

  // States for Flow Control: 'loading' -> 'onboarding' -> 'auth' -> 'app'
  const [appState, setAppState] = useState('loading');

  const socket = useSocket();

  const verifyUser = async (id) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ userId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('anonspaceUserId', data._id);
        setUserId(data._id);
        setIsAuthenticated(true);
        setIsAdmin(data.isAdmin || false);
        setAppState('app');
        if (socket) socket.emit('join_user_room', data._id);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    // Show wake-up message if loading takes longer than 2 seconds
    const timer = setTimeout(() => setShowWakeUpMessage(true), 2000);

    const init = async () => {
      // Wake up server ping (Render cold start)
      try {
        await apiFetch('/api/tags/trending');
      } catch (e) {
        // Ignore error, main logic handles flow
      }

      if (userId) {
        const valid = await verifyUser(userId);
        if (!valid) {
          setUserId(null);
          localStorage.removeItem('anonspaceUserId');
          setAppState('auth');
        }
      } else {
        if (!hasSeenOnboarding) {
          setAppState('onboarding');
        } else {
          setAppState('auth');
        }
      }
      setIsLoading(false);
      clearTimeout(timer);
    };
    init();
    return () => clearTimeout(timer);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('anonspaceOnboarding', 'true');
    setHasSeenOnboarding(true);
    if (userId) {
      setAppState('app');
    } else {
      setAppState('auth');
    }
  };

  const login = async (id) => {
    const success = await verifyUser(id);
    if (!success) throw new Error('Invalid ID');
  };

  const createAccount = async () => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('anonspaceUserId', data._id);
        setUserId(data._id);
        setIsAuthenticated(true);
        setIsAdmin(data.isAdmin || false);

        // For new identity, always show onboarding
        localStorage.removeItem('anonspaceOnboarding');
        setHasSeenOnboarding(false);
        setAppState('onboarding');

        if (socket) socket.emit('join_user_room', data._id);
      }
    } catch (e) {
      console.error('Creation failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('anonspaceUserId');
    setUserId(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAppState('auth');
  };

  const value = {
    userId,
    isAdmin,
    appState,
    completeOnboarding,
    login,
    createAccount,
    logout,
  };

  if (isLoading) {
    return (
      <div
        className='loading-wrapper'
        style={{ flexDirection: 'column', gap: '1.5rem' }}>
        <LoaderCircle className='styled-loader' size={48} />
        {showWakeUpMessage && (
          <div
            style={{
              textAlign: 'center',
              maxWidth: '300px',
              animation: 'fadeIn 0.5s',
              padding: '0 1rem',
            }}>
            <p
              style={{
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
              }}>
              Waking up the server...
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              This might take up to a minute if the app was sleeping.
            </p>
          </div>
        )}
      </div>
    );
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

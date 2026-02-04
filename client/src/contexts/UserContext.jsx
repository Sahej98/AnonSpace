import React, { createContext, useState, useEffect, useContext } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useSocket } from './SocketContext.jsx';

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

  // States for Flow Control: 'loading' -> 'onboarding' -> 'auth' -> 'app'
  const [appState, setAppState] = useState('loading');

  const socket = useSocket();

  const verifyUser = async (id) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    const init = async () => {
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
    };
    init();
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('anonspaceOnboarding', 'true');
    setHasSeenOnboarding(true);
    setAppState('auth');
  };

  const login = async (id) => {
    const success = await verifyUser(id);
    if (!success) throw new Error('Invalid ID');
  };

  const createAccount = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('anonspaceUserId', data._id);
        setUserId(data._id);
        setIsAuthenticated(true);
        setIsAdmin(data.isAdmin || false);
        setAppState('app');
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
      <div className='loading-wrapper'>
        <LoaderCircle className='styled-loader' size={48} />
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

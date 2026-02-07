import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Use the API URL environment variable for production, or fallback to localhost
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const newSocket = io(SOCKET_URL, {
      withCredentials: true, // Important for CORS
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

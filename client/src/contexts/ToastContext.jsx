import React, { createContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export const ToastContext = createContext();

const ICONS = {
  success: <CheckCircle style={{ color: 'var(--green)' }} />,
  error: <XCircle style={{ color: 'var(--accent-red)' }} />,
  info: <Info style={{ color: 'var(--primary)' }} />,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className='toast-container'>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className='toast-wrapper'
              layout
              initial={{ opacity: 0, y: -50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.5 }}
              transition={{ duration: 0.3 }}>
              <div className='toast-message'>
                {ICONS[toast.type]}
                <p>{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

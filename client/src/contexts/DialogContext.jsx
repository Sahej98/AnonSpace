import React, { createContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const closeDialog = useCallback((result) => {
    setDialog(null);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  }, []);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({
        type: 'confirm',
        message,
        title: options.title || 'Confirm Action',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        isDanger: options.isDanger || false,
      });
    });
  }, []);

  const alert = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({
        type: 'alert',
        message,
        title: options.title || 'Alert',
        confirmText: 'OK',
      });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      <AnimatePresence>
        {dialog && (
          <motion.div
            className='modal-overlay'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() =>
              dialog.type === 'confirm' ? closeDialog(false) : closeDialog(true)
            }
            style={{ zIndex: 2000 }}>
            <motion.div
              className='modal-content'
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '350px',
                padding: '1.5rem',
                textAlign: 'center',
              }}>
              <div style={{ marginBottom: '1rem' }}>
                {dialog.isDanger ? (
                  <AlertCircle
                    size={40}
                    color='var(--accent-red)'
                    style={{ margin: '0 auto 0.5rem' }}
                  />
                ) : (
                  <AlertCircle
                    size={40}
                    color='var(--primary)'
                    style={{ margin: '0 auto 0.5rem' }}
                  />
                )}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {dialog.title}
                </h3>
              </div>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                {dialog.message}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '0.8rem',
                  justifyContent: 'center',
                }}>
                {dialog.type === 'confirm' && (
                  <button
                    className='cancel-button'
                    onClick={() => closeDialog(false)}
                    style={{
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                    }}>
                    {dialog.cancelText}
                  </button>
                )}
                <button
                  className='submit-button'
                  onClick={() => closeDialog(true)}
                  style={{
                    background: dialog.isDanger
                      ? 'var(--accent-red)'
                      : 'var(--primary)',
                    flex: 1,
                  }}>
                  {dialog.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
};

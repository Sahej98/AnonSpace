import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Ghost, Key, ArrowRight, LoaderCircle } from 'lucide-react';

const AuthSelection = () => {
  const { createAccount, login } = useUser();
  const [mode, setMode] = useState('choice'); // choice, login
  const [inputId, setInputId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!inputId.trim()) return;
    setLoading(true);
    setError('');
    try {
      await login(inputId.trim());
    } catch (e) {
      setError('Invalid or non-existent User ID.');
      setLoading(false);
    }
  };

  return (
    <div
      className='centered-page-container'
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <div
        className='chat-page-wrapper small-container'
        style={{ maxWidth: '400px' }}>
        <div className='icon-wrapper' style={{ margin: '0 auto 2rem' }}>
          <Ghost size={48} color='var(--primary)' />
        </div>

        {mode === 'choice' ? (
          <>
            <h1 className='chat-page-title'>Who are you?</h1>
            <p className='chat-page-subtitle' style={{ marginBottom: '2rem' }}>
              Start fresh or return to the void.
            </p>

            <button
              className='confess-button'
              onClick={createAccount}
              style={{ marginBottom: '1rem' }}>
              <span>Create New Identity</span>
              <ArrowRight size={18} />
            </button>

            <button
              className='cancel-button'
              style={{
                width: '100%',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
              }}
              onClick={() => setMode('login')}>
              I have a User ID
            </button>
          </>
        ) : (
          <>
            <h1 className='chat-page-title'>Welcome Back</h1>
            <p className='chat-page-subtitle' style={{ marginBottom: '2rem' }}>
              Enter your secret key.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <div className='textarea-wrapper'>
                <input
                  className='styled-textarea'
                  style={{
                    height: '50px',
                    padding: '0 1rem',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                  }}
                  placeholder='Paste your ID here...'
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                />
              </div>
              {error && (
                <p style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                  {error}
                </p>
              )}
            </div>

            <button
              className='confess-button'
              onClick={handleLogin}
              disabled={loading}>
              {loading ? (
                <LoaderCircle className='styled-loader' size={18} />
              ) : (
                <span>Enter Void</span>
              )}
            </button>

            <button
              className='cancel-button'
              onClick={() => {
                setMode('choice');
                setError('');
              }}
              style={{ marginTop: '1rem' }}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthSelection;

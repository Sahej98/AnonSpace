import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, GitBranch, Heart, Globe, Lock, ArrowLeft } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className='centered-page-container full-width'>
      <div
        className='chat-page-wrapper small-container'
        style={{ textAlign: 'left' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            color: 'var(--text-muted)',
          }}>
          <ArrowLeft size={20} /> Back
        </button>

        <div className='intro-section' style={{ textAlign: 'center' }}>
          <h1 className='chat-page-title'>About AnonSpace</h1>
          <p className='chat-page-subtitle'>
            Reclaiming the internet's lost freedom.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
          <div className='feature-item'>
            <div className='feature-icon'>
              <Shield size={20} color='var(--accent-green)' />
            </div>
            <div className='feature-text'>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                Privacy First Architecture
              </h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
                }}>
                We don't ask for emails. We don't track IPs. Your identity is a
                cryptographic key generated on your device.
              </p>
            </div>
          </div>

          <div className='feature-item'>
            <div className='feature-icon'>
              <Lock size={20} color='var(--primary)' />
            </div>
            <div className='feature-text'>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                Ephemeral by Design
              </h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
                }}>
                Chats self-destruct. Identities rotate per post. Nothing is
                meant to last forever here, encouraging honest, in-the-moment
                expression.
              </p>
            </div>
          </div>

          <div className='feature-item'>
            <div className='feature-icon'>
              <Globe size={20} color='#3b82f6' />
            </div>
            <div className='feature-text'>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Global Void</h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
                }}>
                Connect with anyone, anywhere. The Void listens to all languages
                and all stories without judgment.
              </p>
            </div>
          </div>

          <div className='feature-item'>
            <div className='feature-icon'>
              <GitBranch size={20} color='var(--text-main)' />
            </div>
            <div className='feature-text'>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Open Source</h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
                }}>
                Trust is earned. Our code is open for inspection to ensure we do
                exactly what we say we do.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '3rem',
            padding: '2rem',
            borderTop: '1px solid var(--glass-border)',
          }}>
          <Heart
            size={24}
            color='var(--accent-red)'
            style={{ margin: '0 auto 1rem' }}
          />
          <p style={{ color: 'var(--text-dim)' }}>
            Created with passion for digital freedom.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;

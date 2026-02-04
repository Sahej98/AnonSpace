import React from 'react';
import { Zap, Shield, GitBranch } from 'lucide-react';

const About = () => {
  return (
    <div className='centered-page-container full-width'>
      <div className='chat-page-wrapper small-container'>
        <div className='intro-section'>
          <div className='icon-wrapper'>
            <Zap size={28} color='var(--primary)' />
          </div>
          <h1 className='chat-page-title'>About AnonSpace</h1>
          <p className='chat-page-subtitle'>
            A platform for true anonymous expression.
          </p>
        </div>

        <div className='features-list'>
          <div className='feature-item'>
            <div className='feature-icon'>
              <Shield size={20} color='var(--accent-green)' />
            </div>
            <div className='feature-text'>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                }}>
                Privacy First
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No accounts, no tracking, no logs.
              </p>
            </div>
          </div>
          <div className='feature-item' style={{ marginTop: '1rem' }}>
            <div className='feature-icon'>
              <GitBranch size={20} color='var(--primary)' />
            </div>
            <div className='feature-text'>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                }}>
                Open Source
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Transparency is our core value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

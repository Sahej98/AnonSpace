import React from 'react';
import TrendingTags from './TrendingTags';
import { Shield, MessageCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnonymityCard = () => (
  <div
    className='card'
    style={{ background: 'var(--bg-surface)', border: 'none' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        marginBottom: '0.5rem',
      }}>
      <div
        style={{
          padding: '0.5rem',
          borderRadius: '8px',
          background: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--primary)',
        }}>
        <Shield size={20} />
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
        Secure & Anonymous
      </span>
    </div>
    <p
      style={{
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        lineHeight: '1.5',
      }}>
      Your identity is generated per session. No tracking, no logs.
    </p>
  </div>
);

const ChatCard = () => (
  <div
    className='card'
    style={{
      background:
        'linear-gradient(135deg, var(--bg-surface), var(--glass-surface))',
      border: '1px solid var(--glass-border)',
    }}>
    <h3
      style={{
        fontSize: '1rem',
        fontWeight: 800,
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
      <MessageCircle size={18} color='var(--accent-green)' />
      Live Chat
    </h3>
    <p
      style={{
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        marginBottom: '1rem',
      }}>
      Match with a stranger now.
    </p>
    <Link
      to='/chat'
      className='join-chat-button'
      style={{
        background: 'var(--bg-body)',
        color: 'var(--text-main)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'none',
      }}>
      <Zap size={16} fill='var(--primary)' color='var(--primary)' />
      <span>Join Pool</span>
    </Link>
  </div>
);

const InfoPanel = () => {
  return (
    <aside className='info-panel'>
      <TrendingTags />
      <ChatCard />
      <AnonymityCard />
    </aside>
  );
};

export default InfoPanel;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  MessageSquare,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

const RuleItem = ({ icon: Icon, title, text }) => (
  <div
    className='card'
    style={{
      marginBottom: '1rem',
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'flex-start',
      padding: '1.5rem',
    }}>
    <div
      style={{
        background: 'var(--input-bg)',
        padding: '0.85rem',
        borderRadius: '12px',
        flexShrink: 0,
      }}>
      <Icon size={28} color='var(--primary)' />
    </div>
    <div>
      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          color: 'var(--text-main)',
        }}>
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
        }}>
        {text}
      </p>
    </div>
  </div>
);

const Rules = () => {
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

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className='chat-page-title' style={{ fontSize: '2rem' }}>
            Community Rules
          </h1>
          <p className='chat-page-subtitle'>
            To keep AnonSpace safe, please follow these guidelines.
          </p>
        </div>

        <div>
          <RuleItem
            icon={Shield}
            title='Anonymity First'
            text='Do not share personal information about yourself or others. Doxing is strictly prohibited to ensure everyone safety.'
          />
          <RuleItem
            icon={Users}
            title='Be Respectful'
            text='Treat everyone with kindness. Harassment, hate speech, bullying, and targeted attacks are not tolerated under any circumstances.'
          />
          <RuleItem
            icon={MessageSquare}
            title='No Spam'
            text='Avoid repetitive posts, excessive self-promotion, or meaningless content that clutters the feed.'
          />
          <RuleItem
            icon={AlertTriangle}
            title='Illegal Content'
            text='Posting illegal content, soliciting illegal acts, or sharing harmful material will result in an immediate permanent ban.'
          />
        </div>
      </div>
    </div>
  );
};

export default Rules;

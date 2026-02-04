import React from 'react';
import { Shield, Users, MessageSquare, AlertTriangle } from 'lucide-react';

const RuleItem = ({ icon: Icon, title, text }) => (
  <div
    className='card'
    style={{
      marginBottom: '1rem',
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-start',
    }}>
    <div
      style={{
        background: 'var(--input-bg)',
        padding: '0.75rem',
        borderRadius: '12px',
        flexShrink: 0,
      }}>
      <Icon size={24} color='var(--primary)' />
    </div>
    <div>
      <h3
        style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{text}</p>
    </div>
  </div>
);

const Rules = () => {
  return (
    <div className='centered-page-container full-width'>
      <h1
        className='feed-header-title'
        style={{ marginBottom: '0.5rem' }}>
        Community Rules
      </h1>
      <p
        className='feed-header-subtitle'
        style={{ marginBottom: '2rem' }}>
        To keep AnonSpace safe, please follow these guidelines.
      </p>

      <div>
        <RuleItem
          icon={Shield}
          title='Anonymity First'
          text='Do not share personal information about yourself or others. Doxing is strictly prohibited.'
        />
        <RuleItem
          icon={Users}
          title='Be Respectful'
          text='Treat everyone with kindness. Harassment, hate speech, and bullying are not tolerated.'
        />
        <RuleItem
          icon={MessageSquare}
          title='No Spam'
          text='Avoid repetitive posts, excessive self-promotion, or meaningless content.'
        />
        <RuleItem
          icon={AlertTriangle}
          title='Illegal Content'
          text='Posting illegal content or soliciting illegal acts will result in an immediate ban.'
        />
      </div>
    </div>
  );
};

export default Rules;

import React from 'react';
import TrendingTags from './TrendingTags';
import {
  Shield,
  MessageCircle,
  MoreHorizontal,
  Check,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AnonymityCard = () => (
  <div className='card'>
    <div className='card-header'>
      <div className='card-title'>
        <div className='card-icon-wrapper'>
          <Shield size={18} />
        </div>
        <span>Anonymity</span>
      </div>
    </div>
    <ul className='anonymity-list'>
      <li className='anonymity-list-item'>
        <Check size={14} />
        <span>No logins, no tracking.</span>
      </li>
      <li className='anonymity-list-item'>
        <Check size={14} />
        <span>Aliases rotate per post.</span>
      </li>
      <li className='anonymity-list-item'>
        <Check size={14} />
        <span>Encrypted connection.</span>
      </li>
    </ul>
  </div>
);

const ChatCard = () => (
  <div className='card'>
    <div className='card-header'>
      <div className='card-title'>
        <div className='card-icon-wrapper'>
          <MessageCircle size={18} />
        </div>
        <span>Live Chat</span>
      </div>
      <button className='icon-button' style={{ padding: 4 }}>
        <MoreHorizontal size={16} />
      </button>
    </div>
    <p
      style={{
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
        lineHeight: '1.4',
      }}>
      Connect instantly with a random stranger.
    </p>
    <Link to='/chat' className='join-chat-button'>
      <Zap size={16} fill='currentColor' />
      <span>Join Chat Pool</span>
    </Link>
    <p className='muted-text'>Chats self-destruct in 12h.</p>
  </div>
);

const InfoPanel = () => {
  return (
    <aside className='info-panel'>
      <AnonymityCard />
      <TrendingTags />
      <ChatCard />
    </aside>
  );
};

export default InfoPanel;

import React, { useState, useRef } from 'react';
import UserAvatar from './UserAvatar.jsx';
import PostActions from './PostActions.jsx';
import Comments from './Comments.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontal, Link as LinkIcon, EyeOff, Flag } from 'lucide-react';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';
import { useToast } from '../hooks/useToast.js';
import { apiFetch } from '../api.js';
import { useUser } from '../contexts/UserContext.jsx';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)}y ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)}mo ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m ago`;
  return `${Math.floor(seconds)}s ago`;
};

const Poll = ({ post }) => {
  const { userId } = useUser();
  const [localVotes, setLocalVotes] = useState(null); // Optimistic UI
  const totalVotes =
    post.pollOptions.reduce((acc, opt) => acc + opt.votes.length, 0) +
    (localVotes ? 1 : 0);
  const hasVoted =
    post.pollOptions.some((opt) => opt.votes.includes(userId)) ||
    localVotes !== null;

  const handleVote = async (optionIndex) => {
    if (hasVoted) return;
    setLocalVotes(optionIndex); // Optimistic
    try {
      await apiFetch(`/api/posts/${post._id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ optionIndex }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className='poll-container'>
      {post.pollOptions.map((option, idx) => {
        const votesForOption =
          option.votes.length + (localVotes === idx ? 1 : 0);
        const percentage =
          totalVotes === 0
            ? 0
            : Math.round((votesForOption / totalVotes) * 100);
        const isSelected = option.votes.includes(userId) || localVotes === idx;

        return (
          <div
            key={idx}
            className='poll-option'
            onClick={() => handleVote(idx)}
            style={{ borderColor: isSelected ? 'var(--primary)' : '' }}>
            {/* Background Bar */}
            <div
              className='poll-bar'
              style={{ width: hasVoted ? `${percentage}%` : '0%' }}
            />

            <div className='poll-content'>
              <span className='poll-text'>{option.text}</span>
              {hasVoted && (
                <span className='poll-percentage'>{percentage}%</span>
              )}
            </div>
          </div>
        );
      })}
      <div
        style={{
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
          marginTop: '0.25rem',
        }}>
        {totalVotes} votes
      </div>
    </div>
  );
};

const PostCard = ({ post }) => {
  const alias = post.alias;
  const [areCommentsVisible, setAreCommentsVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const addToast = useToast();

  useOnClickOutside(menuRef, () => setShowMenu(false));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    addToast('Link copied to clipboard', 'success');
    setShowMenu(false);
  };

  const handleHidePost = () => {
    addToast('Post hidden from your feed', 'info');
    setShowMenu(false);
  };

  const handleReport = () => {
    addToast('Report modal would open here', 'info');
    setShowMenu(false);
  };

  return (
    <div className='post-card'>
      <div className='post-content-wrapper'>
        <UserAvatar alias={alias} />
        <div className='post-body' style={{ flex: 1 }}>
          <div className='post-header'>
            <div className='user-info'>
              <span className='alias-name' style={{ color: alias.color }}>
                {alias.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                &middot;
              </span>
              <time className='timestamp' dateTime={post.createdAt}>
                {formatTimeAgo(post.createdAt)}
              </time>
            </div>

            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                className='more-button'
                onClick={() => setShowMenu(!showMenu)}>
                <MoreHorizontal size={20} />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    className='post-menu-dropdown'
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}>
                    <button className='post-menu-item' onClick={handleCopyLink}>
                      <LinkIcon size={16} />
                      Copy Link
                    </button>
                    <button className='post-menu-item' onClick={handleHidePost}>
                      <EyeOff size={16} />
                      Hide Post
                    </button>
                    <button
                      className='post-menu-item danger'
                      onClick={handleReport}>
                      <Flag size={16} />
                      Report
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className='post-content'>{post.content}</p>

          {post.type === 'poll' && <Poll post={post} />}
        </div>
      </div>
      <div className='post-actions-wrapper'>
        <PostActions
          post={post}
          onCommentClick={() => setAreCommentsVisible(!areCommentsVisible)}
        />
      </div>

      <AnimatePresence>
        {areCommentsVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}>
            <div className='comments-wrapper'>
              <Comments
                postId={post._id}
                initialComments={post.comments || []}
                postUserId={post.userId}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostCard;

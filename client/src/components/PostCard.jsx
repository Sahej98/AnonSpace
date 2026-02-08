import React, { useState, useRef, memo } from 'react';
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
  const addToast = useToast();
  const [localVotes, setLocalVotes] = useState(null);

  const serverTotalVotes = post.pollOptions.reduce(
    (acc, opt) => acc + opt.votes.length,
    0,
  );
  const hasVotedServer = post.pollOptions.some((opt) =>
    opt.votes.includes(userId),
  );
  const hasVoted = hasVotedServer || localVotes !== null;
  const totalVotes = hasVotedServer
    ? serverTotalVotes
    : localVotes !== null
      ? serverTotalVotes + 1
      : serverTotalVotes;

  const handleVote = async (optionIndex) => {
    if (hasVoted) return;
    setLocalVotes(optionIndex);

    try {
      const res = await apiFetch(`/api/posts/${post._id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ optionIndex }),
      });
      if (!res.ok) {
        const data = await res.json();
        addToast(data.error || 'Vote failed', 'error');
        setLocalVotes(null);
      }
    } catch (e) {
      console.error(e);
      setLocalVotes(null);
    }
  };

  return (
    <div className='poll-container'>
      <span className='poll-badge'>POLL</span>
      {post.pollOptions.map((option, idx) => {
        let votesForOption = option.votes.length;
        if (localVotes === idx && !option.votes.includes(userId)) {
          votesForOption += 1;
        }

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
            style={{
              borderColor: isSelected
                ? 'var(--primary)'
                : 'var(--glass-border)',
              background: isSelected
                ? 'rgba(99, 102, 241, 0.08)'
                : 'var(--input-bg)',
            }}>
            {/* Background Bar */}
            <motion.div
              className='poll-bar'
              initial={{ width: 0 }}
              animate={{ width: hasVoted ? `${percentage}%` : '0%' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
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
          textAlign: 'right',
        }}>
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
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

  const handleReport = async () => {
    const response = await apiFetch('/api/report', {
      method: 'POST',
      body: JSON.stringify({
        targetType: 'post',
        targetId: post._id,
        reason: 'User reported via menu',
      }),
    });
    if (response.ok) addToast('Report submitted.', 'info');
    else addToast('Failed to report.', 'error');
    setShowMenu(false);
  };

  const isPoll = post.type === 'poll';

  return (
    <div className='post-card'>
      <div className='post-content-wrapper'>
        <UserAvatar alias={alias} />
        <div className='post-body' style={{ flex: 1, minWidth: 0 }}>
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
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ transformOrigin: 'top right' }}>
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

          {isPoll && <Poll post={post} />}
        </div>
      </div>

      {!isPoll && (
        <>
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
                transition={{ duration: 0.3, ease: 'easeInOut' }}>
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
        </>
      )}
    </div>
  );
};

export default memo(PostCard);

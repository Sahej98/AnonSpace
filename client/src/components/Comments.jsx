import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizontal, Smile, Reply as ReplyIcon } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { apiFetch } from '../api.js';
import { useToast } from '../hooks/useToast.js';
import CustomEmojiPicker from './CustomEmojiPicker.jsx';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';

const formatCommentTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const CommentItem = ({ comment, postId, postUserId, onReply }) => {
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className='comment-item-container'>
      <div className='comment-item'>
        <div style={{ flexShrink: 0 }}>
          <UserAvatar alias={comment.alias} size='sm' />
        </div>
        <div className='comment-bubble'>
          <div className='comment-header'>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                className='commenter-name'
                style={{ color: comment.alias?.color }}>
                {comment.alias?.name}
              </span>
              {comment.userId === postUserId && (
                <span className='op-tag'>OP</span>
              )}
            </div>
            <span className='comment-timestamp'>
              {formatCommentTime(comment.createdAt)}
            </span>
          </div>
          <p className='comment-content'>{comment.content}</p>
          <button
            className='comment-reply-button'
            onClick={() => onReply(comment._id, comment.alias?.name)}>
            Reply
          </button>
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <div className='reply-list'>
          {comment.replies.map((reply) => (
            <div key={reply._id} className='comment-item'>
              <div style={{ flexShrink: 0 }}>
                <UserAvatar alias={reply.alias} size='sm' />
              </div>
              <div
                className='comment-bubble'
                style={{ background: 'rgba(0,0,0,0.05)' }}>
                <div className='comment-header'>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      className='commenter-name'
                      style={{ color: reply.alias?.color }}>
                      {reply.alias?.name}
                    </span>
                    {reply.userId === postUserId && (
                      <span className='op-tag'>OP</span>
                    )}
                  </div>
                  <span className='comment-timestamp'>
                    {formatCommentTime(reply.createdAt)}
                  </span>
                </div>
                <p className='comment-content'>{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Comments = ({ postId, initialComments, postUserId }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // { id, name }

  const addToast = useToast();
  const formRef = useRef(null);

  useOnClickOutside(formRef, () => setShowEmoji(false));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const body = { content: newComment };
    if (replyTo) body.parentCommentId = replyTo.id;

    const response = await apiFetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (response.ok) {
      setNewComment('');
      setReplyTo(null);
      setShowEmoji(false);
    } else {
      addToast('Failed to add comment', 'error');
    }
    setIsSubmitting(false);
  };

  const handleEmojiClick = (emoji) => {
    setNewComment((prev) => prev + emoji);
    // Don't close to allow multiple emojis
  };

  const handleReply = (id, name) => {
    setReplyTo({ id, name });
    const input = document.getElementById(`comment-input-${postId}`);
    if (input) input.focus();
  };

  const isLowWidth = window.innerWidth < 412;

  return (
    <div className='comments-container'>
      {replyTo && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--primary)',
            paddingLeft: '0.5rem',
          }}>
          <ReplyIcon size={14} />
          <span>
            Replying to <strong>{replyTo.name}</strong>
          </span>
          <button
            onClick={() => setReplyTo(null)}
            style={{
              color: 'var(--text-muted)',
              marginLeft: 'auto',
              marginRight: '0.5rem',
            }}>
            Cancel
          </button>
        </div>
      )}
      <form className='comment-form' onSubmit={handleSubmit} ref={formRef}>
        <div className='comment-input-area'>
          <input
            id={`comment-input-${postId}`}
            type='text'
            className='comment-input'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'}
            autoComplete='off'
          />
          <button
            type='button'
            className='comment-action-btn'
            onClick={() => setShowEmoji(!showEmoji)}>
            <Smile size={20} />
          </button>
          <button
            type='submit'
            className='comment-action-btn'
            disabled={!newComment.trim() || isSubmitting}
            style={{
              color: newComment.trim() ? 'var(--primary)' : 'var(--text-muted)',
            }}>
            <SendHorizontal size={20} />
          </button>
        </div>
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                right: isLowWidth ? '310px':'400px',
                zIndex: 10,
                marginBottom: '0.5rem',
              }}>
              <CustomEmojiPicker onEmojiClick={handleEmojiClick} />
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      <div className='comment-list'>
        <AnimatePresence>
          {initialComments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}>
              <CommentItem
                comment={comment}
                postId={postId}
                postUserId={postUserId}
                onReply={handleReply}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Comments;

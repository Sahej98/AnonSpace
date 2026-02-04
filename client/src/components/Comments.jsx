import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizontal } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { apiFetch } from '../api.js';
import { useToast } from '../hooks/useToast.js';

const formatCommentTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Comments = ({ postId, initialComments, postUserId }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const response = await apiFetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content: newComment }),
    });

    if (response.ok) {
      setNewComment('');
    } else {
      addToast('Failed to add comment', 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className='comments-container'>
      <form className='comment-form' onSubmit={handleSubmit}>
        <input
          type='text'
          className='comment-input'
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder='Add a comment...'
        />
        <button
          type='submit'
          className='send-button'
          disabled={!newComment.trim() || isSubmitting}>
          <SendHorizontal size={18} />
        </button>
      </form>
      <div className='comment-list'>
        <AnimatePresence>
          {initialComments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}>
              <div className='comment-item'>
                <UserAvatar alias={comment.alias} size='sm' />
                <div className='comment-bubble'>
                  <div className='comment-header'>
                    <span
                      className='commenter-name'
                      style={{ color: comment.alias?.color }}>
                      {comment.alias?.name}
                    </span>
                    {comment.userId === postUserId && (
                      <span className='op-tag'>OP</span>
                    )}
                    <span className='comment-timestamp'>
                      {formatCommentTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className='comment-content'>{comment.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Comments;

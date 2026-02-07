import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { apiFetch } from '../api.js';
import { useToast } from '../hooks/useToast.js';

const PostActions = ({ post, onCommentClick }) => {
  const addToast = useToast();

  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDislikes] = useState(post.dislikes || 0);
  const [hasLiked, setHasLiked] = useState(post.hasLiked || false);
  const [hasDisliked, setHasDisliked] = useState(post.hasDisliked || false);

  useEffect(() => {
    setLikes(post.likes);
    setDislikes(post.dislikes || 0);
    setHasLiked(post.hasLiked || false);
    setHasDisliked(post.hasDisliked || false);
  }, [post]);

  const handleReaction = async (type) => {
    const isLike = type === 'like';

    // Optimistic Update
    if (isLike) {
      if (hasLiked) {
        setHasLiked(false);
        setLikes((prev) => prev - 1);
      } else {
        setHasLiked(true);
        setLikes((prev) => prev + 1);
        if (hasDisliked) {
          setHasDisliked(false);
          setDislikes((prev) => prev - 1);
        }
      }
    } else {
      if (hasDisliked) {
        setHasDisliked(false);
        setDislikes((prev) => prev - 1);
      } else {
        setHasDisliked(true);
        setDislikes((prev) => prev + 1);
        if (hasLiked) {
          setHasLiked(false);
          setLikes((prev) => prev - 1);
        }
      }
    }

    try {
      const response = await apiFetch(`/api/posts/${post._id}/reaction`, {
        method: 'POST',
        body: JSON.stringify({ reactionType: type }),
      });
      if (!response.ok) throw new Error();
    } catch (error) {
      // Revert if failed (simplified revert, ideally reload post)
      addToast('Action failed', 'error');
    }
  };

  return (
    <div className='actions-container'>
      <button
        className='action-button like-button'
        onClick={() => handleReaction('like')}
        style={{ color: hasLiked ? 'var(--primary)' : 'inherit' }}>
        <ThumbsUp size={16} fill={hasLiked ? 'currentColor' : 'none'} />
        <span>{likes}</span>
      </button>

      <button
        className='action-button dislike-button'
        onClick={() => handleReaction('dislike')}
        style={{ color: hasDisliked ? 'var(--accent-red)' : 'inherit' }}>
        <ThumbsDown size={16} fill={hasDisliked ? 'currentColor' : 'none'} />
        <span>{dislikes}</span>
      </button>

      <button className='action-button comment-button' onClick={onCommentClick}>
        <MessageSquare size={16} />
        <span>{post.comments?.length || 0}</span>
      </button>
    </div>
  );
};

export default PostActions;

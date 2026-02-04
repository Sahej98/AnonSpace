import React, { useOptimistic } from 'react';
import { ThumbsUp, MessageSquare, Flag } from 'lucide-react';
import { apiFetch } from '../api.js';
import { useToast } from '../hooks/useToast.js';

const PostActions = ({ post, onCommentClick }) => {
  const addToast = useToast();

  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    post.likes,
    (state) => state + 1,
  );

  const triggerConfetti = (e) => {
    // Simple particle burst using CSS/DOM
    const rect = e.target.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'fixed';
      particle.style.left = rect.left + rect.width / 2 + 'px';
      particle.style.top = rect.top + rect.height / 2 + 'px';
      particle.style.width = '6px';
      particle.style.height = '6px';
      particle.style.background = ['#6366f1', '#10b981', '#ef4444', '#f59e0b'][
        Math.floor(Math.random() * 4)
      ];
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '9999';
      document.body.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 4;
      const tx = Math.cos(angle) * 50 * Math.random();
      const ty = Math.sin(angle) * 50 * Math.random() - 20;

      particle.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 },
        ],
        {
          duration: 600 + Math.random() * 200,
          easing: 'cubic-bezier(0, .9, .57, 1)',
        },
      ).onfinish = () => particle.remove();
    }
  };

  const handleLike = (e) => {
    setOptimisticLikes(post.likes + 1);
    triggerConfetti(e);
    apiFetch(`/api/posts/${post._id}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ reactionType: 'like' }),
    });
  };

  const handleReport = async () => {
    const payload = {
      targetType: 'post',
      targetId: post._id,
      reason: 'User reported content.',
    };
    const response = await apiFetch('/api/report', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      addToast('Content has been reported.', 'success');
    } else {
      const data = await response.json();
      addToast(data.error || 'Failed to report content.', 'error');
    }
  };

  return (
    <div className='actions-container'>
      <button
        className='action-button like-button'
        onClick={handleLike}
        aria-label='Like'>
        <ThumbsUp size={16} />
        <span>{optimisticLikes}</span>
      </button>
      <button
        className='action-button comment-button'
        onClick={onCommentClick}
        aria-label='Comment'>
        <MessageSquare size={16} />
        <span>{post.comments?.length || 0}</span>
      </button>
      <button
        className='action-button report-button'
        onClick={handleReport}
        aria-label='Report'>
        <Flag size={16} />
        <span>Report</span>
      </button>
    </div>
  );
};

export default PostActions;

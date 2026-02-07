import React, { useState } from 'react';
import PostModal from './PostModal';
import { apiFetch } from '../api';
import { Edit3 } from 'lucide-react';

const FeedHeader = () => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handleAddPost = async (content, tags, type, pollOptions) => {
    try {
      const body = { content, tags, type };
      if (type === 'poll') body.pollOptions = pollOptions;

      const response = await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit post');
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to add post:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <>
      <div className='feed-header'>
        <div className='feed-header-left'>
          <h1 className='feed-header-title'>The Void</h1>
          <p className='feed-header-subtitle'>
            Speak freely. Your secrets are safe here.
          </p>
        </div>
        <button
          className='confess-button'
          onClick={() => setIsPostModalOpen(true)}>
          <Edit3 size={18} />
          <span>Whisper</span>
        </button>
      </div>
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onAddPost={handleAddPost}
      />
    </>
  );
};

export default FeedHeader;

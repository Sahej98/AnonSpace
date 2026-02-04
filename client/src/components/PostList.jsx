import React from 'react';
import PostCard from './PostCard.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import SkeletonCard from './SkeletonCard.jsx';
import { LoaderCircle } from 'lucide-react';

const PostList = ({ posts, status, lastPostRef }) => {
  if (status === 'loading') {
    return (
      <div className='post-list-wrapper'>
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (status === 'error' && posts.length === 0) {
    return (
      <div className='status-message error'>
        Failed to load whispers. Please try again later.
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className='status-message'>
        The air is quiet... be the first to whisper.
      </div>
    );
  }

  return (
    <>
      <div className='post-list-wrapper'>
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              ref={index === posts.length - 1 ? lastPostRef : null}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}>
              <PostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {status === 'loading-more' && (
        <div className='loader-wrapper'>
          <LoaderCircle
            style={{
              animation: 'spin 1s linear infinite',
              color: 'var(--primary)',
            }}
            size={32}
          />
        </div>
      )}

      {status !== 'loading' && posts.length > 0 && (
        <p className='footer-message'>
          No usernames. No history. Just thoughts.
        </p>
      )}
    </>
  );
};

export default PostList;

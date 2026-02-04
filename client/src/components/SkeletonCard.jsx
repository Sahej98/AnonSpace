import React from 'react';

const SkeletonCard = () => {
  return (
    <div className='skeleton-card'>
      <div className='skeleton-content'>
        <div className='skeleton-avatar' />
        <div className='skeleton-body'>
          <div className='skeleton-line' style={{ width: '40%' }} />
          <div className='skeleton-line' style={{ width: '90%' }} />
          <div className='skeleton-line' style={{ width: '75%' }} />
        </div>
      </div>
      <div className='skeleton-actions'>
        <div className='skeleton-line' style={{ width: '2.5rem' }} />
        <div className='skeleton-line' style={{ width: '2.5rem' }} />
        <div className='skeleton-line' style={{ width: '5rem' }} />
      </div>
    </div>
  );
};

export default SkeletonCard;

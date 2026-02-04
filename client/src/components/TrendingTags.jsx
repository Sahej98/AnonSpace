import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api.js';
import { Hash } from 'lucide-react';

const TrendingTags = () => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch('/api/tags/trending');
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error('Failed to fetch trending tags:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const renderSkeletons = () => (
    <div className='tags-container'>
      <div
        className='skeleton-tag'
        style={{
          width: '5rem',
          height: '28px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '999px',
        }}
      />
      <div
        className='skeleton-tag'
        style={{
          width: '7rem',
          height: '28px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '999px',
        }}
      />
      <div
        className='skeleton-tag'
        style={{
          width: '4rem',
          height: '28px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '999px',
        }}
      />
    </div>
  );

  if (tags.length === 0 && !isLoading) return null;

  return (
    <div className='card'>
      <div className='card-header'>
        <div className='card-title'>
          <div className='card-icon-wrapper'>
            <Hash size={18} />
          </div>
          <span>Trending</span>
        </div>
      </div>
      {isLoading ? (
        renderSkeletons()
      ) : (
        <div className='tags-container'>
          {tags.map((tag) => (
            <Link
              key={tag}
              to={`/tag/${tag.substring(1)}`}
              className='tag-link'>
              {tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingTags;

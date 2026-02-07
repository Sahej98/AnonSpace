import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostList from '../components/PostList.jsx';
import { useSocket } from '../contexts/SocketContext.jsx';
import { apiFetch } from '../api.js';
import FeedHeader from '../components/FeedHeader.jsx';
import { ArrowUp, Flame, Clock, Star, X } from 'lucide-react';

const POSTS_PER_PAGE = 10;
const POPULAR_TAGS = [
  'Relationships',
  'Funny',
  'School',
  'Confessions',
  'Advice',
  'Random',
  'Gaming',
  'Music',
  'Tech',
  'Politics',
  'Sports',
  'Art',
  'Books',
];

const Home = () => {
  const [activeTab, setActiveTab] = useState('hot');
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { tagName } = useParams();
  const socket = useSocket();
  const observer = useRef();
  const scrollContainerRef = useRef(null);
  const tagsContainerRef = useRef(null);
  const navigate = useNavigate();

  const applyHotSort = (postsToSort) => {
    return [...postsToSort].sort((a, b) => {
      const hotnessA =
        (a.likes + 1) /
        Math.pow((new Date() - new Date(a.createdAt)) / 3600000 + 2, 1.8);
      const hotnessB =
        (b.likes + 1) /
        Math.pow((new Date() - new Date(b.createdAt)) / 3600000 + 2, 1.8);
      return hotnessB - hotnessA;
    });
  };

  const fetchPosts = useCallback(
    async (offset = 0) => {
      setStatus(offset === 0 ? 'loading' : 'loading-more');
      try {
        const apiSort = activeTab === 'hot' ? 'newest' : activeTab;
        const tagQuery = tagName ? `&tag=${tagName}` : '';
        const response = await apiFetch(
          `/api/posts?sort=${apiSort}&offset=${offset}&limit=${POSTS_PER_PAGE}${tagQuery}`,
        );
        if (!response.ok) throw new Error('Network response was not ok');

        const { posts: newPosts, hasMore: newHasMore } = await response.json();

        setPosts((prev) => {
          const combined = offset === 0 ? newPosts : [...prev, ...newPosts];
          return activeTab === 'hot' ? applyHotSort(combined) : combined;
        });

        setHasMore(newHasMore);
        setStatus('success');
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setStatus('error');
      }
    },
    [tagName, activeTab],
  );

  useEffect(() => {
    setPosts([]);
    fetchPosts(0);
  }, [fetchPosts]);

  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (newPost) => {
      if (!tagName || newPost.tags?.includes(`#${tagName}`)) {
        setPosts((prev) => {
          const newPosts = [newPost, ...prev];
          return activeTab === 'hot'
            ? applyHotSort(newPosts)
            : activeTab === 'newest'
              ? newPosts
              : prev;
        });
      }
    };

    const handleUpdatePost = (updatedPost) => {
      setPosts((prev) => {
        const newPosts = prev.map((p) =>
          p._id === updatedPost._id ? updatedPost : p,
        );
        return activeTab === 'hot' ? applyHotSort(newPosts) : newPosts;
      });
    };

    const handleRemovePost = ({ postId }) => {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    socket.on('new_post', handleNewPost);
    socket.on('update_post', handleUpdatePost);
    socket.on('remove_post', handleRemovePost);

    return () => {
      socket.off('new_post', handleNewPost);
      socket.off('update_post', handleUpdatePost);
      socket.off('remove_post', handleRemovePost);
    };
  }, [socket, tagName, activeTab]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (status === 'loading-more' || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPosts(posts.length);
        }
      });
      if (node) observer.current.observe(node);
    },
    [status, hasMore, posts.length, fetchPosts],
  );

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    setShowScrollTop(scrollTop > 300);
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleTagsWheel = (e) => {
    if (tagsContainerRef.current) {
      tagsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      className='scrollable-feed-content'
      ref={scrollContainerRef}
      onScroll={handleScroll}>
      <FeedHeader />

      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--glass-border)',
          padding: '0 0.5rem 0.5rem',
        }}>
        <button
          onClick={() => handleTabChange('hot')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: activeTab === 'hot' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'hot' ? 700 : 500,
            borderBottom:
              activeTab === 'hot'
                ? '2px solid var(--primary)'
                : '2px solid transparent',
            paddingBottom: '0.5rem',
            marginBottom: '-0.6rem',
            transition: 'all 0.2s',
          }}>
          <Flame size={18} /> Trending
        </button>
        <button
          onClick={() => handleTabChange('newest')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color:
              activeTab === 'newest' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'newest' ? 700 : 500,
            borderBottom:
              activeTab === 'newest'
                ? '2px solid var(--primary)'
                : '2px solid transparent',
            paddingBottom: '0.5rem',
            marginBottom: '-0.6rem',
            transition: 'all 0.2s',
          }}>
          <Clock size={18} /> Latest
        </button>
        <button
          onClick={() => handleTabChange('top')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: activeTab === 'top' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'top' ? 700 : 500,
            borderBottom:
              activeTab === 'top'
                ? '2px solid var(--primary)'
                : '2px solid transparent',
            paddingBottom: '0.5rem',
            marginBottom: '-0.6rem',
            transition: 'all 0.2s',
          }}>
          <Star size={18} /> Top
        </button>
      </div>

      <div
        className='tag-filters-row'
        ref={tagsContainerRef}
        onWheel={handleTagsWheel}>
        {tagName && (
          <button
            className='tag-filter-btn active'
            onClick={() => navigate('/')}>
            #{tagName} <X size={14} />
          </button>
        )}
        {POPULAR_TAGS.map(
          (tag) =>
            tag !== tagName && (
              <button
                key={tag}
                className='tag-filter-btn'
                onClick={() => navigate(`/tag/${tag}`)}>
                #{tag}
              </button>
            ),
        )}
      </div>

      <PostList
        posts={posts}
        status={status}
        lastPostRef={lastPostElementRef}
      />

      {showScrollTop && (
        <button className='scroll-top-btn' onClick={scrollToTop}>
          <ArrowUp size={16} />
          <span>Top</span>
        </button>
      )}
    </div>
  );
};

export default Home;

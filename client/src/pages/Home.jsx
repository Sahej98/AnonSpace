import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PostList from '../components/PostList.jsx';
import { useSocket } from '../contexts/SocketContext.jsx';
import { apiFetch } from '../api.js';
import FeedHeader from '../components/FeedHeader.jsx';
import { ArrowUp } from 'lucide-react';

const POSTS_PER_PAGE = 10;

const Home = ({ sortOrder }) => {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { tagName } = useParams();
  const socket = useSocket();
  const observer = useRef();
  const scrollContainerRef = useRef(null);

  const applyHotSort = (postsToSort) => {
    return [...postsToSort].sort((a, b) => {
      const hotnessA =
        a.likes /
        Math.pow((new Date() - new Date(a.createdAt)) / 3600000 + 2, 1.8);
      const hotnessB =
        b.likes /
        Math.pow((new Date() - new Date(b.createdAt)) / 3600000 + 2, 1.8);
      return hotnessB - hotnessA;
    });
  };

  const fetchPosts = useCallback(
    async (offset = 0) => {
      setStatus(offset === 0 ? 'loading' : 'loading-more');
      try {
        const apiSort = sortOrder === 'hot' ? 'newest' : sortOrder;
        const tagQuery = tagName ? `&tag=${tagName}` : '';
        const response = await apiFetch(
          `/api/posts?sort=${apiSort}&offset=${offset}&limit=${POSTS_PER_PAGE}${tagQuery}`,
        );
        if (!response.ok) throw new Error('Network response was not ok');

        const { posts: newPosts, hasMore: newHasMore } = await response.json();

        setPosts((prev) => {
          const combined = offset === 0 ? newPosts : [...prev, ...newPosts];
          return sortOrder === 'hot' ? applyHotSort(combined) : combined;
        });

        setHasMore(newHasMore);
        setStatus('success');
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setStatus('error');
      }
    },
    [tagName, sortOrder],
  );

  useEffect(() => {
    setPosts([]);
    fetchPosts(0);
  }, [fetchPosts, sortOrder]);

  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (newPost) => {
      if (!tagName || newPost.tags?.includes(`#${tagName}`)) {
        setPosts((prev) => {
          const newPosts = [newPost, ...prev];
          return sortOrder === 'hot' ? applyHotSort(newPosts) : newPosts;
        });
      }
    };

    const handleUpdatePost = (updatedPost) => {
      setPosts((prev) => {
        const newPosts = prev.map((p) =>
          p._id === updatedPost._id ? updatedPost : p,
        );
        return sortOrder === 'hot' ? applyHotSort(newPosts) : newPosts;
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
  }, [socket, tagName, sortOrder]);

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

  // Handle Scroll to Top Visibility
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    setShowScrollTop(scrollTop > 300);
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className='scrollable-feed-content'
      ref={scrollContainerRef}
      onScroll={handleScroll}>
      <FeedHeader />
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

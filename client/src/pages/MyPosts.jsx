import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';
import { Edit2, Trash2, Archive, LoaderCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast.js';
import PostCard from '../components/PostCard.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const addToast = useToast();

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const res = await apiFetch('/api/my-posts');
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await apiFetch(`/api/posts/${id}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p._id !== id));
      addToast('Post deleted', 'success');
    } catch (e) {
      addToast('Failed to delete', 'error');
    }
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setEditContent(post.content);
  };

  const saveEdit = async (id) => {
    try {
      const res = await apiFetch(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ content: editContent }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, content: editContent } : p)),
        );
        setEditingId(null);
        addToast('Post updated', 'success');
      }
    } catch (e) {
      addToast('Update failed', 'error');
    }
  };

  if (loading)
    return (
      <div className='loader-wrapper'>
        <LoaderCircle className='styled-loader' size={32} />
      </div>
    );

  return (
    <div className='centered-page-container'>
      <h1 className='feed-header-title' style={{ marginBottom: '1.5rem' }}>
        My Activity
      </h1>

      {posts.length === 0 ? (
        <div
          className='card'
          style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Archive size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>You haven't posted anything yet.</p>
        </div>
      ) : (
        <div className='post-list-wrapper'>
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}>
                <div className='post-card' style={{ marginBottom: '1rem' }}>
                  {editingId === post._id ? (
                    <div style={{ padding: '1rem' }}>
                      <textarea
                        className='styled-textarea'
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                          justifyContent: 'flex-end',
                        }}>
                        <button
                          className='cancel-button'
                          onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                        <button
                          className='submit-button'
                          onClick={() => saveEdit(post._id)}>
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          padding: '1rem',
                          borderBottom: '1px solid var(--glass-border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-dim)',
                          }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => startEdit(post)}>
                            <Edit2 size={16} color='var(--text-muted)' />
                          </button>
                          <button onClick={() => handleDelete(post._id)}>
                            <Trash2 size={16} color='var(--accent-red)' />
                          </button>
                        </div>
                      </div>
                      <div
                        style={{ padding: '1rem', color: 'var(--text-main)' }}>
                        {post.content}
                      </div>
                      <div
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'var(--glass-highlight)',
                          fontSize: '0.8rem',
                          color: 'var(--text-dim)',
                        }}>
                        {post.likes} Likes • {post.comments?.length || 0}{' '}
                        Comments
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MyPosts;

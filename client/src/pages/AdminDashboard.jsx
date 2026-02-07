import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import {
  ShieldAlert,
  Users,
  Ban,
  Clock,
  CheckCircle,
  Trash2,
  RotateCcw,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '../hooks/useToast.js';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    userCount: 0,
    postCount: 0,
    reportCount: 0,
  });

  // User Detail View State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState({ posts: [], comments: [] });
  const [loadingHistory, setLoadingHistory] = useState(false);

  const addToast = useToast();

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users' && !selectedUser) fetchUsers();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab, selectedUser]);

  const fetchStats = async () => {
    try {
      const res = await apiFetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) {}
  };

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/api/admin/users');
      if (res.ok) setUsers(await res.json());
    } catch (e) {}
  };

  const fetchReports = async () => {
    try {
      const res = await apiFetch('/api/admin/reports');
      if (res.ok) setReports(await res.json());
    } catch (e) {}
  };

  const fetchUserHistory = async (userId) => {
    setLoadingHistory(true);
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/history`);
      if (res.ok) setUserHistory(await res.json());
    } catch (e) {
      addToast('Failed to fetch history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchUserHistory(user._id);
  };

  const handleUserAction = async (userId, action) => {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        addToast(`Action ${action} successful`, 'success');
        // Update local state if needed
        if (selectedUser && selectedUser._id === userId) {
          // simplistic toggle for UI update
          const updated = await res.json();
          setSelectedUser(updated);
        } else {
          fetchUsers();
        }
      }
    } catch (e) {
      addToast('Action failed', 'error');
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      const res = await apiFetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
      });
      if (res.ok) {
        addToast('Report resolved', 'success');
        fetchReports();
      }
    } catch (e) {
      addToast('Failed', 'error');
    }
  };

  const handleDeleteContent = async (type, id, reportId = null) => {
    // Currently only post deletion is fully supported via API for admin,
    // ensuring 'type' is handled correctly.
    if (type === 'post') {
      try {
        await apiFetch(`/api/posts/${id}`, { method: 'DELETE' });
        if (reportId) await handleResolveReport(reportId);

        // Update local history if viewing specific user
        if (selectedUser) {
          setUserHistory((prev) => ({
            ...prev,
            posts: prev.posts.filter((p) => p._id !== id),
          }));
        }

        addToast('Content deleted', 'success');
      } catch (e) {
        addToast('Failed to delete content', 'error');
      }
    } else {
      addToast('Deletion only supported for posts currently', 'info');
    }
  };

  if (selectedUser) {
    return (
      <div className='centered-page-container full-width'>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            width: '100%',
          }}>
          <button onClick={() => setSelectedUser(null)} className='icon-button'>
            <ArrowLeft size={24} />
          </button>
          <h1 className='feed-header-title' style={{ margin: 0 }}>
            User Details
          </h1>
        </div>

        <div className='card' style={{ marginBottom: '2rem', width: '100%' }}>
          <div className='card-header'>
            <div className='card-title'>
              <span style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                {selectedUser._id}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {selectedUser.isBanned && (
              <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>
                BANNED
              </span>
            )}
            {selectedUser.isTimedOut && (
              <span style={{ color: 'orange', fontWeight: 'bold' }}>
                TIMED OUT
              </span>
            )}
            <span style={{ color: 'var(--text-dim)' }}>
              Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {selectedUser.isBanned ? (
              <button
                className='action-button'
                onClick={() => handleUserAction(selectedUser._id, 'unban')}
                style={{ color: 'var(--accent-green)' }}>
                <RotateCcw size={16} /> Unban
              </button>
            ) : (
              <button
                className='action-button danger'
                onClick={() => handleUserAction(selectedUser._id, 'ban')}>
                <Ban size={16} /> Ban User
              </button>
            )}
            {selectedUser.isTimedOut ? (
              <button
                className='action-button'
                onClick={() =>
                  handleUserAction(selectedUser._id, 'remove_timeout')
                }
                style={{ color: 'var(--accent-green)' }}>
                <Clock size={16} /> Remove Timeout
              </button>
            ) : (
              <button
                className='action-button'
                onClick={() => handleUserAction(selectedUser._id, 'timeout')}
                style={{ color: 'orange' }}>
                <Clock size={16} /> Timeout 24h
              </button>
            )}
          </div>
        </div>

        <div style={{ width: '100%' }}>
          <h2
            className='feed-header-subtitle'
            style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            User History
          </h2>
          {loadingHistory ? (
            <p className='muted-text'>Loading history...</p>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: 'var(--primary)',
                  }}>
                  Recent Posts ({userHistory.posts.length})
                </h3>
                {userHistory.posts.length === 0 && (
                  <p className='muted-text'>No posts found.</p>
                )}
                {userHistory.posts.map((post) => (
                  <div
                    key={post._id}
                    className='card'
                    style={{ padding: '1rem', marginBottom: '0.5rem' }}>
                    <div
                      style={{
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
                      <button
                        className='icon-button'
                        onClick={() => handleDeleteContent('post', post._id)}
                        style={{ color: 'var(--accent-red)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p style={{ marginTop: '0.5rem' }}>{post.content}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: 'var(--accent-green)',
                  }}>
                  Recent Comments ({userHistory.comments.length})
                </h3>
                {userHistory.comments.length === 0 && (
                  <p className='muted-text'>No comments found.</p>
                )}
                {userHistory.comments.map((comment) => (
                  <div
                    key={comment._id}
                    className='card'
                    style={{
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      borderLeft: '3px solid var(--accent-green)',
                    }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-dim)',
                        marginBottom: '0.25rem',
                      }}>
                      On Post: {comment.postContent?.substring(0, 30)}...
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='centered-page-container full-width'>
      <h1 className='feed-header-title'>Admin Dashboard</h1>

      <div
        className='admin-stats-row'
        style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className='card' style={{ flex: 1, textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>
            {stats.userCount}
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>Users</p>
        </div>
        <div className='card' style={{ flex: 1, textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>
            {stats.postCount}
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>Posts</p>
        </div>
        <div className='card' style={{ flex: 1, textAlign: 'center' }}>
          <h3
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--accent-red)',
            }}>
            {stats.reportCount}
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>Reports</p>
        </div>
      </div>

      <div
        className='tabs'
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--glass-border)',
          marginBottom: '1.5rem',
        }}>
        <button
          className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.5rem 1rem',
            borderBottom:
              activeTab === 'users' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
          }}>
          <Users size={18} />
          <span>User Management</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '0.5rem 1rem',
            borderBottom:
              activeTab === 'reports' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
          }}>
          <ShieldAlert size={18} />
          <span>Report Management</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <div
          className='users-list'
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {users.map((u) => (
            <div
              key={u._id}
              className='card'
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                cursor: 'pointer',
              }}
              onClick={() => handleUserSelect(u)}>
              <div>
                <code style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>
                  {u._id}
                </code>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    marginTop: '0.2rem',
                  }}>
                  {u.isAdmin && <span style={{ color: 'gold' }}>ADMIN</span>}
                  {u.isBanned && (
                    <span style={{ color: 'var(--accent-red)' }}>BANNED</span>
                  )}
                  {u.isTimedOut && (
                    <span style={{ color: 'orange' }}>TIMED OUT</span>
                  )}
                  <span style={{ color: 'var(--text-dim)' }}>
                    Joined: {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className='icon-button'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserSelect(u);
                  }}>
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div
          className='reports-list'
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.length === 0 && (
            <p className='muted-text'>No pending reports.</p>
          )}
          {reports.map((r) => (
            <div key={r._id} className='card' style={{ padding: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}>
                <span style={{ fontWeight: 600, color: 'var(--accent-red)' }}>
                  REPORT: {r.targetType.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Reason: {r.reason}
              </p>
              <p
                style={{
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  background: 'var(--input-bg)',
                  padding: '0.5rem',
                }}>
                Target ID: {r.targetId}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  borderTop: '1px solid var(--glass-border)',
                  paddingTop: '0.5rem',
                }}>
                <button
                  className='action-button'
                  onClick={() => handleResolveReport(r._id)}>
                  <CheckCircle size={16} /> Dismiss
                </button>
                <button
                  className='action-button danger'
                  style={{ color: 'var(--accent-red)' }}
                  onClick={() =>
                    handleDeleteContent(r.targetType, r.targetId, r._id)
                  }>
                  <Trash2 size={16} /> Delete Content
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

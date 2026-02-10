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
  Shield,
  Skull,
  Bug,
} from 'lucide-react';
import { useToast } from '../hooks/useToast.js';
import { useDialog } from '../hooks/useDialog.js';
import { useUser } from '../contexts/UserContext.jsx';

const AdminDashboard = () => {
  const { isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState(isAdmin ? 'users' : 'reports');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState([]);
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
  const dialog = useDialog();

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users' && !selectedUser && isAdmin) fetchUsers();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'feedback') fetchFeedback();
  }, [activeTab, selectedUser, isAdmin]);

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

  const fetchFeedback = async () => {
    try {
      const res = await apiFetch('/api/admin/feedback');
      if (res.ok) setFeedback(await res.json());
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

  const handleUserAction = async (userId, action, description) => {
    const confirmed = await dialog.confirm(
      description || `Are you sure you want to perform: ${action}?`,
      {
        title: 'Confirm Action',
        isDanger: ['ban', 'demote_mod', 'delete'].includes(action),
      },
    );
    if (!confirmed) return;

    try {
      const res = await apiFetch(`/api/admin/users/${userId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        addToast(`Action successful`, 'success');
        // Update local state
        if (selectedUser && selectedUser._id === userId) {
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

  const handleDeleteUser = async (userId) => {
    const confirmed = await dialog.confirm(
      `PERMANENTLY DELETE USER ${userId}? This will remove the user and ALL their posts. This cannot be undone.`,
      { title: 'Delete User', confirmText: 'DELETE', isDanger: true },
    );
    if (!confirmed) return;

    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      addToast('User deleted successfully', 'success');
      setSelectedUser(null);
      fetchUsers();
    } catch (e) {
      addToast('Delete failed', 'error');
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
    if (type === 'post') {
      const confirmed = await dialog.confirm('Delete this post permanently?', {
        isDanger: true,
      });
      if (!confirmed) return;

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

  const handleDeleteFeedback = async (id) => {
    try {
      await apiFetch(`/api/admin/feedback/${id}/delete`, { method: 'POST' });
      setFeedback((prev) => prev.filter((f) => f._id !== id));
      addToast('Feedback deleted', 'success');
    } catch (e) {
      addToast('Failed to delete', 'error');
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
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1rem',
              flexWrap: 'wrap',
            }}>
            {selectedUser.isAdmin && (
              <span style={{ color: 'gold', fontWeight: 'bold' }}>ADMIN</span>
            )}
            {selectedUser.isModerator && (
              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                MODERATOR
              </span>
            )}
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

          {/* Admin Actions Only */}
          {isAdmin && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {selectedUser.isModerator ? (
                <button
                  className='action-button danger'
                  onClick={() =>
                    handleUserAction(
                      selectedUser._id,
                      'demote_mod',
                      'Remove moderator privileges?',
                    )
                  }>
                  <Shield size={16} /> Demote Mod
                </button>
              ) : (
                <button
                  className='action-button'
                  onClick={() =>
                    handleUserAction(
                      selectedUser._id,
                      'promote_mod',
                      'Make this user a Moderator?',
                    )
                  }>
                  <Shield size={16} /> Make Mod
                </button>
              )}

              <div
                style={{
                  width: 1,
                  background: 'var(--glass-border)',
                  margin: '0 0.5rem',
                }}
              />

              {selectedUser.isBanned ? (
                <button
                  className='action-button'
                  onClick={() =>
                    handleUserAction(
                      selectedUser._id,
                      'unban',
                      'Unban this user?',
                    )
                  }
                  style={{ color: 'var(--accent-green)' }}>
                  <RotateCcw size={16} /> Unban
                </button>
              ) : (
                <button
                  className='action-button danger'
                  onClick={() =>
                    handleUserAction(
                      selectedUser._id,
                      'ban',
                      'Ban this user? They will lose access immediately.',
                    )
                  }>
                  <Ban size={16} /> Ban User
                </button>
              )}

              {selectedUser.isTimedOut ? (
                <button
                  className='action-button'
                  onClick={() =>
                    handleUserAction(
                      selectedUser._id,
                      'remove_timeout',
                      'Remove timeout?',
                    )
                  }
                  style={{ color: 'var(--accent-green)' }}>
                  <Clock size={16} /> Remove Timeout
                </button>
              ) : (
                <button
                  className='action-button'
                  onClick={() =>
                    handleUserAction(
                      selectedUser._id,
                      'timeout',
                      'Timeout user for 24 hours?',
                    )
                  }
                  style={{ color: 'orange' }}>
                  <Clock size={16} /> Timeout 24h
                </button>
              )}

              <div
                style={{
                  width: 1,
                  background: 'var(--glass-border)',
                  margin: '0 0.5rem',
                }}
              />

              <button
                className='action-button danger'
                onClick={() => handleDeleteUser(selectedUser._id)}
                style={{ color: 'var(--accent-red)' }}>
                <Skull size={16} /> DELETE USER
              </button>
            </div>
          )}
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
                    <p
                      style={{ marginTop: '0.5rem' }}
                      className='formatted-content'>
                      {post.content}
                    </p>
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
                    <p className='formatted-content'>{comment.content}</p>
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
        {isAdmin && (
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
            <span>Users</span>
          </button>
        )}
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
          <span>Reports</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
          style={{
            padding: '0.5rem 1rem',
            borderBottom:
              activeTab === 'feedback' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
          }}>
          <Bug size={18} />
          <span>Feedback</span>
        </button>
      </div>

      {activeTab === 'users' && isAdmin && (
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
                  {u.isModerator && (
                    <span style={{ color: '#3b82f6' }}>MOD</span>
                  )}
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

              <div
                style={{
                  background: 'var(--input-bg)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid var(--glass-border)',
                }}>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.3rem',
                  }}>
                  Content Preview:
                </p>
                <p
                  style={{
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    color: 'var(--text-main)',
                  }}
                  className='formatted-content'>
                  "{r.contentSnapshot}"
                </p>
                <p
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    color: 'var(--text-dim)',
                  }}>
                  ID: {r.targetId}
                </p>
              </div>

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

      {activeTab === 'feedback' && (
        <div
          className='feedback-list'
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {feedback.length === 0 && (
            <p className='muted-text'>No feedback received.</p>
          )}
          {feedback.map((f) => (
            <div key={f._id} className='card' style={{ padding: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  FEEDBACK / BUG
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {new Date(f.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className='formatted-content' style={{ marginBottom: '1rem' }}>
                {f.content}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid var(--glass-border)',
                  paddingTop: '0.5rem',
                }}>
                <button
                  className='icon-button'
                  onClick={() => handleDeleteFeedback(f._id)}
                  style={{ color: 'var(--accent-red)' }}>
                  <Trash2 size={18} />
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

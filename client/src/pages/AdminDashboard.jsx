import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api.js';
import {
  ShieldAlert,
  Users,
  Ban,
  Clock,
  CheckCircle,
  Trash2,
  RotateCcw,
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
  const addToast = useToast();

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

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

  const handleUserAction = async (userId, action) => {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        addToast(`Action ${action} successful`, 'success');
        fetchUsers();
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

  const handleDeleteContent = async (type, id, reportId) => {
    if (type === 'post') {
      try {
        await apiFetch(`/api/posts/${id}`, { method: 'DELETE' });
        await handleResolveReport(reportId);
        addToast('Content deleted & report resolved', 'success');
      } catch (e) {
        addToast('Failed to delete content', 'error');
      }
    } else {
      addToast('Deletion only supported for posts currently', 'info');
    }
  };

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
              }}>
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
                {u.isBanned ? (
                  <button
                    className='icon-button'
                    onClick={() => handleUserAction(u._id, 'unban')}
                    title='Unban'>
                    <RotateCcw size={18} color='var(--accent-green)' />
                  </button>
                ) : (
                  <button
                    className='icon-button'
                    onClick={() => handleUserAction(u._id, 'ban')}
                    title='Ban'>
                    <Ban size={18} color='var(--accent-red)' />
                  </button>
                )}

                {u.isTimedOut ? (
                  <button
                    className='icon-button'
                    onClick={() => handleUserAction(u._id, 'remove_timeout')}
                    title='Remove Timeout'>
                    <Clock size={18} color='var(--accent-green)' />
                  </button>
                ) : (
                  <button
                    className='icon-button'
                    onClick={() => handleUserAction(u._id, 'timeout')}
                    title='Timeout 24h'>
                    <Clock size={18} color='orange' />
                  </button>
                )}
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

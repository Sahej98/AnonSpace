import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { ArrowLeft, Plus, Trash2, Calendar } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';

const Changelog = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const addToast = useToast();
  const dialog = useDialog();

  // Admin State
  const [newVersion, setNewVersion] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await apiFetch('/api/changelog');
      if (res.ok) setLogs(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newVersion.trim() || !newContent.trim()) return;

    try {
      const res = await apiFetch('/api/admin/changelog', {
        method: 'POST',
        body: JSON.stringify({ version: newVersion, content: newContent }),
      });
      if (res.ok) {
        const log = await res.json();
        setLogs([log, ...logs]);
        setNewVersion('');
        setNewContent('');
        setIsAdding(false);
        addToast('Log added', 'success');
      }
    } catch (e) {
      addToast('Failed to add log', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await dialog.confirm('Delete this changelog entry?', {
      isDanger: true,
    });
    if (!confirmed) return;

    try {
      await apiFetch(`/api/admin/changelog/${id}`, { method: 'DELETE' });
      setLogs(logs.filter((l) => l._id !== id));
      addToast('Log deleted', 'success');
    } catch (e) {
      addToast('Failed', 'error');
    }
  };

  return (
    <div className='centered-page-container full-width'>
      <div
        className='chat-page-wrapper small-container'
        style={{ maxWidth: '800px', textAlign: 'left' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            color: 'var(--text-muted)',
          }}>
          <ArrowLeft size={20} /> Back
        </button>

        <div
          className='intro-section'
          style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className='chat-page-title'>Update Log</h1>
          <p className='chat-page-subtitle'>The evolution of the void.</p>
        </div>

        {isAdmin && (
          <div style={{ marginBottom: '2rem' }}>
            <button
              className='action-button'
              onClick={() => setIsAdding(!isAdding)}
              style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} /> {isAdding ? 'Cancel' : 'Add Update Log'}
            </button>

            {isAdding && (
              <form
                onSubmit={handleAddLog}
                className='card'
                style={{ marginTop: '1rem', padding: '1.5rem' }}>
                <input
                  className='comment-input'
                  placeholder='Version (e.g. v1.2.0)'
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  style={{ marginBottom: '1rem', width: '100%' }}
                />
                <textarea
                  className='styled-textarea'
                  placeholder="What's new?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  style={{ height: '100px', marginBottom: '1rem' }}
                />
                <button className='submit-button' style={{ width: '100%' }}>
                  Publish Update
                </button>
              </form>
            )}
          </div>
        )}

        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading updates...
          </p>
        ) : logs.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            No updates logged yet.
          </p>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {logs.map((log) => (
              <div
                key={log._id}
                className='card'
                style={{ padding: '1.5rem', position: 'relative' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}>
                    <span
                      style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                      }}>
                      {log.version}
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                      }}>
                      <Calendar size={14} />
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      className='icon-button'
                      onClick={() => handleDelete(log._id)}
                      style={{ color: 'var(--accent-red)' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div
                  className='formatted-content'
                  style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {log.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Changelog;

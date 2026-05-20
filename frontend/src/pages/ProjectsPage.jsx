import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Users, CheckSquare, ChevronRight } from 'lucide-react';
import api from '../utils/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/projects').then(r => setProjects(r.data.projects)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setError('');
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' });
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="page-fade">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Projects</h1>
          <p style={styles.subtitle}>{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Project</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Project Name *</label>
                <input className="input" placeholder="e.g. Website Redesign" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" placeholder="What is this project about?" rows={3}
                  style={{ resize: 'vertical' }} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" disabled={creating} style={{ flex: 1, justifyContent: 'center' }}>
                  {creating ? 'Creating…' : 'Create Project'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={40} style={{ margin: '0 auto 16px', color: 'var(--border2)' }} />
          <h3>No projects yet</h3>
          <p>Create your first project to start managing tasks</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.projectIcon}>
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <span className={`badge badge-${project.role.toLowerCase()}`}>{project.role}</span>
              </div>
              <h3 style={styles.projectName}>{project.name}</h3>
              {project.description && (
                <p style={styles.projectDesc}>{project.description}</p>
              )}
              <div style={styles.cardFooter}>
                <span style={styles.metaItem}><Users size={13} /> {project.member_count}</span>
                <span style={styles.metaItem}><CheckSquare size={13} /> {project.task_count} tasks</span>
                <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text3)' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.02em' },
  subtitle: { color: 'var(--text2)', marginTop: 4, fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: 12,
    transition: 'border-color 0.2s, transform 0.2s',
    cursor: 'pointer',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  projectIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
  },
  projectName: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' },
  projectDesc: { color: 'var(--text2)', fontSize: '0.8375rem', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  cardFooter: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)', fontSize: '0.8rem' },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: 16,
  },
  modal: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '32px',
    width: '100%', maxWidth: '440px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  modalTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: 24 },
};

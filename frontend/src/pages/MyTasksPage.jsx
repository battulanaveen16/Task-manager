import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast, parseISO } from 'date-fns';

const STATUS_MAP = { 'To Do': 'todo', 'In Progress': 'inprogress', 'Done': 'done' };
const PRIORITY_MAP = { Low: 'low', Medium: 'medium', High: 'high', Critical: 'critical' };

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    api.get('/projects').then(async (projRes) => {
      const projs = projRes.data.projects;
      setProjects(projs);
      const allTasks = await Promise.all(
        projs.map(p => api.get(`/tasks?projectId=${p.id}`).then(r => r.data.tasks.map(t => ({ ...t, projectName: p.name }))))
      );
      const mine = allTasks.flat().filter(t => t.assigned_to === user.id || t.created_by === user.id);
      // Deduplicate
      const unique = Object.values(Object.fromEntries(mine.map(t => [t.id, t])));
      setTasks(unique.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
    }).finally(() => setLoading(false));
  }, [user.id]);

  const updateStatus = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  if (loading) return <div className="spinner" />;

  const filtered = statusFilter === 'All' ? tasks : tasks.filter(t => t.status === statusFilter);
  const overdue = tasks.filter(t => t.due_date && t.status !== 'Done' && isPast(parseISO(t.due_date)));

  return (
    <div className="page-fade">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Tasks</h1>
          <p style={styles.subtitle}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
        </div>
      </div>

      {/* Summary */}
      <div style={styles.summaryRow}>
        <SummaryPill icon={<CheckSquare size={14} />} label="Total" value={tasks.length} />
        <SummaryPill icon={<Clock size={14} />} label="In Progress" value={tasks.filter(t => t.status === 'In Progress').length} color="blue" />
        <SummaryPill icon={<CheckSquare size={14} />} label="Done" value={tasks.filter(t => t.status === 'Done').length} color="green" />
        <SummaryPill icon={<AlertTriangle size={14} />} label="Overdue" value={overdue.length} color="red" />
      </div>

      {/* Filter */}
      <div style={styles.filterRow}>
        {['All', 'To Do', 'In Progress', 'Done'].map(s => (
          <button key={s} style={{ ...styles.filterBtn, ...(statusFilter === s ? styles.filterBtnActive : {}) }}
            onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={36} style={{ margin: '0 auto 12px', color: 'var(--border2)' }} />
          <h3>No tasks found</h3>
          <p>Tasks assigned to you or created by you will appear here</p>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map(task => {
            const isOverdue = task.due_date && task.status !== 'Done' && isPast(parseISO(task.due_date));
            return (
              <div key={task.id} className="card" style={{ padding: '16px 20px' }}>
                <div style={styles.taskRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.taskTitle}>{task.title}</div>
                    {task.description && <div style={styles.taskDesc}>{task.description}</div>}
                    <div style={styles.taskMeta}>
                      <Link to={`/projects/${task.project_id}`} style={styles.projectLink}>
                        {task.projectName}
                      </Link>
                      {task.due_date && (
                        <span style={{ color: isOverdue ? 'var(--red)' : 'var(--text3)', fontSize: '0.775rem' }}>
                          {isOverdue ? '⚠ ' : ''}Due {format(parseISO(task.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={styles.taskRight}>
                    <span className={`badge badge-${PRIORITY_MAP[task.priority] || 'medium'}`}>{task.priority}</span>
                    <select
                      style={styles.statusSelect}
                      value={task.status}
                      onChange={e => updateStatus(task.id, e.target.value)}
                    >
                      {['To Do', 'In Progress', 'Done'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryPill({ icon, label, value, color }) {
  const colors = {
    blue: { bg: 'var(--blue-bg)', c: 'var(--blue)' },
    green: { bg: 'var(--green-bg)', c: 'var(--green)' },
    red: { bg: 'var(--red-bg)', c: 'var(--red)' },
    default: { bg: 'var(--bg3)', c: 'var(--text2)' },
  };
  const c = colors[color] || colors.default;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: c.bg, borderRadius: 20, color: c.c, fontSize: '0.8125rem', fontWeight: 600 }}>
      {icon} {label}: {value}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 800 },
  subtitle: { color: 'var(--text2)', marginTop: 4, fontSize: '0.9rem' },
  summaryRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 },
  filterRow: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: { padding: '6px 14px', borderRadius: 20, background: 'var(--bg3)', color: 'var(--text2)', fontSize: '0.8125rem', cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.15s' },
  filterBtnActive: { background: 'var(--accent-glow)', color: 'var(--accent2)', borderColor: 'var(--accent)' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  taskRow: { display: 'flex', alignItems: 'flex-start', gap: 16 },
  taskTitle: { fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 },
  taskDesc: { color: 'var(--text2)', fontSize: '0.8rem', marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  taskMeta: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' },
  projectLink: { color: 'var(--accent2)', fontSize: '0.775rem', fontWeight: 500 },
  taskRight: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 },
  statusSelect: { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-body)' },
};

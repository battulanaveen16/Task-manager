import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckSquare, Clock, AlertTriangle, Layers, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  'To Do': '#606080',
  'In Progress': '#5caaff',
  'Done': '#2dd4a0',
};

const PRIORITY_COLORS = {
  'Low': '#2dd4a0',
  'Medium': '#5caaff',
  'High': '#f5c842',
  'Critical': '#f55c5c',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard'),
      api.get('/projects'),
    ]).then(([dashRes, projRes]) => {
      setData(dashRes.data);
      setProjects(projRes.data.projects.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const statusData = data ? Object.entries(data.byStatus).map(([name, value]) => ({ name, value })) : [];
  const userTasks = data?.byUser || [];

  return (
    <div className="page-fade">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Good to see you, {user?.name?.split(' ')[0]} 👋</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard icon={<Layers size={20} />} label="Total Tasks" value={data?.total ?? 0} color="accent" />
        <StatCard icon={<Clock size={20} />} label="In Progress" value={data?.byStatus?.['In Progress'] ?? 0} color="blue" />
        <StatCard icon={<CheckSquare size={20} />} label="Completed" value={data?.byStatus?.['Done'] ?? 0} color="green" />
        <StatCard icon={<AlertTriangle size={20} />} label="Overdue" value={data?.overdue ?? 0} color="red" />
      </div>

      <div style={styles.row}>
        {/* Status breakdown */}
        <div className="card" style={{ flex: 1 }}>
          <h2 style={styles.cardTitle}>Tasks by Status</h2>
          {statusData.length === 0 ? (
            <div className="empty-state"><p>No tasks yet</p></div>
          ) : (
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#666'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.legend}>
                {statusData.map(s => (
                  <div key={s.name} style={styles.legendItem}>
                    <span style={{ ...styles.dot, background: STATUS_COLORS[s.name] || '#666' }} />
                    <span style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>{s.name}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 600, fontSize: '0.8rem' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tasks per user */}
        <div className="card" style={{ flex: 1.4 }}>
          <h2 style={styles.cardTitle}>Tasks per Member</h2>
          {userTasks.length === 0 ? (
            <div className="empty-state"><p>No assignments yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userTasks} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
                  cursor={{ fill: 'rgba(124,106,247,0.1)' }}
                />
                <Bar dataKey="task_count" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      {data?.recentTasks?.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={styles.cardTitle}>Recent Activity</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.recentTasks.slice(0, 5).map(task => (
              <div key={task.id} style={styles.taskRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{task.project_name}</div>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={styles.cardTitle}>Your Projects</h2>
            <Link to="/projects" style={{ color: 'var(--accent2)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div style={styles.projectGrid}>
            {projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} style={styles.projectCard}>
                <div style={styles.projectName}>{p.name}</div>
                <div style={styles.projectMeta}>
                  <span>{p.task_count} tasks</span>
                  <span className={`badge badge-${p.role.toLowerCase()}`}>{p.role}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorMap = {
    accent: { bg: 'var(--accent-glow)', color: 'var(--accent2)' },
    blue: { bg: 'var(--blue-bg)', color: 'var(--blue)' },
    green: { bg: 'var(--green-bg)', color: 'var(--green)' },
    red: { bg: 'var(--red-bg)', color: 'var(--red)' },
  };
  const c = colorMap[color] || colorMap.accent;
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { 'To Do': 'todo', 'In Progress': 'inprogress', 'Done': 'done' };
  return <span className={`badge badge-${map[status] || 'todo'}`}>{status}</span>;
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.02em' },
  subtitle: { color: 'var(--text2)', marginTop: 4, fontSize: '0.9rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 },
  row: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 16 },
  chartContainer: { display: 'flex', alignItems: 'center', gap: 20 },
  legend: { display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  taskRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8,
  },
  projectGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 },
  projectCard: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '16px 20px',
    display: 'block', transition: 'border-color 0.2s, transform 0.2s',
  },
  projectName: { fontWeight: 600, fontSize: '0.9rem', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  projectMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text3)', fontSize: '0.8rem' },
};

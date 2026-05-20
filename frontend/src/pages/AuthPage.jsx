import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.card} className="page-fade">
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="2" fill="var(--accent)" />
              <rect x="14" y="3" width="7" height="7" rx="2" fill="var(--accent)" opacity="0.6" />
              <rect x="3" y="14" width="7" height="7" rx="2" fill="var(--accent)" opacity="0.6" />
              <rect x="14" y="14" width="7" height="7" rx="2" fill="var(--accent)" opacity="0.3" />
            </svg>
          </div>
          <span style={styles.logoText}>TaskFlow</span>
        </div>

        <h1 style={styles.title}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={styles.subtitle}>
          {mode === 'login' ? 'Sign in to your workspace' : 'Start managing tasks with your team'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && (
            <div style={styles.field}>
              <label className="label">Full Name</label>
              <input
                className="input"
                type="text"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
          )}

          <div style={styles.field}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div style={styles.field}>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={styles.toggle}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            style={styles.toggleBtn}
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', position: 'relative',
  },
  bg: {
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,106,247,0.15) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%', maxWidth: '400px',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '40px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    position: 'relative', zIndex: 1,
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' },
  logoIcon: {
    width: 40, height: 40, background: 'var(--bg3)',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--border)',
  },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 700, marginBottom: 6 },
  subtitle: { color: 'var(--text2)', fontSize: '0.875rem', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: {},
  toggle: { textAlign: 'center', marginTop: '24px', color: 'var(--text2)', fontSize: '0.875rem' },
  toggleBtn: {
    background: 'none', color: 'var(--accent2)', fontWeight: 600,
    fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
  },
};

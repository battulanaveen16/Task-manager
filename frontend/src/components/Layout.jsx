import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, ChevronRight, Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/my-tasks', icon: CheckSquare, label: 'My Tasks' },
  ];

  return (
    <div style={styles.shell}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, ...(sidebarOpen ? styles.sidebarOpen : {}) }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="2" fill="var(--accent)" />
                <rect x="14" y="3" width="7" height="7" rx="2" fill="var(--accent)" opacity="0.6" />
                <rect x="3" y="14" width="7" height="7" rx="2" fill="var(--accent)" opacity="0.6" />
                <rect x="14" y="14" width="7" height="7" rx="2" fill="var(--accent)" opacity="0.3" />
              </svg>
            </div>
            <span style={styles.logoText}>TaskFlow</span>
          </div>
          <button style={styles.closeBtn} onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <nav style={styles.nav}>
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) })}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} style={styles.navChevron} />
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={styles.main}>
        <header style={styles.topbar}>
          <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
        </header>
        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  shell: { display: 'flex', minHeight: '100vh' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99,
    display: 'none',
  },
  sidebar: {
    width: 240, flexShrink: 0,
    background: 'var(--bg2)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', height: '100vh',
    position: 'sticky', top: 0,
    transition: 'transform 0.25s ease',
  },
  sidebarOpen: {},
  sidebarHeader: {
    padding: '20px 16px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid var(--border)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 34, height: 34, background: 'var(--bg3)', borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--border)',
  },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' },
  closeBtn: { display: 'none', background: 'none', color: 'var(--text2)', padding: 4 },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
    color: 'var(--text2)', fontSize: '0.875rem', fontWeight: 500,
    transition: 'all 0.15s',
    position: 'relative',
  },
  navItemActive: {
    background: 'var(--accent-glow)', color: 'var(--accent2)',
    borderLeft: '2px solid var(--accent)',
  },
  navChevron: { marginLeft: 'auto', opacity: 0.4 },
  sidebarFooter: {
    padding: '16px', borderTop: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  userInfo: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
  },
  userName: { fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: '0.7rem', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: { background: 'none', color: 'var(--text3)', padding: 6, borderRadius: 6, transition: 'color 0.15s' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: {
    display: 'none', padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg2)',
    position: 'sticky', top: 0, zIndex: 10,
  },
  menuBtn: { background: 'none', color: 'var(--text)', padding: 4 },
  content: { flex: 1, padding: '32px', maxWidth: 1200, width: '100%', margin: '0 auto' },
};

import { NavLink, Outlet } from 'react-router-dom';
import GokuBackground from './GokuBackground';
import './Layout.css';

/* ═══ Inline SVG Nav Icons — Scouter UI Style ═══ */

/** Lightning bolt — power / home */
function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
      <path d="M12.5 2L5 12h5l-1.5 8L17 10h-5.5L12.5 2z" />
    </svg>
  );
}

/** Grid calendar with ki dot — schedule */
function IconSchedule() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="3" y="5" width="16" height="14" rx="1" fill="currentColor" fillOpacity="0.15" />
      <rect x="3" y="5" width="16" height="14" rx="1" />
      <line x1="3" y1="9" x2="19" y2="9" />
      <line x1="8" y1="3" x2="8" y2="7" strokeLinecap="round" />
      <line x1="14" y1="3" x2="14" y2="7" strokeLinecap="round" />
      <circle cx="11" cy="14" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Power level bars — log / stats */
function IconLog() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
      <rect x="3" y="13" width="4" height="6" rx="0.5" fillOpacity="0.5" />
      <rect x="9" y="9" width="4" height="10" rx="0.5" fillOpacity="0.75" />
      <rect x="15" y="4" width="4" height="15" rx="0.5" />
      {/* Scouter scan line */}
      <line x1="2" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Scouter visor — profile */
function IconProfile() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="8" r="3.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M4.5 19c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" strokeLinecap="round" />
      {/* Scouter lens */}
      <circle cx="16" cy="6" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const navItems = [
  { to: '/', icon: <IconHome />, label: 'Home' },
  { to: '/schedule', icon: <IconSchedule />, label: 'Schedule' },
  { to: '/log', icon: <IconLog />, label: 'Log' },
  { to: '/profile', icon: <IconProfile />, label: 'Profile' },
];

export default function Layout() {
  return (
    <div className="app-layout">
      <GokuBackground />
      <main className="app-main">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item--active' : ''}`
            }
            end={item.to === '/'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label pixel-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

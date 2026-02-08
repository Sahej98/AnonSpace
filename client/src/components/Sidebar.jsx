import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  MessageCircle,
  Settings,
  Archive,
  ShieldAlert,
  Home,
} from 'lucide-react';
import { useUser } from '../contexts/UserContext.jsx';

const Sidebar = () => {
  const { isAdmin, isModerator } = useUser();

  const getNavLinkClass = ({ isActive }) => {
    return isActive ? 'nav-item active' : 'nav-item';
  };
  const isDesktop = window.innerWidth >= 768;

  return (
    <aside className='sidebar'>
      <nav
        className='sidebar-nav'
        style={{
          display: 'flex',
          flexDirection: isDesktop ? 'column' : 'row',
        }}>
        <NavLink to='/' end className={getNavLinkClass}>
          <Home size={22} />
          <span>Feed</span>
        </NavLink>

        <NavLink to='/chat' className={getNavLinkClass}>
          <MessageCircle size={22} />
          <span>Chat</span>
        </NavLink>

        <NavLink to='/my-posts' className={getNavLinkClass}>
          <Archive size={22} />
          <span>Activity</span>
        </NavLink>

        <div
          style={{
            display: isDesktop ? 'block' : 'none',
            height: '1px',
            background: 'var(--glass-border)',
            margin: '0.5rem 1rem',
          }}
        />

        <NavLink to='/settings' className={getNavLinkClass}>
          <Settings size={22} />
          <span>Settings</span>
        </NavLink>

        {(isAdmin || isModerator) && (
          <NavLink
            to='/admin'
            className={getNavLinkClass}
            style={{ color: 'var(--accent-red)' }}>
            <ShieldAlert size={22} />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;

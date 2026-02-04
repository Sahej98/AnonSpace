import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  MessageCircle,
  TrendingUp,
  Info,
  Settings,
  Archive,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import { useUser } from '../contexts/UserContext.jsx';

const Sidebar = () => {
  const { isAdmin } = useUser();

  const getNavLinkClass = ({ isActive }) => {
    return isActive ? 'nav-item active' : 'nav-item';
  };

  return (
    <aside className='sidebar'>
      <nav className='sidebar-nav'>
        <NavLink to='/' end className={getNavLinkClass}>
          <Compass size={22} />
          <span>Discover</span>
        </NavLink>

        <NavLink to='/chat' className={getNavLinkClass}>
          <MessageCircle size={22} />
          <span>Chat</span>
        </NavLink>

        <NavLink to='/top' className={getNavLinkClass}>
          <TrendingUp size={22} />
          <span>Top</span>
        </NavLink>

        <NavLink to='/my-posts' className={getNavLinkClass}>
          <Archive size={22} />
          <span>My Activity</span>
        </NavLink>

        <NavLink to='/settings' className={getNavLinkClass}>
          <Settings size={22} />
          <span>Settings</span>
        </NavLink>

        <NavLink to='/rules' className={getNavLinkClass}>
          <BookOpen size={22} />
          <span>Rules</span>
        </NavLink>

        {isAdmin && (
          <NavLink to='/admin' className={getNavLinkClass}>
            <ShieldAlert size={22} color='var(--accent-red)' />
            <span>Admin</span>
          </NavLink>
        )}

        <NavLink to='/about' className={getNavLinkClass}>
          <Info size={22} />
          <span>About</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserCircle, 
  Lightbulb, 
  Target, 
  Map, 
  LogOut,
  Shield
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="mb-8">
          <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Guidance Path</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>For Arts Stream Students</p>
        </div>

        <nav className="flex-col w-full" style={{ flex: 1 }}>
          <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/profile" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <UserCircle size={20} />
            <span>Academic Profile</span>
          </NavLink>
          
          <NavLink to="/recommendations" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Lightbulb size={20} />
            <span>Recommendations</span>
          </NavLink>

          <NavLink to="/skill-gap" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Target size={20} />
            <span>Skill Gap Analysis</span>
          </NavLink>

          <NavLink to="/roadmap" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Map size={20} />
            <span>Learning Roadmap</span>
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Shield size={20} />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        <div className="mt-8 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {String(user?.firstName || '').charAt(0)}{String(user?.lastName || '').charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 500 }}>{user?.firstName || 'User'} {user?.lastName || ''}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.email || ''}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-link w-full" style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

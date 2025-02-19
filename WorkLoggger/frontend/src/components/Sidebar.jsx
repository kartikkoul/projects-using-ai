import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const dispatch = useDispatch();
  const isAdmin = useSelector(state => state.auth.user?.isAdmin);

  const navItems = [
    { name: 'Dashboard', icon: ChartBarIcon, path: '/' },
    { name: 'Work Logs', icon: ClipboardDocumentListIcon, path: '/worklogs' },
    ...(isAdmin ? [{ name: 'Admin Panel', icon: UserGroupIcon, path: '/admin' }] : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <div className="logo-circle">
              <BookOpenIcon className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="brand-text">
            <div className="logo-text">WorkLog</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">
          <p>Navigation</p>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="nav-icon" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          <ArrowRightOnRectangleIcon className="nav-icon" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

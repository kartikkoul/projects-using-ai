import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, changePassword } from '../redux/slices/authSlice';
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
  const user = useSelector(state => state.auth.user);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const navItems = [
    { name: 'Global Worklogs', icon: ChartBarIcon, path: '/' },
    { name: 'My Worklogs', icon: ClipboardDocumentListIcon, path: '/worklogs' },
    ...(isAdmin ? [{ name: 'Admin Panel', icon: UserGroupIcon, path: '/admin' }] : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const isValid = await dispatch(changePassword({ currentPassword, newPassword }));
    if (isValid) {
      setIsChangePasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
    } else {
      alert('Current password is incorrect');
    }
  };

  const handleCloseModal = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setIsChangePasswordModalOpen(false);
    }
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
        <div className="user-info">
          <p className="user-name">{user?.name}</p>
          <p className="user-email">{user?.email}</p>
          <span
            className="change-password-link"
            onClick={() => setIsChangePasswordModalOpen(true)}
          >
            Change Password
          </span>
        </div>
        <button onClick={handleLogout} className="logout-button" style={{ cursor: 'pointer' }}>
          <ArrowRightOnRectangleIcon className="nav-icon" />
          <span>Sign Out</span>
        </button>
      </div>

      {isChangePasswordModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="change-password-modal-container">
            <h3 className="change-password-modal-title">Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="change-password-modal-actions">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="button button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

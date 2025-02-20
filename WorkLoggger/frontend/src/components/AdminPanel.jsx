import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, deleteUser, updateUser } from '../redux/slices/adminSlice';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import Loader from './Loader';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector(state => state.admin);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createUser(formData));
    setIsModalOpen(false);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateUser({ id: selectedUser._id, ...formData }));
    setIsEditModalOpen(false);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleDelete = async (userId) => {
    await dispatch(deleteUser(userId));
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, password: '' });
    setIsEditModalOpen(true);
  };

  const handleCardClick = (user) => {
    setSelectedUser(user);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmation = (action) => {
    setActionType(action);
    if (action === 'delete') {
      setIsConfirmationModalOpen(false);
      setIsEditModalOpen(false);
      setIsDeleteConfirmationModalOpen(true);
    } else {
      setIsConfirmationModalOpen(false);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteConfirmation = async () => {
    await dispatch(deleteUser(selectedUser._id));
    setIsDeleteConfirmationModalOpen(false);
  };

  const handleCloseModal = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setIsModalOpen(false);
      setIsEditModalOpen(false);
      setIsConfirmationModalOpen(false);
      setIsDeleteConfirmationModalOpen(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Sidebar />
      <div className="admin-panel-container">
        <div className="admin-panel">
          <h1>Admin Panel</h1>
          <div className="admin-panel-header">
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="add-user-button"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add User
            </button>
          </div>
          <div className="users-list">
            {loading ? (
              <Loader />
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
              filteredUsers.map(user => (
                <div key={user._id} className="user-card" onClick={() => handleCardClick(user)}>
                  <div className="user-card-header">
                    <div>
                      <p className="user-card-name">{user.name}</p>
                      <p className="user-card-email">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {isModalOpen && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <div className="modal-container">
                <h3 className="modal-title">New User</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="button button-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="button button-primary"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isEditModalOpen && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <div className="modal-container">
                <h3 className="modal-title">Edit User</h3>
                <form onSubmit={handleEditSubmit}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="button button-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="button button-primary"
                    >
                      Update User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isConfirmationModalOpen && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <div className="confirmation-modal-container">
                <h3 className="confirmation-modal-title">Select Action</h3>
                <div className="confirmation-modal-actions">
                  <button
                    onClick={() => handleConfirmation('edit')}
                    className="button button-primary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleConfirmation('delete')}
                    className="button button-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {isDeleteConfirmationModalOpen && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <div className="confirmation-modal-container">
                <h3 className="confirmation-modal-title">Confirm Deletion</h3>
                <div className="confirmation-modal-actions">
                  <button
                    onClick={() => setIsDeleteConfirmationModalOpen(false)}
                    className="button button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirmation}
                    className="button button-danger"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPanel;

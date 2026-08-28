import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  ChevronDown
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')
  : 'http://localhost:5000';

const UserManagement = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter & search state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState({ open: false, user: null });
  const [toggling, setToggling] = useState(false);

  const authHeaders = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axios.get(
        `${BASE_URL}/api/admin/users${queryString}`,
        authHeaders
      );
      setUsers(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleToggleStatus = async () => {
    if (!confirmModal.user) return;
    setToggling(true);
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/admin/users/${confirmModal.user._id}/toggle-status`,
        {},
        authHeaders
      );
      setSuccessMsg(response.data.message);
      setConfirmModal({ open: false, user: null });
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
      setConfirmModal({ open: false, user: null });
    } finally {
      setToggling(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.role === 'admin').length
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>
            <Users
              size={28}
              style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }}
            />
            User Management
          </h2>
          <p className="text-muted">
            View and manage user accounts. Deactivate or reactivate accounts as needed.
          </p>
        </div>
      </div>

      {/* Success / Error alerts */}
      {successMsg && (
        <div className="alert-success animate-fade-in mb-4">{successMsg}</div>
      )}
      {error && (
        <div className="alert-error animate-fade-in mb-4">{error}</div>
      )}

      {/* Quick stat pills */}
      <div className="user-stats-row mb-6">
        <div className="user-stat-pill">
          <Users size={16} />
          <span>
            <strong>{stats.total}</strong> Total
          </span>
        </div>
        <div className="user-stat-pill user-stat-active">
          <UserCheck size={16} />
          <span>
            <strong>{stats.active}</strong> Active
          </span>
        </div>
        <div className="user-stat-pill user-stat-inactive">
          <UserX size={16} />
          <span>
            <strong>{stats.inactive}</strong> Inactive
          </span>
        </div>
        <div className="user-stat-pill user-stat-admin">
          <ShieldCheck size={16} />
          <span>
            <strong>{stats.admins}</strong> Admins
          </span>
        </div>
      </div>

      {/* Filters bar */}
      <div className="glass-panel mb-6 user-filters-bar">
        <div className="user-filter-group">
          <Search size={18} className="text-muted" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="form-input user-search-input"
          />
        </div>

        <div className="user-filter-group">
          <Filter size={18} className="text-muted" />
          <div className="user-select-wrapper">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-select user-filter-select"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
            </select>
            <ChevronDown size={14} className="user-select-icon" />
          </div>

          <div className="user-select-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select user-filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={14} className="user-select-icon" />
          </div>
        </div>
      </div>

      {/* User table */}
      {loading ? (
        <div className="loading-spinner">Loading users…</div>
      ) : (
        <div className="glass-panel admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = currentAdmin?._id === u._id;
                return (
                  <tr key={u._id} className={!u.isActive ? 'user-row-inactive' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" data-active={u.isActive}>
                          {u.firstName?.charAt(0)}
                          {u.lastName?.charAt(0)}
                        </div>
                        <span className="user-name">
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <Mail size={14} className="text-muted" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-default'}`}>
                        {u.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <Calendar size={14} className="text-muted" />
                        <span>{formatDate(u.createdAt)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        {isSelf ? (
                          <span
                            className="text-muted"
                            style={{ fontSize: '0.8rem', fontStyle: 'italic' }}
                          >
                            (You)
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmModal({ open: true, user: u })}
                            className={`btn user-toggle-btn ${u.isActive ? 'user-toggle-deactivate' : 'user-toggle-activate'}`}
                          >
                            {u.isActive ? (
                              <>
                                <ShieldOff size={14} /> Deactivate
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={14} /> Activate
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: 'center', padding: '2rem' }}
                    className="text-muted"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && confirmModal.user && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 style={{ marginBottom: 0 }}>
                {confirmModal.user.isActive ? (
                  <span style={{ color: 'var(--color-warning)' }}>Confirm Deactivation</span>
                ) : (
                  <span style={{ color: 'var(--color-success)' }}>Confirm Activation</span>
                )}
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem' }}>
                {confirmModal.user.isActive ? (
                  <>
                    Are you sure you want to <strong>deactivate</strong> the account for{' '}
                    <strong>
                      {confirmModal.user.firstName} {confirmModal.user.lastName}
                    </strong>
                    ?
                  </>
                ) : (
                  <>
                    Are you sure you want to <strong>reactivate</strong> the account for{' '}
                    <strong>
                      {confirmModal.user.firstName} {confirmModal.user.lastName}
                    </strong>
                    ?
                  </>
                )}
              </p>
              <div
                className="glass-panel"
                style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}
              >
                {confirmModal.user.isActive ? (
                  <p className="text-muted" style={{ margin: 0 }}>
                    ⚠️ This user will be <strong>unable to log in</strong> until their account
                    is reactivated. Their data will be preserved.
                  </p>
                ) : (
                  <p className="text-muted" style={{ margin: 0 }}>
                    ✅ This user will regain <strong>full access</strong> to their account and
                    all their existing data.
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false, user: null })}
                className="btn btn-outline"
                disabled={toggling}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`btn ${confirmModal.user.isActive ? 'user-toggle-deactivate' : 'user-toggle-activate'}`}
                disabled={toggling}
              >
                {toggling
                  ? 'Processing…'
                  : confirmModal.user.isActive
                    ? 'Yes, Deactivate'
                    : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

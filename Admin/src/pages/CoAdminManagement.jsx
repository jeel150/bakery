// pages/CoAdminManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../src/config/api.js';
const CoAdminManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users. Please check if the server is running.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCoAdminAccess = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_BASE_URL}/api/users/${userId}/toggle-coadmin`,
        { isCoAdmin: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update the user in the list
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isCoAdmin: !currentStatus } : user
      ));
      
      setSuccess(response.data.message);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('API endpoint not found. Please check your backend server.');
      } else {
        setError('Failed to update user access. Please try again.');
      }
      console.error('Error updating user:', err);
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) return <div className="card">Loading users...</div>;

  return (
    <div className="content">
      <div className="card">
        <h2>Co-Admin Management</h2>
        <p>Manage user access to admin features</p>
        
        {error && (
          <div className="error-message" style={{marginTop: '10px'}}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message" style={{marginTop: '10px'}}>
            {success}
          </div>
        )}
      </div>

      <div className="card">
        <h3>User List</h3>
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Co-Admin Access</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-chip status-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-chip status-${user.status || 'active'}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                   <td>
                    <span className={`status-chip ${user.isCoAdmin ? 'status-delivered' : 'status-pending'}`}>
                        {user.isCoAdmin ? 'Can Login' : 'Cannot Login'}
                    </span>
                    </td>
                    <td>
                      <button
                        className={`btn ${user.isCoAdmin ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleCoAdminAccess(user._id, user.isCoAdmin || false)}
                        disabled={user.role === 'admin'}
                        title={user.role === 'admin' ? 'Cannot modify admin users' : ''}
                      >
                        {user.isCoAdmin ? 'Revoke Access' : 'Grant Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoAdminManagement;
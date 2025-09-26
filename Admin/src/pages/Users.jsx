import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '../../../src/config/api.js';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: "", email: "" });

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Add user
  const addUser = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/users`, {
        ...newUser,
        status: "active", // default
      });
      setNewUser({ name: "", email: "" });
      fetchUsers();
    } catch (err) {
      console.error("Error adding user", err);
    }
  };

  // ✅ Toggle block/unblock
  const toggleUser = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/users/${id}/toggle`);
      fetchUsers();
    } catch (err) {
      console.error("Error toggling user", err);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="container mt-4">
      <h2>User Management</h2>

      {/* Add new user
      <div className="d-flex gap-2 my-3">
        <input
          type="text"
          placeholder="Name"
          className="form-control"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="form-control"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <button className="btn btn-primary" onClick={addUser}>
          Add User
        </button>
      </div> */}

      {/* Users Table */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Toggle</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.status || "active"}</td>
                <td>
                  <button
                    className={`btn ${
                      u.status === "blocked" ? "btn-success" : "btn-danger"
                    }`}
                    onClick={() => toggleUser(u._id)}
                  >
                    {u.status === "blocked" ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Users;

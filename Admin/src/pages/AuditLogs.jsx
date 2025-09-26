import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../src/config/api.js';

export default function AuditLogs(){
  const [logs, setLogs] = useState([]);
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        setLoading(true);
        
        // Fetch users data
        const response = await fetch(`${API_BASE_URL}/api/users`);
        const users = await response.json();

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        // Extract admin actions from user data (assuming you have an activityLog field)
        const adminActions = [];
        const loginHistory = [];

        users.forEach(user => {
          // Extract login history (assuming lastLogin field exists)
          if (user.lastLogin) {
            loginHistory.push({
              id: user._id,
              user: user.name || user.email,
              ip: user.lastLoginIP || 'Unknown',
              when: new Date(user.lastLogin).toLocaleString()
            });
          }

          // Extract admin actions (assuming activityLog field exists)
          if (user.activityLog && Array.isArray(user.activityLog)) {
            user.activityLog.forEach((action, index) => {
              adminActions.push({
                id: `${user._id}-${index}`,
                user: user.name || user.email,
                action: action.description || 'Performed an action',
                when: new Date(action.timestamp || user.updatedAt).toLocaleString()
              });
            });
          }
        });

        // Sort by date (newest first)
        adminActions.sort((a, b) => new Date(b.when) - new Date(a.when));
        loginHistory.sort((a, b) => new Date(b.when) - new Date(a.when));

        setLogs(adminActions.slice(0, 10)); // Show latest 10 actions
        setLogins(loginHistory.slice(0, 10)); // Show latest 10 logins
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAuditData();
  }, []);

  if (loading) return <div className="card">Loading audit logs...</div>;
  if (error) return <div className="card error">{error}</div>;

  return (
    <div className="grid" style={{gap:16}}>
      <div className="card">
        <h3>Admin Actions</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Action</th><th>When</th></tr></thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map(l => (
                  <tr key={l.id}>
                    <td>{l.user}</td>
                    <td>{l.action}</td>
                    <td>{l.when}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" style={{textAlign: 'center'}}>No admin actions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h3>Login History</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>IP</th><th>When</th></tr></thead>
            <tbody>
              {logins.length > 0 ? (
                logins.map(l => (
                  <tr key={l.id}>
                    <td>{l.user}</td>
                    <td>{l.ip}</td>
                    <td>{l.when}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" style={{textAlign: 'center'}}>No login history found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
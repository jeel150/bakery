import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import images from '../../../src/data/images';
import '../../../src/styles/Login.css'
import { API_BASE_URL } from '../../../src/config/api.js';

const { jarsImg } = images;

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const config = {
        headers: { 'Content-Type': 'application/json' }
      };

      const body = JSON.stringify({ email, password });
      const res = await axios.post(`${API_BASE_URL}/api/auth/admin/login`, body, config);
      
      // Check if user has admin role OR co-admin access
      if (res.data.user.role === "admin" || res.data.user.isCoAdmin) {
        setSuccess("Login successful!");
        
        // Save token and user data
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError("You don't have admin access. Please contact administrator.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed");
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <div className="login-content-wrapper">
          
          {/* Left image */}
          <div className="login-left-image">
            <img src={jarsImg} alt="Decorative jars" className="login-image-style" />
          </div>

          {/* Right form content */}
          <div className="login-right-content">
            <h2 className="login-title">ADMIN LOGIN</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form className="login-form" onSubmit={handleSubmit}>
              <input 
                type="email" 
                placeholder="Email" 
                className="login-input" 
                name="email"
                value={email}
                onChange={onChange}
                required
                disabled={loading}
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="login-input" 
                name="password"
                value={password}
                onChange={onChange}
                required
                disabled={loading}
              />
              
              <button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Logging In...' : 'Login as Admin'}
              </button>
            </form>
            <p className="login-login-link">
              Don't have an admin account? <a href="/signup">Signup</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
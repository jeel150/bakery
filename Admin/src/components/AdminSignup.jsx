
import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import images from '../../../src/data/images';
import '../../../src/styles/SignUp.css'
import { API_BASE_URL } from '../../../src/config/api.js';

const { jarsImg } = images;

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const { name, email, phone, password, passwordConfirm } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { 'Content-Type': 'application/json' }
      };

      const body = JSON.stringify({ name, email, phone, password });
      const res = await axios.post(`${API_BASE_URL}/api/auth/admin/register`,body, config);
      
      setSuccess(res.data.message || "Admin registration successful!");

      // Save token and user data
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

     // Redirect after successful signup
setTimeout(() => {
  navigate('/users');
}, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Admin registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="signup-background">
      <div className="signup-container">
        <div className="signup-content-wrapper">
          
          {/* Left image */}
          <div className="signup-left-image">
            <img src={jarsImg} alt="Decorative jars" className="signup-image-style" />
          </div>

          {/* Right form content */}
          <div className="signup-right-content">
            <h2 className="signup-title">ADMIN SIGNUP</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form className="signup-form" onSubmit={handleSubmit}>
              <input 
                type="text" 
                placeholder="Name" 
                className="signup-input" 
                name="name"
                value={name}
                onChange={onChange}
                required
                disabled={loading}
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="signup-input" 
                name="email"
                value={email}
                onChange={onChange}
                required
                disabled={loading}
              />
              <input 
                type="tel" 
                placeholder="Phone" 
                className="signup-input" 
                name="phone"
                value={phone}
                onChange={onChange}
                required
                disabled={loading}
              />
              
              <input 
                type="password" 
                placeholder="Password" 
                className="signup-input" 
                name="password"
                value={password}
                onChange={onChange}
                required
                disabled={loading}
              />
              <input 
                type="password" 
                placeholder="Re Enter Password" 
                className="signup-input" 
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={onChange}
                required
                disabled={loading}
              />
              <button 
                type="submit" 
                className="signup-button"
                disabled={loading}
              >
                {loading ? 'Signing Up...' : 'Signup as Admin'}
              </button>
            </form>
          <p className="signup-login-link">
  Already have an admin account? <a href="/login">Log in</a>
</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
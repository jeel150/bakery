// import '../styles/Login.css'; 
// import images from '../data/images';
// import { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const { jarsImg } = images;

// function Login() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState('');
//   const navigate = useNavigate();

//   const { email, password } = formData;

//   const onChange = e => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError(''); // Clear error when user starts typing
//   };

//   const onSubmit = async e => {
//     e.preventDefault();
    
//     try {
//       setLoading(true);
//       setError('');
//       const config = {
//         headers: { 'Content-Type': 'application/json' }
//       };

//       const body = JSON.stringify({ email, password });
//       const res = await axios.post('https://cake-1h0p.onrender.com/api/auth/login', body, config);

//       // Save token and user data
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('user', JSON.stringify(res.data.user));

//       setSuccess('Login successful! welcome ! ');
//       setLoading(false);
      
//       // Redirect based on role
//     setTimeout(() => {
//       if (res.data.user.role === "admin") {
//         navigate('/products');
//       } else {
//         navigate('/');
//       }
//     }, 1500);
//   } catch (err) {
//     setError(err.response?.data?.message || 'Login failed. Please try again.');
//     setLoading(false);
//   }
// };

//   return (
//     <div className="login-background">
//       <div className="login-container">
//         <div className="login-content-wrapper">
          
//           {/* Left image */}
//           <div className="login-left-image">
//             <img src={jarsImg} alt="Decorative jars" className="login-image-style" />
//           </div>

//           {/* Right form content */}
//           <div className="login-right-content">
//             <h2 className="login-title">LOGIN</h2>
//             {error && <div className="error-message">{error}</div>}
//             {success && <div className="success-message">{success}</div>}
//             <form className="login-form" onSubmit={onSubmit}>
//               <input 
//                 type="email" 
//                 placeholder="Email" 
//                 className="login-input" 
//                 name="email"
//                 value={email}
//                 onChange={onChange}
//                 required
//                 disabled={loading}
//               />
//               <input 
//                 type="password" 
//                 placeholder="Password" 
//                 className="login-input" 
//                 name="password"
//                 value={password}
//                 onChange={onChange}
//                 required
//                 disabled={loading}
//               />
              
//               <button 
//                 type="submit" 
//                 className="login-button"
//                 disabled={loading}
//               >
//                 {loading ? 'Logging In...' : 'Login'}
//               </button>
//             </form>
//             <p className="login-login-link">
//               Don't have an account? <a href="/signup">Signup</a>
//             </p>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;



import '../styles/Login.css'; 
import images from '../data/images';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js'; // Import the config

const { jarsImg } = images;

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      const config = {
        headers: { 
          'Content-Type': 'application/json',
        },
        withCredentials: true // Important for CORS with credentials
      };

      const body = JSON.stringify({ email, password });
      
      // Use the environment-aware API URL
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, body, config);

      // Save token and user data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setSuccess('Login successful! welcome!');
      setLoading(false);
      
      // Redirect based on role
      setTimeout(() => {
        if (res.data.user.role === "admin" || res.data.user.isCoAdmin) {
          navigate('/products');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
            <h2 className="login-title">LOGIN</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form className="login-form" onSubmit={onSubmit}>
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
                {loading ? 'Logging In...' : 'Login'}
              </button>
            </form>
            <p className="login-login-link">
              Don't have an account? <a href="/signup">Signup</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
// // SignUp.jsx
// import '../styles/SignUp.css';
// import images from '../data/images';
// import { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const { jarsImg } = images;

// function Signup() {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     passwordConfirm: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const { name, email, phone, password, passwordConfirm } = formData;

//   const onChange = e => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const onSubmit = async e => {
//     e.preventDefault();
    
//     if (password !== passwordConfirm) {
//       setError('Passwords do not match');
//       return;
//     }

//     try {
//       setLoading(true);
//       const config = {
//         headers: { 'Content-Type': 'application/json' }
//       };

//       const body = JSON.stringify({ name, email, phone, password });
//       const res = await axios.post('https://cake-1h0p.onrender.com/api/auth/register', body, config);

//       // Save token
//       localStorage.setItem('token', res.data.token);
//        localStorage.setItem('user', JSON.stringify(res.data.user));

//       // Redirect to main app
//       if (res.data.user.role === "admin") {
//       navigate('/products');
//     } else {
//       navigate('/');
//     }
//   } catch (err) {
//     setError(err.response?.data?.message || 'Registration failed');
//     setLoading(false);
//   }
// };

//   return (
//     <div className="signup-background">
//       <div className="signup-container">
//         <div className="signup-content-wrapper">
          
//           {/* Left image */}
//           <div className="signup-left-image">
//             <img src={jarsImg} alt="Decorative jars" className="signup-image-style" />
//           </div>

//           {/* Right form content */}
//           <div className="signup-right-content">
//             <h2 className="signup-title">SIGNUP</h2>
//             {error && <div className="error-message">{error}</div>}
//             <form className="signup-form" onSubmit={onSubmit}>
//               <input 
//                 type="text" 
//                 placeholder="Name" 
//                 className="signup-input" 
//                 name="name"
//                 value={name}
//                 onChange={onChange}
//                 required
//               />
//               <input 
//                 type="email" 
//                 placeholder="Email" 
//                 className="signup-input" 
//                 name="email"
//                 value={email}
//                 onChange={onChange}
//                 required
//               />
//               <input 
//                 type="tel" 
//                 placeholder="Phone" 
//                 className="signup-input" 
//                 name="phone"
//                 value={phone}
//                 onChange={onChange}
//                 required
//               />
              
//               <input 
//                 type="password" 
//                 placeholder="Password" 
//                 className="signup-input" 
//                 name="password"
//                 value={password}
//                 onChange={onChange}
//                 required
//               />
//               <input 
//                 type="password" 
//                 placeholder="Re Enter Password" 
//                 className="signup-input" 
//                 name="passwordConfirm"
//                 value={passwordConfirm}
//                 onChange={onChange}
//                 required
//               />
//               <button 
//                 type="submit" 
//                 className="signup-button"
//                 disabled={loading}
//               >
//                 {loading ? 'Signing Up...' : 'Signup'}
//               </button>
//             </form>
//             <p className="signup-login-link">
//               Already have an account? <a href="/login">Log in</a>
//             </p>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// export default Signup;

import '../styles/SignUp.css';
import images from '../data/images';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js'; // Import the config

const { jarsImg } = images;

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, phone, password, passwordConfirm } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { 
          'Content-Type': 'application/json' 
        },
        withCredentials: true
      };

      const body = JSON.stringify({ name, email, phone, password });
      
      // Use the environment-aware API URL
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, body, config);

      // Save token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Redirect to main app
      if (res.data.user.role === "admin" || res.data.user.isCoAdmin) {
        navigate('/products');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Registration failed');
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
            <h2 className="signup-title">SIGNUP</h2>
            {error && <div className="error-message">{error}</div>}
            <form className="signup-form" onSubmit={onSubmit}>
              <input 
                type="text" 
                placeholder="Name" 
                className="signup-input" 
                name="name"
                value={name}
                onChange={onChange}
                required
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="signup-input" 
                name="email"
                value={email}
                onChange={onChange}
                required
              />
              <input 
                type="tel" 
                placeholder="Phone" 
                className="signup-input" 
                name="phone"
                value={phone}
                onChange={onChange}
                required
              />
              
              <input 
                type="password" 
                placeholder="Password" 
                className="signup-input" 
                name="password"
                value={password}
                onChange={onChange}
                required
              />
              <input 
                type="password" 
                placeholder="Re Enter Password" 
                className="signup-input" 
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={onChange}
                required
              />
              <button 
                type="submit" 
                className="signup-button"
                disabled={loading}
              >
                {loading ? 'Signing Up...' : 'Signup'}
              </button>
            </form>
            <p className="signup-login-link">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Signup;
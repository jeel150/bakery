// src/hooks/useAuth.js
import { useNavigate, useLocation } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = (redirectToCheckout = false, cartItems = []) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check if user is authenticated with user role
    if (!token || user.role !== "user") {
      // Redirect to login and store the intended destination
      navigate('/login', { 
        state: { 
          from: redirectToCheckout ? '/checkout' : location.pathname,
          message: 'Please login to place your order',
          cartItems: cartItems
        } 
      });
      return false;
    }
    return true;
  };

  const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return { token, user };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return { checkAuth, getCurrentUser, logout };
};
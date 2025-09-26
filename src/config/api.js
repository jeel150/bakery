// src/config/api.js - This goes in your React app, not in the server
export const getApiBaseUrl = () => {
  // Check if we're in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Check for render URL
  if (window.location.hostname.includes('vercel.app') || 
      window.location.hostname.includes('render.com')) {
    return 'https://cake-1h0p.onrender.com';
  }
  
  // Default to render for production
  return 'https://cake-1h0p.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
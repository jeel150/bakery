// src/PublicRoute.jsx
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // If user is already authenticated as regular user, redirect to home
  if (token && user.role === "user") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
// src/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user is authenticated and has user role
  if (!token || user.role !== "user") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
import React, { createContext, useContext, useEffect, useState } from "react";

// Create context
const ThemeContext = createContext();
import { API_BASE_URL } from '../config/api';

export const useTheme = () => useContext(ThemeContext); 

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  // Injected style elements
  const [styleElement, setStyleElement] = useState(null);
  const [navbarStyleElement, setNavbarStyleElement] = useState(null);

  // Fetch active theme from backend
  const fetchActiveTheme = async () => {
    try {
     const response = await fetch(`${API_BASE_URL}/api/themes/active`);
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.name === "None" || !data.colors) {
        setTheme(null);
        removeInlineThemeCSS();
        removeNavbarThemeCSS();
      } else {
        setTheme(data);
        applyThemeCSS(data.name, data.colors);
        applyNavbarThemeCSS(data.name, data.colors);
      }
    } catch (error) {
      console.error("Error fetching active theme:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply inline CSS for specific themes
  const applyThemeCSS = (themeName, colors) => {
    removeInlineThemeCSS(); // remove old one if exists

    const style = document.createElement("style");
    style.id = "theme-styles";

    if (themeName.toLowerCase() === "diwali") {
      style.innerHTML = `
        .cake-card-bag, .cake-card-bag * {
          background-color: #FF9933 !important;
          color: #FFFFF0 !important;
          border-radius: 50%;
          transition: background-color 0.3s, color 0.3s;
        }
        .cake-card-heart, .cake-card-heart * {
          background-color: #FF9933 !important;
          color: #FFFFF0 !important;
          border-radius: 50%;
          transition: background-color 0.3s, color 0.3s;
        }
        .cake-card-bag:hover, .cake-card-heart:hover,
        .cake-card-bag:hover *, .cake-card-heart:hover * {
          background-color: #FFD700 !important;
          color: #FF9933 !important;
        }
      `;
    } else if (themeName.toLowerCase() === "christmas") {
      style.innerHTML = `
        .cake-card-bag, .cake-card-bag * {
          background-color: #C41E3A !important;
          color: #F8F8F8 !important;
          border-radius: 50%;
          transition: background-color 0.3s, color 0.3s;
        }
        .cake-card-heart, .cake-card-heart * {
          background-color: #C41E3A !important;
          color: #F8F8F8 !important;
          border-radius: 50%;
          transition: background-color 0.3s, color 0.3s;
        }
        .cake-card-bag:hover, .cake-card-heart:hover,
        .cake-card-bag:hover *, .cake-card-heart:hover * {
          background-color: #1E792C !important;
          color: #FFFFFF !important;
        }
      `;
    }
    // Add other theme styles here as needed

    document.head.appendChild(style);
    setStyleElement(style);
  };

  // Apply navbar-specific CSS for themes
  const applyNavbarThemeCSS = (themeName, colors) => {
    removeNavbarThemeCSS(); // remove old one if exists

    const style = document.createElement("style");
    style.id = "navbar-theme-styles";

    if (themeName.toLowerCase() === "diwali") {
      style.innerHTML = `
        .navbar-rb {
          background-color: #FFFFF0 !important;
          box-shadow: 0 4px 10px rgba(255, 153, 51, 0.3) !important;
        }
        
        .navbar-item.active {
          color: #FF9933 !important;
          border-bottom: 2px solid #FF9933 !important;
        }
        
        .navbar-item:hover {
          color: #FF9933 !important;
        }
        
        .icon-circle {
          background-color: #FFFFF0 !important;
          border: 1px solid #FF9933 !important;
        }
        
        .icon-circle:hover {
          background-color: #FF9933 !important;
        }
        
        .icon-circle:hover svg path,
        .icon-circle:hover svg circle,
        .icon-circle:hover svg rect,
        .icon-circle:hover svg line {
          stroke: #FFFFF0 !important;
        }
        
        .mobile-menu-toggle svg path {
          stroke: #FF9933 !important;
        }
        
        .navbar-menu.mobile-active {
          background-color: #FFFFF0 !important;
          border-left: 2px solid #FF9933 !important;
        }

        /* Cake card bag and heart in navbar */
        .navbar-icons .icon-circle:nth-child(3) svg path,
        .navbar-icons .icon-circle:nth-child(5) svg path {
          stroke: #FF9933 !important;
        }
        
        .navbar-icons .icon-circle:nth-child(3):hover svg path,
        .navbar-icons .icon-circle:nth-child(5):hover svg path {
          stroke: #FFFFF0 !important;
        }
      `;
    } else if (themeName.toLowerCase() === "christmas") {
      style.innerHTML = `
        .navbar-rb {
          background-color: #F8F8F8 !important;
          box-shadow: 0 4px 10px rgba(196, 30, 58, 0.3) !important;
        }
        
        .navbar-item.active {
          color: #C41E3A !important;
          border-bottom: 2px solid #C41E3A !important;
        }
        
        .navbar-item:hover {
          color: #C41E3A !important;
        }
        
        .icon-circle {
          background-color: #F8F8F8 !important;
          border: 1px solid #C41E3A !important;
        }
        
        .icon-circle:hover {
          background-color: #C41E3A !important;
        }
        
        .icon-circle:hover svg path,
        .icon-circle:hover svg circle,
        .icon-circle:hover svg rect,
        .icon-circle:hover svg line {
          stroke: #F8F8F8 !important;
        }
        
        .mobile-menu-toggle svg path {
          stroke: #C41E3A !important;
        }
        
        .navbar-menu.mobile-active {
          background-color: #F8F8F8 !important;
          border-left: 2px solid #C41E3A !important;
        }

        /* Cake card bag and heart in navbar */
        .navbar-icons .icon-circle:nth-child(3) svg path,
        .navbar-icons .icon-circle:nth-child(5) svg path {
          stroke: #C41E3A !important;
        }
        
        .navbar-icons .icon-circle:nth-child(3):hover svg path,
        .navbar-icons .icon-circle:nth-child(5):hover svg path {
          stroke: #F8F8F8 !important;
        }

        /* Christmas decorations around logo */
        .navbar-logo {
          position: relative;
        }
        
        .navbar-logo::before,
        .navbar-logo::after {
          content: "";
          position: absolute;
          width: 24px;
          height: 24px;
          background-repeat: no-repeat;
          background-size: contain;
          z-index: 1;
          animation: bounce 2s infinite;
        }
        
        .navbar-logo::before {
          left: -30px;
          top: 50%;
          transform: translateY(-50%);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50,10 L60,30 L80,30 L65,45 L75,70 L50,55 L25,70 L35,45 L20,30 L40,30 Z' fill='%23C41E3A'/%3E%3Ccircle cx='50' cy='10' r='5' fill='%23FFD700'/%3E%3C/svg%3E");
        }
        
        .navbar-logo::after {
          right: -30px;
          top: 50%;
          transform: translateY(-50%);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%231E792C'/%3E%3Ccircle cx='50' cy='50' r='30' fill='%23C41E3A'/%3E%3Ccircle cx='50' cy='50' r='20' fill='%23FFFFFF'/%3E%3Ccircle cx='50' cy='50' r='10' fill='%23FFD700'/%3E%3C/svg%3E");
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(-50%) scale(1); }
          50% { transform: translateY(-50%) scale(1.1); }
        }
        
        /* Christmas lights animation */
        .navbar-rb::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(
            90deg,
            #C41E3A 0%, #C41E3A 20%,
            #1E792C 20%, #1E792C 40%,
            #FFFFFF 40%, #FFFFFF 60%,
            #FFD700 60%, #FFD700 80%,
            #C41E3A 80%, #C41E3A 100%
          );
          background-size: 200% 100%;
          animation: lights 3s linear infinite;
          z-index: 2;
        }
        
        @keyframes lights {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        
        /* Snowflakes around navbar */
        .navbar-rb {
          position: relative;
          overflow: hidden;
        }
        
        .snowflake {
          position: absolute;
          color: #FFFFFF;
          font-size: 12px;
          pointer-events: none;
          animation: snowFall 5s linear infinite;
          z-index: 1;
        }
        
        @keyframes snowFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(50px) rotate(360deg); opacity: 0; }
        }
      `;
    }
    // Add other theme navbar styles here as needed

    document.head.appendChild(style);
    setNavbarStyleElement(style);

    // Add snowflakes for Christmas theme
    if (themeName.toLowerCase() === "christmas") {
      addSnowflakes();
    }
  };

  // Add snowflakes animation for Christmas theme
  const addSnowflakes = () => {
    // Remove existing snowflakes
    document.querySelectorAll('.snowflake').forEach(el => el.remove());
    
    // Add new snowflakes
    const navbar = document.querySelector('.navbar-rb');
    if (navbar) {
      for (let i = 0; i < 15; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = '❄';
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        snowflake.style.fontSize = `${Math.random() * 8 + 8}px`;
        navbar.appendChild(snowflake);
      }
    }
  };

  const removeInlineThemeCSS = () => {
    const existingStyle = document.getElementById("theme-styles");
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    if (styleElement) {
      setStyleElement(null);
    }
  };

  const removeNavbarThemeCSS = () => {
    const existingStyle = document.getElementById("navbar-theme-styles");
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    // Remove snowflakes
    document.querySelectorAll('.snowflake').forEach(el => el.remove());
    if (navbarStyleElement) {
      setNavbarStyleElement(null);
    }
  };

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, loading, fetchActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
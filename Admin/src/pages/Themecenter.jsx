import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import { API_BASE_URL } from '../../../src/config/api.js';

const ThemeCenter = () => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Default themes (static in frontend)
  const defaultThemes = [
    {
      id: 1,
      name: 'Christmas',
      image: 'https://images.ctfassets.net/hrltx12pl8hq/JdxgoNHHSieq2fIgsCTB1/e5a28be014257ce1b1c0f758ccba3c94/christmas-images.jpg?fit=fill&w=1200&h=630',
      colors: {
        primary: '#C41E3A',
        secondary: '#1E792C',
        accent: '#FFFFFF',
        background: '#F8F8F8'
      }
    },
    {
      id: 2,
      name: 'Diwali',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQQ_aXdRNnGaLnkw0H4lM2NLLt7vyytUB9TdXoUU1Qmmo-SVIVwRz9bcJdH8YleJixF3o&usqp=CAU',
      colors: {
        primary: '#FF9933',
        secondary: '#138808',
        accent: '#000080',
        background: '#FFFFF0'
      }
    },
    // ... add more festivals if you want
  ];

  // Add a "None" option to reset theme
  const themesWithNone = [
    {
      id: 0,
      name: 'None',
      image: 'https://www.shutterstock.com/image-illustration/none-flat-icon-260nw-1266167038.jpg',
      colors: null
    },
    ...defaultThemes
  ];

  // Fetch current active theme from backend
  const fetchActiveTheme = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/themes/active`);
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const data = await response.json();

      if (data.name === "None") {
        // No active theme
        setCurrentTheme("default");
        setSelectedFestival(null);
        applyThemeToDocument(null);
      } else {
        setCurrentTheme(data.name);
        setSelectedFestival(data);
        applyThemeToDocument(data);
      }
    } catch (err) {
      console.error('Error fetching active theme:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply theme to document styles
  const applyThemeToDocument = (theme) => {
    if (theme?.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}-color`, value);
      });
    } else {
      // Reset to default (remove theme vars)
      document.documentElement.style.removeProperty('--primary-color');
      document.documentElement.style.removeProperty('--secondary-color');
      document.documentElement.style.removeProperty('--accent-color');
      document.documentElement.style.removeProperty('--background-color');
    }
  };

  // Apply & save theme to backend
  const applyTheme = async (theme) => {
    try {
      if (theme.id === 0) {
        // Reset to none → clear backend active theme
        await fetch(`${API_BASE_URL}/api/themes/reset`, {
          method: 'PATCH'
        });

        setCurrentTheme('default');
        setSelectedFestival(null);
        applyThemeToDocument(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/themes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });

      if (!response.ok) throw new Error('Failed to save theme');

      const savedTheme = await response.json();
      setCurrentTheme(savedTheme.name);
      setSelectedFestival(savedTheme);
      applyThemeToDocument(savedTheme);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  if (loading) return <div className="loading">Loading themes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="theme-center">
      <header className="theme-center-header">
        <h1>Theme Center</h1>
        <p>Select a festival theme to apply to your website</p>
        {selectedFestival ? (
          <div className="current-theme">
            Current Active Theme:{" "}
            <span style={{ color: selectedFestival.colors?.primary || 'black' }}>
              {selectedFestival.name}
            </span>
          </div>
        ) : (
          <div className="current-theme">No active theme</div>
        )}
      </header>

      <div className="festival-grid">
        {themesWithNone.map((festival) => (
          <div
            key={festival.id}
            className={`festival-card ${currentTheme === festival.name ? 'active' : ''}`}
            onClick={() => applyTheme(festival)}
          >
            <div
              className="festival-image"
              style={{ backgroundImage: `url(${festival.image})` }}
            >
              <div className="festival-overlay">
                <h3>{festival.name}</h3>
                <button className="apply-button">Apply Theme</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeCenter;

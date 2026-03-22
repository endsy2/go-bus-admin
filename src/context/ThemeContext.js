import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme || 'light';
    // Set the data-theme attribute immediately
    document.documentElement.setAttribute('data-theme', initialTheme);
    return initialTheme;
  });

  useEffect(() => {
    localStorage.setItem('theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
    console.log('Theme changed to:', mode); // Debug log
  }, [mode]);

  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const theme = {
    mode,
    isDark: mode === 'dark',
    toggleTheme,
    setMode,
    colors: {
      primary: '#4169E1',
      primaryDark: '#2952CC',
      primaryLight: '#6B8EF5',
      bgColor: '#F5F7FA',
      textDark: '#2C3E50',
      textLight: '#7F8C8D',
      white: '#FFFFFF',
      success: '#27AE60',
      warning: '#F39C12',
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

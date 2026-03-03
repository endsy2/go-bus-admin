import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const theme = {
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

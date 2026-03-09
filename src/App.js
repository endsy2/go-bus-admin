import React, { useState, useEffect } from 'react';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/organisms/Sidebar/Sidebar';
import DashboardPage from './components/pages/DashboardPage/DashboardPage';
import BookingsPage from './components/pages/BookingsPage/BookingsPage';
import BusesPage from './components/pages/BusesPage/BusesPage';
import RoutesPage from './components/pages/RoutesPage/RoutesPage';
import CustomersPage from './components/pages/CustomersPage/CustomersPage';
import ReportsPage from './components/pages/ReportsPage/ReportsPage';
import TeamPage from './components/pages/TeamPage/TeamPage';
import LoginPage from './components/pages/LoginPage/LoginPage';
import RegisterPage from './components/pages/RegisterPage/RegisterPage';
import UnauthorizedDialog from './components/molecules/UnauthorizedDialog/UnauthorizedDialog';
import { setUnauthorizedHandler } from './utils/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showUnauthorizedDialog, setShowUnauthorizedDialog] = useState(false);

  useEffect(() => {
    // Set global unauthorized handler
    setUnauthorizedHandler(() => {
      setShowUnauthorizedDialog(true);
    });

    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Fetch fresh profile data
      fetchProfile(userData);
    }
  }, []);

  const fetchProfile = async (userData) => {
    try {
      const token = userData?.token || userData?.accessToken;
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Unauthorized - show dialog
        setShowUnauthorizedDialog(true);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        const profile = result.data || result;
        
        // Update user state with fresh profile
        const updatedUser = {
          ...userData,
          ...profile
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to fetch profile on app load:', error);
    }
  };

  const handleUnauthorizedOk = () => {
    setShowUnauthorizedDialog(false);
    handleLogout();
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setShowRegister(false);
  };

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterPage 
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'bookings':
        return <BookingsPage />;
      case 'buses':
        return <BusesPage />;
      case 'routes':
        return <RoutesPage />;
      case 'customers':
        return <CustomersPage />;
      case 'reports':
        return <ReportsPage />;
      case 'team':
        return <TeamPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ThemeProvider>
      <div className="App">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
        />
        {renderPage()}
      </div>
      <UnauthorizedDialog 
        isOpen={showUnauthorizedDialog}
        onOk={handleUnauthorizedOk}
      />
    </ThemeProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/organisms/Sidebar/Sidebar';
import TopBar from './components/molecules/TopBar/TopBar';
import DashboardPage from './components/pages/DashboardPage/DashboardPage';
import BookingsPage from './components/pages/BookingsPage/BookingsPage';
import BusesPage from './components/pages/BusesPage/BusesPage';
import RoutesPage from './components/pages/RoutesPage/RoutesPage';
import CustomersPage from './components/pages/CustomersPage/CustomersPage';
import ReportsPage from './components/pages/ReportsPage/ReportsPage';
import TeamPage from './components/pages/TeamPage/TeamPage';
import LoginPage from './components/pages/LoginPage/LoginPage';
import UnauthorizedDialog from './components/molecules/UnauthorizedDialog/UnauthorizedDialog';
import { ToastProvider } from './components/ui/toast';
import { setUnauthorizedHandler, userService } from './services';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
      const result = await userService.getProfile();
      const profile = result.data || result;
      
      // Update user state with fresh profile
      const updatedUser = {
        ...userData,
        ...profile
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
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
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.setItem('locale', 'en'); // Reset language to English
    setUser(null);
    setIsAuthenticated(false);
    window.location.reload(); // Reload to apply language change
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
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
    <ToastProvider>
      <div className="App">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
        />
        <div className="main-content">
          <TopBar />
          <div className="page-content">
            {renderPage()}
          </div>
        </div>
        <UnauthorizedDialog 
          isOpen={showUnauthorizedDialog}
          onOk={handleUnauthorizedOk}
        />
      </div>
    </ToastProvider>
  );
}

export default App;

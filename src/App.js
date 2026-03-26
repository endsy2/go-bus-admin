import React, { useState, useEffect } from 'react';
import './App.css';
import { Sidebar } from './shared/components/layout/Sidebar';
import { TopBar } from './shared/components/layout/TopBar';
import { UnauthorizedDialog } from './shared/components/feedback/UnauthorizedDialog';
import { ToastProvider } from './shared/components/ui/toast';

// Feature imports
import { LoginPage } from './features/auth';
import { DashboardPage } from './features/dashboard';
import { BusesPage } from './features/buses';
import { RoutesPage } from './features/routes';
import { CustomersPage } from './features/customers';
import { BookingsPage } from './features/bookings';
import { ReportsPage } from './features/reports';
import { TeamPage, userService } from './features/team';
import { SchedulesPage } from './features/schedules';
import { LayoutsPage } from './features/layouts';
import { PromosPage } from './features/promos';
import { PaymentsPage } from './features/payments';
import { WalletsPage } from './features/wallets';
import { NotificationsPage } from './features/notifications';
import { AdminPage } from './features/admin';

// Services
import { setUnauthorizedHandler } from './services';

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
      case 'schedules':
        return <SchedulesPage />;
      case 'layouts':
        return <LayoutsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'promos':
        return <PromosPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'wallets':
        return <WalletsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'team':
        return <TeamPage />;
      case 'admin':
        return <AdminPage />;
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

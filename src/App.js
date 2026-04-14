import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { WalletsPage } from './features/wallets';
import { NotificationsPage } from './features/notifications';
import { AdminPage } from './features/admin';
import { ProfilePage } from './features/profile';

// Services
import { setUnauthorizedHandler } from './services';

// Protected Route wrapper
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main Layout component
const MainLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab from current path
  const getActiveTab = () => {
    const path = location.pathname.slice(1); // Remove leading slash
    return path || 'dashboard';
  };

  const handleTabChange = (tab) => {
    navigate(`/${tab}`);
  };

  return (
    <div className="App">
      <Sidebar 
        activeTab={getActiveTab()} 
        setActiveTab={handleTabChange}
        user={user}
        onLogout={onLogout}
      />
      <div className="main-content">
        <TopBar />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/buses" element={<BusesPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/layouts" element={<LayoutsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/promos" element={<PromosPage />} />
            <Route path="/wallets" element={<WalletsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showUnauthorizedDialog, setShowUnauthorizedDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[App] Initializing app...');
    
    // Set global unauthorized handler
    setUnauthorizedHandler(() => {
      console.log('[App] Unauthorized access detected');
      setShowUnauthorizedDialog(true);
    });

    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    console.log('[App] Checking stored user:', storedUser ? 'Found' : 'Not found');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      console.log('[App] Stored user data:', userData);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Fetch fresh profile data
      console.log('[App] Fetching fresh profile data...');
      fetchProfile(userData);
    } else {
      console.log('[App] No stored user, setting loading to false');
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (userData) => {
    console.log('[App] fetchProfile started for user:', userData.email || userData.username);
    try {
      console.log('[App] Calling userService.getProfile()...');
      const result = await userService.getProfile();
      console.log('[App] Profile fetch result:', result);
      
      const profile = result.data || result;
      console.log('[App] Extracted profile:', profile);
      
      // Update user state with fresh profile
      const updatedUser = {
        ...userData,
        ...profile
      };
      console.log('[App] Updated user data:', updatedUser);
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('[App] User state and localStorage updated successfully');
    } catch (error) {
      console.error('[App] Failed to fetch profile on app load:', error);
      console.error('[App] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      console.log('[App] fetchProfile completed, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleUnauthorizedOk = () => {
    console.log('[App] Unauthorized dialog OK clicked');
    setShowUnauthorizedDialog(false);
    handleLogout();
  };

  const handleLoginSuccess = (userData) => {
    console.log('[App] Login success, user data:', userData);
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const handleLogout = () => {
    console.log('[App] Logging out user');
    localStorage.removeItem('user');
    localStorage.setItem('locale', 'en'); // Reset language to English
    setUser(null);
    setIsAuthenticated(false);
    console.log('[App] Redirecting to login page');
    window.location.href = '/login'; // Navigate to login
  };

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('[App] Rendering loading screen');
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('[App] Rendering main app, isAuthenticated:', isAuthenticated);

  return (
    <Router>
      <ToastProvider>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              )
            } 
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <MainLayout user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
        </Routes>
        <UnauthorizedDialog 
          isOpen={showUnauthorizedDialog}
          onOk={handleUnauthorizedOk}
        />
      </ToastProvider>
    </Router>
  );
}

export default App;

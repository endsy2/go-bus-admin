import React, { useState } from 'react';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/organisms/Sidebar/Sidebar';
import DashboardPage from './components/pages/DashboardPage/DashboardPage';
import BookingsPage from './components/pages/BookingsPage/BookingsPage';
import BusesPage from './components/pages/BusesPage/BusesPage';
import RoutesPage from './components/pages/RoutesPage/RoutesPage';
import CustomersPage from './components/pages/CustomersPage/CustomersPage';
import ReportsPage from './components/pages/ReportsPage/ReportsPage';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ThemeProvider>
      <div className="App">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        {renderPage()}
      </div>
    </ThemeProvider>
  );
}

export default App;

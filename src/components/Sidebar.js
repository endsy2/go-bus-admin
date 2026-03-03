import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'bookings', icon: '🎫', label: 'Bookings' },
    { id: 'buses', icon: '🚌', label: 'Buses' },
    { id: 'routes', icon: '🗺️', label: 'Routes' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'reports', icon: '📈', label: 'Reports' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🚍 BusBooking</h2>
        <p>Admin Panel</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

import React from 'react';
import NavItem from '../../molecules/NavItem/NavItem';
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
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

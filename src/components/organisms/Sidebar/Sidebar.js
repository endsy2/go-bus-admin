import React, { useState } from 'react';
import NavItem from '../../molecules/NavItem/NavItem';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'bookings', icon: '🎫', label: 'Bookings' },
    { id: 'buses', icon: '🚌', label: 'Buses' },
    { id: 'routes', icon: '🗺️', label: 'Routes' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'reports', icon: '📈', label: 'Reports' },
  ];

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

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
      <div className="sidebar-footer">
        <div className="profile-section">
          <div className="profile-icon">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className="profile-info">
            <div className="profile-name">{user?.fullName || 'User'}</div>
            <div className="profile-username">@{user?.userName || 'username'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogoutClick}>
          Logout
        </button>
      </div>

      {showLogoutDialog && (
        <div className="logout-dialog-overlay" onClick={cancelLogout}>
          <div className="logout-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="dialog-actions">
              <button className="btn-cancel" onClick={cancelLogout}>Cancel</button>
              <button className="btn-confirm" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

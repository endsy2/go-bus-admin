import React, { useState } from 'react';
import NavItem from '../../molecules/NavItem/NavItem';
import Icon from '../../atoms/Icon/Icon';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { locale } = useLocale();
  
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const menuItems = [
    { id: 'dashboard', icon: <Icon name="dashboard" />, label: t('dashboard') },
    { id: 'bookings', icon: <Icon name="calendar" />, label: t('bookings') },
    { id: 'buses', icon: <Icon name="bus" />, label: t('buses') },
    { id: 'routes', icon: <Icon name="mapPin" />, label: t('routes') },
    { id: 'customers', icon: <Icon name="users" />, label: t('customers') },
    { id: 'reports', icon: <Icon name="barChart" />, label: t('reports') },
  ];

  const teamItems = [
    { id: 'team', icon: <Icon name="userCheck" />, label: t('team') },
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
        <h2>
          <Icon name="bus" size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          BusBooking
        </h2>
        <p>Admin Panel</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Main</div>
          {menuItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Team</div>
          {teamItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="profile-section">
          <div className="profile-icon">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className="profile-info">
            <div className="profile-name">{user?.userName || 'User'}</div>
            <div className="profile-username">{user?.email || 'email'}</div>
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

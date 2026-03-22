import React, { useState } from 'react';
import NavItem from '../../molecules/NavItem/NavItem';
import Icon from '../../atoms/Icon/Icon';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import { hasPermission } from '../../../utils/permissions';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { locale } = useLocale();
  
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  // Define all possible menu items with their permission requirements
  const allMenuItems = [
    { 
      id: 'dashboard', 
      icon: <Icon name="dashboard" />, 
      label: t('dashboard'),
      requiresPermission: null // Dashboard is always accessible
    },
    { 
      id: 'bookings', 
      icon: <Icon name="calendar" />, 
      label: t('bookings'),
      requiresPermission: 'BOOKING_READ'
    },
    { 
      id: 'buses', 
      icon: <Icon name="bus" />, 
      label: t('buses'),
      requiresPermission: 'BUS_READ'
    },
    { 
      id: 'routes', 
      icon: <Icon name="mapPin" />, 
      label: t('routes'),
      requiresPermission: 'BUS_READ' // Routes are part of bus management
    },
    { 
      id: 'customers', 
      icon: <Icon name="users" />, 
      label: t('customers'),
      requiresPermission: 'USER_READ'
    },
    { 
      id: 'reports', 
      icon: <Icon name="barChart" />, 
      label: t('reports'),
      requiresPermission: 'ADMIN_ACCESS' // Reports typically need admin access
    },
  ];

  const allTeamItems = [
    { 
      id: 'team', 
      icon: <Icon name="userCheck" />, 
      label: t('team'),
      requiresPermission: 'ADMIN_ACCESS' // Team management needs admin access
    },
  ];

  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter(item => {
    if (!item.requiresPermission) return true; // Always show items without permission requirements
    return hasPermission(user, item.requiresPermission);
  });

  const teamItems = allTeamItems.filter(item => {
    if (!item.requiresPermission) return true;
    return hasPermission(user, item.requiresPermission);
  });

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
        <div className="logo-container">
          <img src="/go_bus_new_logo.png" alt="GoBus Logo" className="sidebar-logo" />
        </div>
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

        {teamItems.length > 0 && (
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
        )}
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

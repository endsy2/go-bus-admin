import React, { useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { translations } from '../locales/translations';
import Icon from './atoms/Icon/Icon';
import SettingsPanel from './molecules/SettingsPanel/SettingsPanel';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { locale } = useLocale();
  const [showSettings, setShowSettings] = useState(false);
  
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: t('dashboard') },
    { id: 'bookings', icon: 'calendar', label: t('bookings') },
    { id: 'buses', icon: 'bus', label: t('buses') },
    { id: 'routes', icon: 'mapPin', label: t('routes') },
    { id: 'customers', icon: 'users', label: t('customers') },
    { id: 'reports', icon: 'barChart', label: t('reports') },
  ];

  return (
    <>
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
              <span className="nav-icon">
                <Icon name={item.icon} size={20} />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            <Icon name="settings" size={20} />
            <span>{t('settings')}</span>
          </button>
        </div>
      </div>

      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};

export default Sidebar;

import React from 'react';
import './NavItem.css';

const NavItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </button>
  );
};

export default NavItem;

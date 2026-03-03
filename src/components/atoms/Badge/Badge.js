import React from 'react';
import './Badge.css';

const Badge = ({ children, variant = 'confirmed' }) => {
  return (
    <span className={`badge badge-${variant.toLowerCase()}`}>
      {children}
    </span>
  );
};

export default Badge;

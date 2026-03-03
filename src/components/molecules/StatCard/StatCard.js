import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, change }) => {
  const isPositive = change.startsWith('+');

  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        <span className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {change}
        </span>
      </div>
    </div>
  );
};

export default StatCard;

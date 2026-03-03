import React from 'react';
import StatCard from '../../molecules/StatCard/StatCard';
import './StatsGrid.css';

const StatsGrid = ({ stats, loading }) => {
  if (loading) {
    return <div className="loading">Loading stats...</div>;
  }

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          change={stat.change}
        />
      ))}
    </div>
  );
};

export default StatsGrid;

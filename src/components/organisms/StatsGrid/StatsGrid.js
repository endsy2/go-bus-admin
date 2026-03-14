import React from 'react';
import StatCard from '../../molecules/StatCard/StatCard';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './StatsGrid.css';

const StatsGrid = ({ stats, loading }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  
  if (loading) {
    return <div className="loading">{t('loadingStats')}</div>;
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

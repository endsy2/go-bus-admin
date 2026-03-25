import React from 'react';
import StatsGrid from '../../components/StatsGrid/StatsGrid';
import { BookingTable } from 'features/bookings';
import { useStats } from '../../hooks/useStats';
import { useBookings } from 'features/bookings';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import './DashboardPage.css';

const DashboardPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { stats, loading: statsLoading } = useStats();
  const { bookings, loading: bookingsLoading } = useBookings();

  const isLoading = statsLoading || bookingsLoading;

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div className="shimmer shimmer-header"></div>
          <div className="shimmer shimmer-subtitle"></div>
        </div>

        <div className="shimmer-stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer-stat-card">
              <div className="shimmer shimmer-stat-icon"></div>
              <div className="shimmer-stat-content">
                <div className="shimmer shimmer-stat-value"></div>
                <div className="shimmer shimmer-stat-label"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="shimmer-table">
          <div className="shimmer shimmer-table-header"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="shimmer-table-row">
              <div className="shimmer shimmer-table-cell"></div>
              <div className="shimmer shimmer-table-cell"></div>
              <div className="shimmer shimmer-table-cell small"></div>
              <div className="shimmer shimmer-table-cell medium"></div>
              <div className="shimmer shimmer-table-cell small"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>{t('dashboard')}</h1>
        <p>{t('welcomeBack')}</p>
      </div>

      <StatsGrid stats={stats} loading={statsLoading} />
      <BookingTable bookings={bookings} loading={bookingsLoading} />
    </div>
  );
};

export default DashboardPage;

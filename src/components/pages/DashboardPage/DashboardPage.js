import React from 'react';
import StatsGrid from '../../organisms/StatsGrid/StatsGrid';
import BookingTable from '../../organisms/BookingTable/BookingTable';
import { useStats } from '../../../hooks/useStats';
import { useBookings } from '../../../hooks/useBookings';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './DashboardPage.css';

const DashboardPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { stats, loading: statsLoading } = useStats();
  const { bookings, loading: bookingsLoading } = useBookings();

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

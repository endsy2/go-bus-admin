import React from 'react';
import StatsGrid from '../../organisms/StatsGrid/StatsGrid';
import BookingTable from '../../organisms/BookingTable/BookingTable';
import { useStats } from '../../../hooks/useStats';
import { useBookings } from '../../../hooks/useBookings';
import './DashboardPage.css';

const DashboardPage = () => {
  const { stats, loading: statsLoading } = useStats();
  const { bookings, loading: bookingsLoading } = useBookings();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <StatsGrid stats={stats} loading={statsLoading} />
      <BookingTable bookings={bookings} loading={bookingsLoading} />
    </div>
  );
};

export default DashboardPage;

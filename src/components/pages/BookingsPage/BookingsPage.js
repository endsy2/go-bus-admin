import React, { useState } from 'react';
import { useBookings } from '../../../hooks/useBookings';
import Badge from '../../atoms/Badge/Badge';
import Button from '../../atoms/Button/Button';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './BookingsPage.css';

const BookingsPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { bookings, loading } = useBookings();
  const [filter, setFilter] = useState('all');

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="page-header">
          <div>
            <div className="shimmer shimmer-header"></div>
            <div className="shimmer shimmer-subtitle"></div>
          </div>
          <div className="shimmer shimmer-button"></div>
        </div>

        <div className="shimmer-filter-bar">
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer shimmer-filter-button"></div>
          ))}
        </div>

        <div className="shimmer-bookings-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="shimmer-booking-card">
              <div className="shimmer-booking-header">
                <div className="shimmer shimmer-booking-id"></div>
                <div className="shimmer shimmer-booking-status"></div>
              </div>
              <div className="shimmer-booking-info">
                {[1, 2, 3].map(j => (
                  <div key={j} className="shimmer-info-row">
                    <div className="shimmer shimmer-info-label"></div>
                    <div className="shimmer shimmer-info-value"></div>
                  </div>
                ))}
              </div>
              <div className="shimmer-booking-actions">
                <div className="shimmer shimmer-action-button"></div>
                <div className="shimmer shimmer-action-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h1>{t('bookingsManagement')}</h1>
          <p>{t('manageAllBusTicketBookings')}</p>
        </div>
        <Button variant="primary">+ {t('newBooking')}</Button>
      </div>

      <div className="filter-bar">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          {t('all')} ({bookings.length})
        </button>
        <button 
          className={filter === 'confirmed' ? 'active' : ''} 
          onClick={() => setFilter('confirmed')}
        >
          {t('confirmed')}
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          {t('pending')}
        </button>
      </div>

      <div className="bookings-grid">
        {filteredBookings.map(booking => (
          <div key={booking.id} className="booking-card">
            <div className="booking-header">
              <span className="booking-id">{booking.id}</span>
              <Badge variant={booking.status}>{t(booking.status.toLowerCase())}</Badge>
            </div>
            <div className="booking-info">
              <div className="info-row">
                <span className="label">👤 {t('customer')}:</span>
                <span className="value">{booking.customer}</span>
              </div>
              <div className="info-row">
                <span className="label">🗺️ {t('route')}:</span>
                <span className="value">{booking.route}</span>
              </div>
              <div className="info-row">
                <span className="label">📅 {t('date')}:</span>
                <span className="value">{booking.date}</span>
              </div>
            </div>
            <div className="booking-actions">
              <Button variant="secondary">{t('viewDetailsBtn')}</Button>
              <Button variant="primary">{t('edit')}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsPage;

import React from 'react';
import Badge from '../../atoms/Badge/Badge';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './BookingTable.css';

const BookingTable = ({ bookings, loading }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  
  if (loading) {
    return <div className="loading">{t('loadingBookings')}</div>;
  }

  return (
    <div className="booking-table">
      <h2>{t('recentBookings')}</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('bookingId')}</th>
              <th>{t('customer')}</th>
              <th>{t('route')}</th>
              <th>{t('date')}</th>
              <th>{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.customer}</td>
                <td>{booking.route}</td>
                <td>{booking.date}</td>
                <td>
                  <Badge variant={booking.status}>
                    {t(booking.status.toLowerCase())}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;

import React, { useState } from 'react';
import { useBookings } from '../../../hooks/useBookings';
import Badge from '../../atoms/Badge/Badge';
import Button from '../../atoms/Button/Button';
import './BookingsPage.css';

const BookingsPage = () => {
  const { bookings } = useBookings();
  const [filter, setFilter] = useState('all');

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status.toLowerCase() === filter);

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h1>Bookings Management</h1>
          <p>Manage all bus ticket bookings</p>
        </div>
        <Button variant="primary">+ New Booking</Button>
      </div>

      <div className="filter-bar">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All ({bookings.length})
        </button>
        <button 
          className={filter === 'confirmed' ? 'active' : ''} 
          onClick={() => setFilter('confirmed')}
        >
          Confirmed
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
      </div>

      <div className="bookings-grid">
        {filteredBookings.map(booking => (
          <div key={booking.id} className="booking-card">
            <div className="booking-header">
              <span className="booking-id">{booking.id}</span>
              <Badge variant={booking.status}>{booking.status}</Badge>
            </div>
            <div className="booking-info">
              <div className="info-row">
                <span className="label">👤 Customer:</span>
                <span className="value">{booking.customer}</span>
              </div>
              <div className="info-row">
                <span className="label">🗺️ Route:</span>
                <span className="value">{booking.route}</span>
              </div>
              <div className="info-row">
                <span className="label">📅 Date:</span>
                <span className="value">{booking.date}</span>
              </div>
            </div>
            <div className="booking-actions">
              <Button variant="secondary">View Details</Button>
              <Button variant="primary">Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsPage;

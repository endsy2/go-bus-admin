import React from 'react';
import Badge from '../../atoms/Badge/Badge';
import './BookingTable.css';

const BookingTable = ({ bookings, loading }) => {
  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="booking-table">
      <h2>Recent Bookings</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Date</th>
              <th>Status</th>
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
                    {booking.status}
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

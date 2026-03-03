import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { title: 'Total Bookings', value: '1,234', icon: '🎫', change: '+12%' },
    { title: 'Active Buses', value: '45', icon: '🚌', change: '+3%' },
    { title: 'Total Revenue', value: '$45,678', icon: '💰', change: '+18%' },
    { title: 'Customers', value: '892', icon: '👥', change: '+8%' },
  ];

  const recentBookings = [
    { id: 'BK001', customer: 'John Doe', route: 'NYC - Boston', date: '2026-03-05', status: 'Confirmed' },
    { id: 'BK002', customer: 'Jane Smith', route: 'LA - SF', date: '2026-03-06', status: 'Pending' },
    { id: 'BK003', customer: 'Mike Johnson', route: 'Chicago - Detroit', date: '2026-03-07', status: 'Confirmed' },
    { id: 'BK004', customer: 'Sarah Williams', route: 'Miami - Orlando', date: '2026-03-08', status: 'Confirmed' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <div className="stat-value">{stat.value}</div>
              <span className="stat-change positive">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-bookings">
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
              {recentBookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.customer}</td>
                  <td>{booking.route}</td>
                  <td>{booking.date}</td>
                  <td>
                    <span className={`status ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

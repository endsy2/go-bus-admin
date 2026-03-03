import React from 'react';
import Button from '../../atoms/Button/Button';
import './ReportsPage.css';

const ReportsPage = () => {
  const reports = [
    { title: 'Revenue Report', period: 'Monthly', lastGenerated: '2026-03-01', icon: '💰' },
    { title: 'Booking Analytics', period: 'Weekly', lastGenerated: '2026-02-28', icon: '📊' },
    { title: 'Customer Insights', period: 'Quarterly', lastGenerated: '2026-01-01', icon: '👥' },
    { title: 'Bus Performance', period: 'Monthly', lastGenerated: '2026-03-01', icon: '🚌' },
  ];

  const recentStats = [
    { label: 'Total Revenue (This Month)', value: '$45,678', change: '+18%', trend: 'up' },
    { label: 'Total Bookings (This Month)', value: '1,234', change: '+12%', trend: 'up' },
    { label: 'Average Ticket Price', value: '$37', change: '+5%', trend: 'up' },
    { label: 'Cancellation Rate', value: '3.2%', change: '-1.5%', trend: 'down' },
  ];

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>View business insights and generate reports</p>
        </div>
        <Button variant="primary">📥 Export All</Button>
      </div>

      <div className="stats-overview">
        <h2>Key Metrics</h2>
        <div className="metrics-grid">
          {recentStats.map((stat, index) => (
            <div key={index} className="metric-card">
              <div className="metric-label">{stat.label}</div>
              <div className="metric-value">{stat.value}</div>
              <div className={`metric-change ${stat.trend}`}>
                {stat.trend === 'up' ? '📈' : '📉'} {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="reports-section">
        <h2>Available Reports</h2>
        <div className="reports-grid">
          {reports.map((report, index) => (
            <div key={index} className="report-card">
              <div className="report-icon">{report.icon}</div>
              <div className="report-info">
                <h3>{report.title}</h3>
                <div className="report-meta">
                  <span>📅 {report.period}</span>
                  <span>🕒 Last: {report.lastGenerated}</span>
                </div>
              </div>
              <div className="report-actions">
                <Button variant="secondary">View</Button>
                <Button variant="primary">Generate</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

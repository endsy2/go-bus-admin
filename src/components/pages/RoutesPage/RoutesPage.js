import React from 'react';
import Button from '../../atoms/Button/Button';
import './RoutesPage.css';

const RoutesPage = () => {
  const routes = [
    { id: 'RT001', from: 'New York', to: 'Boston', distance: '215 miles', duration: '4h 30m', price: '$45', frequency: 'Daily' },
    { id: 'RT002', from: 'Los Angeles', to: 'San Francisco', distance: '382 miles', duration: '6h 15m', price: '$65', frequency: 'Daily' },
    { id: 'RT003', from: 'Chicago', to: 'Detroit', distance: '283 miles', duration: '5h', price: '$50', frequency: '3x/week' },
    { id: 'RT004', from: 'Miami', to: 'Orlando', distance: '235 miles', duration: '4h', price: '$40', frequency: 'Daily' },
    { id: 'RT005', from: 'Seattle', to: 'Portland', distance: '173 miles', duration: '3h 30m', price: '$35', frequency: 'Daily' },
  ];

  return (
    <div className="routes-page">
      <div className="page-header">
        <div>
          <h1>Routes Management</h1>
          <p>Manage bus routes and schedules</p>
        </div>
        <Button variant="primary">+ Add New Route</Button>
      </div>

      <div className="routes-list">
        {routes.map(route => (
          <div key={route.id} className="route-card">
            <div className="route-path">
              <div className="location">
                <div className="location-icon">📍</div>
                <div>
                  <div className="location-name">{route.from}</div>
                  <div className="location-label">Origin</div>
                </div>
              </div>
              <div className="route-line">
                <div className="line"></div>
                <div className="route-info-inline">
                  <span>🚌 {route.distance}</span>
                  <span>⏱️ {route.duration}</span>
                </div>
              </div>
              <div className="location">
                <div className="location-icon">📍</div>
                <div>
                  <div className="location-name">{route.to}</div>
                  <div className="location-label">Destination</div>
                </div>
              </div>
            </div>
            <div className="route-details">
              <div className="detail-item">
                <span className="detail-label">Route ID:</span>
                <span className="detail-value">{route.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Price:</span>
                <span className="detail-value price">{route.price}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Frequency:</span>
                <span className="detail-value">{route.frequency}</span>
              </div>
            </div>
            <div className="route-actions">
              <Button variant="secondary">View Schedule</Button>
              <Button variant="primary">Edit Route</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutesPage;

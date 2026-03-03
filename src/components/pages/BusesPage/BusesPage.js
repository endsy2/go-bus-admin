import React from 'react';
import Button from '../../atoms/Button/Button';
import './BusesPage.css';

const BusesPage = () => {
  const buses = [
    { id: 'BUS001', name: 'Express Deluxe', capacity: 45, type: 'AC Sleeper', status: 'Active', driver: 'John Smith' },
    { id: 'BUS002', name: 'City Cruiser', capacity: 52, type: 'AC Seater', status: 'Active', driver: 'Mike Johnson' },
    { id: 'BUS003', name: 'Comfort Plus', capacity: 40, type: 'Non-AC', status: 'Maintenance', driver: 'David Lee' },
    { id: 'BUS004', name: 'Royal Express', capacity: 48, type: 'AC Sleeper', status: 'Active', driver: 'Sarah Wilson' },
  ];

  return (
    <div className="buses-page">
      <div className="page-header">
        <div>
          <h1>Bus Fleet Management</h1>
          <p>Manage your bus fleet and assignments</p>
        </div>
        <Button variant="primary">+ Add New Bus</Button>
      </div>

      <div className="buses-grid">
        {buses.map(bus => (
          <div key={bus.id} className="bus-card">
            <div className="bus-icon">🚌</div>
            <div className="bus-details">
              <h3>{bus.name}</h3>
              <span className="bus-id">{bus.id}</span>
              <div className="bus-specs">
                <div className="spec-item">
                  <span className="spec-label">Capacity:</span>
                  <span className="spec-value">{bus.capacity} seats</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Type:</span>
                  <span className="spec-value">{bus.type}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Driver:</span>
                  <span className="spec-value">{bus.driver}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Status:</span>
                  <span className={`bus-status ${bus.status.toLowerCase()}`}>
                    {bus.status}
                  </span>
                </div>
              </div>
              <div className="bus-actions">
                <Button variant="secondary">View Details</Button>
                <Button variant="primary">Edit</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusesPage;

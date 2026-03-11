import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import Snackbar from '../../atoms/Snackbar/Snackbar';
import { apiRequest } from '../../../utils/api';
import './BusesPage.css';

const BusesPage = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/buses`, {
        method: 'GET'
      });

      const result = await response.json();

      if (response.ok) {
        const busesData = result.data || result;
        setBuses(Array.isArray(busesData) ? busesData : []);
        setError('');
      } else {
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to fetch buses');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching buses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="buses-page">
        <div className="loading-state">Loading buses...</div>
      </div>
    );
  }

  return (
    <div className="buses-page">
      <div className="page-header">
        <div>
          <h1>Bus Fleet Management</h1>
          <p>Manage your bus fleet and assignments</p>
        </div>
        <Button variant="primary">
          <Icon name="plus" size={18} />
          Add New Bus
        </Button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {buses.length === 0 ? (
        <div className="empty-state">
          <Icon name="bus" size={64} />
          <h3>No buses found</h3>
          <p>Start by adding your first bus to the fleet</p>
          <Button variant="primary">
            <Icon name="plus" size={18} />
            Add New Bus
          </Button>
        </div>
      ) : (
        <div className="buses-grid">
          {buses.map(bus => (
            <div key={bus.id} className="bus-card">
              <div className="bus-icon">🚌</div>
              <div className="bus-details">
                <h3>{bus.busNumber}</h3>
                <span className="bus-id">ID: {bus.id}</span>
                <div className="bus-specs">
                  <div className="spec-item">
                    <span className="spec-label">
                      <Icon name="users" size={14} />
                      Capacity:
                    </span>
                    <span className="spec-value">{bus.totalSeats} seats</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">
                      <Icon name="bus" size={14} />
                      Type:
                    </span>
                    <span className="spec-value">{bus.busType}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">
                      <Icon name="map" size={14} />
                      Route ID:
                    </span>
                    <span className="spec-value">{bus.routeId || 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">
                      <Icon name="grid" size={14} />
                      Layout ID:
                    </span>
                    <span className="spec-value">{bus.layoutId || 'N/A'}</span>
                  </div>
                </div>
                <div className="bus-actions">
                  <Button variant="secondary">
                    <Icon name="eye" size={16} />
                    View Details
                  </Button>
                  <Button variant="primary">
                    <Icon name="edit" size={16} />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        duration={3000}
      />
    </div>
  );
};

export default BusesPage;

import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import Snackbar from '../../atoms/Snackbar/Snackbar';
import BusDetailPage from '../BusDetailPage/BusDetailPage';
import { apiRequest } from '../../../utils/api';
import './BusesPage.css';

const BusesPage = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });
  const [selectedBusId, setSelectedBusId] = useState(null);

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

  // Generate fake plate number
  const generatePlateNumber = (id) => {
    const letters = ['ABC', 'XYZ', 'QWE', 'RTY', 'UIO'];
    const letter = letters[id % letters.length];
    const number = String(1000 + (id * 234)).slice(0, 4);
    return `${letter}-${number}`;
  };

  // Generate fake status
  const getStatus = (id) => {
    const statuses = ['Active', 'Active', 'Active', 'Maintenance', 'Standby'];
    return statuses[id % statuses.length];
  };

  // Get route name (fake for now)
  const getRouteName = (routeId) => {
    if (!routeId) return 'Not Assigned';
    const routes = {
      1: 'Downtown Express',
      2: 'Airport Shuttle',
      3: 'Cross Country',
      4: 'City Loop',
      5: 'Coastal Route'
    };
    return routes[routeId] || `Route ${routeId}`;
  };

  const handleViewDetails = (busId) => {
    setSelectedBusId(busId);
  };

  const handleBackToList = () => {
    setSelectedBusId(null);
    fetchBuses(); // Refresh the list
  };

  // Show detail page if a bus is selected
  if (selectedBusId) {
    return <BusDetailPage busId={selectedBusId} onBack={handleBackToList} />;
  }

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
        <div className="buses-table-container">
          <table className="buses-table">
            <thead>
              <tr>
                <th>BUS ID</th>
                <th>NAME/MODEL</th>
                <th>PLATE NUMBER</th>
                <th>ROUTE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {buses.map(bus => {
                const status = getStatus(bus.id);
                return (
                  <tr key={bus.id}>
                    <td className="bus-id-cell">B-{bus.id}</td>
                    <td>
                      <div className="bus-name-cell">
                        <div className="bus-name">{bus.busNumber}</div>
                        <div className="bus-type">{bus.busType}</div>
                      </div>
                    </td>
                    <td>{generatePlateNumber(bus.id)}</td>
                    <td>{getRouteName(bus.routeId)}</td>
                    <td>
                      <span className={`status-badge status-${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          title="View Details"
                          onClick={() => handleViewDetails(bus.id)}
                        >
                          <Icon name="eye" size={18} />
                        </button>
                        <button className="btn-icon" title="Delete">
                          <Icon name="trash" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

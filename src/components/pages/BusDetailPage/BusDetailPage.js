import React, { useState, useEffect } from 'react';
import Icon from '../../atoms/Icon/Icon';
import Button from '../../atoms/Button/Button';
import Snackbar from '../../atoms/Snackbar/Snackbar';
import ConfirmDialog from '../../molecules/ConfirmDialog/ConfirmDialog';
import { apiRequest } from '../../../utils/api';
import './BusDetailPage.css';

const BusDetailPage = ({ busId, onBack }) => {
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (busId) {
      fetchBusDetail();
    }
  }, [busId]);

  const fetchBusDetail = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/buses/${busId}`, {
        method: 'GET'
      });

      const result = await response.json();

      if (response.ok) {
        const busData = result.data || result;
        setBus(busData);
        setError('');
      } else {
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to fetch bus details');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching bus details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setSnackbar({
      isOpen: true,
      message: 'Edit functionality coming soon!',
      type: 'info'
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/buses/${busId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSnackbar({
          isOpen: true,
          message: 'Bus deleted successfully!',
          type: 'success'
        });
        setShowDeleteDialog(false);
        // Navigate back after a short delay
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        const result = await response.json();
        const errorData = result.data || result;
        setSnackbar({
          isOpen: true,
          message: errorData.message || 'Failed to delete bus',
          type: 'error'
        });
        setShowDeleteDialog(false);
      }
    } catch (err) {
      setSnackbar({
        isOpen: true,
        message: 'Network error. Failed to delete bus.',
        type: 'error'
      });
      setShowDeleteDialog(false);
      console.error('Error deleting bus:', err);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <div className="bus-detail-page">
        <div className="loading-state">Loading bus details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bus-detail-page">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <Icon name="arrowLeft" size={20} />
            Back to Buses
          </button>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="bus-detail-page">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <Icon name="arrowLeft" size={20} />
            Back to Buses
          </button>
        </div>
        <div className="empty-state">Bus not found</div>
      </div>
    );
  }

  return (
    <div className="bus-detail-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <Icon name="arrowLeft" size={20} />
          Back to Buses
        </button>
      </div>

      <div className="detail-container">
        {/* Bus Header Card */}
        <div className="bus-header-card">
          <div className="bus-icon-large">
            🚌
          </div>
          <div className="bus-header-info">
            <h1>{bus.busNumber}</h1>
            <span className="bus-type-badge">{bus.busType}</span>
            <div className="bus-meta">
              <span className="meta-item">
                <Icon name="users" size={16} />
                {bus.totalSeats} Seats
              </span>
              <span className="meta-item">
                <Icon name="hash" size={16} />
                Bus ID: {bus.id}
              </span>
            </div>
          </div>
          <div className="bus-actions">
            <Button variant="primary" onClick={handleEditClick}>
              <Icon name="edit" size={18} />
              Edit
            </Button>
            <Button variant="danger" onClick={handleDeleteClick}>
              <Icon name="trash" size={18} />
              Delete
            </Button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="details-grid">
          {/* Bus Information */}
          <div className="detail-card">
            <div className="card-header">
              <Icon name="bus" size={20} />
              <h3>Bus Information</h3>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <span className="detail-label">Bus Number</span>
                <span className="detail-value">{bus.busNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bus Type</span>
                <span className="detail-value">{bus.busType}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Seats</span>
                <span className="detail-value">{bus.totalSeats}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bus ID</span>
                <span className="detail-value">#{bus.id}</span>
              </div>
            </div>
          </div>

          {/* Route & Layout Information */}
          <div className="detail-card">
            <div className="card-header">
              <Icon name="map" size={20} />
              <h3>Route & Layout</h3>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <span className="detail-label">Route ID</span>
                <span className="detail-value">
                  {bus.routeId ? `#${bus.routeId}` : 'Not Assigned'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Layout ID</span>
                <span className="detail-value">
                  {bus.layoutId ? `#${bus.layoutId}` : 'Not Assigned'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value">Active</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="detail-card">
            <div className="card-header">
              <Icon name="barChart" size={20} />
              <h3>Statistics</h3>
            </div>
            <div className="card-body">
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Total Trips</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Active Bookings</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">$0.00</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Bus"
        message={`Are you sure you want to delete bus ${bus?.busNumber}?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

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

export default BusDetailPage;

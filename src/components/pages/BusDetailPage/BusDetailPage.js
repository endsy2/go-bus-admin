import React, { useState, useEffect } from 'react';
import Icon from '../../atoms/Icon/Icon';
import Button from '../../atoms/Button/Button';
import Snackbar from '../../atoms/Snackbar/Snackbar';
import ConfirmDialog from '../../molecules/ConfirmDialog/ConfirmDialog';
import EditBusDialog from '../../molecules/EditBusDialog/EditBusDialog';
import { apiRequest } from '../../../utils/api';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './BusDetailPage.css';

const BusDetailPage = ({ busId, onBack }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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
    setShowEditDialog(true);
  };

  const handleSaveEdit = async (updatedBus) => {
    setBus(updatedBus);
    setShowEditDialog(false);
    setSnackbar({
      isOpen: true,
      message: t('busUpdatedSuccess') || 'Bus updated successfully!',
      type: 'success'
    });
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
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
          message: t('busDeletedSuccess'),
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
        <div className="loading-state">{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bus-detail-page">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <Icon name="arrowLeft" size={20} />
            {t('backToBuses')}
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
            {t('backToBuses')}
          </button>
        </div>
        <div className="empty-state">{t('busNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="bus-detail-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <Icon name="arrowLeft" size={20} />
          {t('backToBuses')}
        </button>
      </div>

      <div className="detail-container">
        {/* Bus Header Card */}
        <div className="bus-header-card">
          <div className="bus-icon-large">
            <Icon name="bus" size={48} />
          </div>
          <div className="bus-header-info">
            <h1>{bus.busNumber}</h1>
            <span className={`bus-status-badge status-${(bus.status || bus.busStatus || 'active').toLowerCase()}`}>
              {bus.status || bus.busStatus || 'Active'}
            </span>
            <div className="bus-meta">
              <span className="meta-item">
                <Icon name="users" size={16} />
                {bus.totalSeats} {t('seats')}
              </span>
              <span className="meta-item">
                <Icon name="hash" size={16} />
                {t('busId')}: {bus.id}
              </span>
              <span className="meta-item">
                <Icon name="tag" size={16} />
                {bus.busType}
              </span>
            </div>
          </div>
          <div className="bus-actions">
            <Button variant="primary" onClick={handleEditClick}>
              <Icon name="edit" size={18} />
              {t('edit')}
            </Button>
            <Button variant="danger" onClick={handleDeleteClick}>
              <Icon name="trash" size={18} />
              {t('delete')}
            </Button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="details-grid">
          {/* Bus Information */}
          <div className="detail-card">
            <div className="card-header">
              <Icon name="bus" size={20} />
              <h3>{t('busInformation')}</h3>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <span className="detail-label">{t('busNumber')}</span>
                <span className="detail-value">{bus.busNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('busType')}</span>
                <span className="detail-value">{bus.busType}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('totalSeats')}</span>
                <span className="detail-value">{bus.totalSeats}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('model')}</span>
                <span className="detail-value">{bus.model || t('notSpecified')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('plateNumber')}</span>
                <span className="detail-value">{bus.plate || t('notSpecified')}</span>
              </div>
            </div>
          </div>

          {/* Route & Layout Information */}
          <div className="detail-card">
            <div className="card-header">
              <Icon name="map" size={20} />
              <h3>{t('routeLayout')}</h3>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <span className="detail-label">{t('routeId')}</span>
                <span className="detail-value">
                  {bus.routeId ? `#${bus.routeId}` : t('notAssigned')}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('layoutId')}</span>
                <span className="detail-value">
                  {bus.layoutId ? `#${bus.layoutId}` : t('notAssigned')}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('status')}</span>
                <span className={`detail-value status-badge status-${(bus.status || bus.busStatus || 'active').toLowerCase()}`}>
                  {bus.status || bus.busStatus || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="detail-card">
            <div className="card-header">
              <Icon name="barChart" size={20} />
              <h3>{t('statistics')}</h3>
            </div>
            <div className="card-body">
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">{t('totalTrips')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">{t('activeBookings')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">$0.00</div>
                <div className="stat-label">{t('totalRevenue')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditBusDialog
        isOpen={showEditDialog}
        bus={bus}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title={t('deleteBus')}
        message={`${t('deleteBusConfirm')} ${bus?.busNumber}?`}
        confirmText={t('delete')}
        cancelText={t('cancel')}
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

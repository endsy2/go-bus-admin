import React, { useState, useEffect } from 'react';
import Icon from '../../atoms/Icon/Icon';
import Button from '../../atoms/Button/Button';
import Snackbar from '../../atoms/Snackbar/Snackbar';
import EditCustomerDialog from '../../molecules/EditCustomerDialog/EditCustomerDialog';
import { apiRequest } from '../../../utils/api';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './CustomerDetailPage.css';

const CustomerDetailPage = ({ customerId, onBack }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetail();
    }
  }, [customerId]);

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users/${customerId}`, {
        method: 'GET'
      });

      const result = await response.json();

      if (response.ok) {
        const customerData = result.data || result;
        setCustomer(customerData);
        setError('');
      } else {
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to fetch customer details');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditClick = () => {
    setShowEditDialog(true);
  };

  const handleSaveEdit = async (updateData) => {
    if (!customer) return;

    try {
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users/${customer.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        const updatedCustomer = result.data || result;
        
        // Update customer data
        setCustomer(updatedCustomer);
        setShowEditDialog(false);
        setError('');
        
        // Show success snackbar
        setSnackbar({
          isOpen: true,
          message: t('customerUpdatedSuccess'),
          type: 'success'
        });
      } else {
        const result = await response.json();
        const errorData = result.data || result;
        setError(errorData.message || t('error'));
      }
    } catch (err) {
      setError(t('error'));
      console.error('Error updating customer:', err);
    }
  };

  const cancelEdit = () => {
    setShowEditDialog(false);
  };

  if (loading) {
    return (
      <div className="customer-detail-page">
        <div className="loading-state">{t('loadingCustomerDetails')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-detail-page">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <Icon name="arrowLeft" size={20} />
            {t('backToCustomers')}
          </button>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customer-detail-page">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <Icon name="arrowLeft" size={20} />
            {t('backToCustomers')}
          </button>
        </div>
        <div className="empty-state">{t('customerNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="customer-detail-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <Icon name="arrowLeft" size={20} />
          {t('backToCustomers')}
        </button>
      </div>

      <div className="detail-container">
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-avatar-large">
            {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="profile-header-info">
            <h1>{customer.fullName}</h1>
            <p className="username">@{customer.userName}</p>
            <div className="profile-meta">
              <span className="meta-item">
                <Icon name="calendar" size={16} />
                {t('joined')} {formatDate(customer.createdAt)}
              </span>
              <span className={`status-badge ${customer.googleId ? 'google' : 'local'}`}>
                {customer.googleId ? t('googleAccount') : t('localAccount')}
              </span>
            </div>
          </div>
          <div className="profile-actions">
            <Button variant="primary" onClick={handleEditClick}>
              <Icon name="edit" size={18} />
              {t('editProfile')}
            </Button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="details-grid">
          {/* Personal Information */}
          <div className="detail-card">
            <div className="card-header">
              <Icon name="users" size={20} />
              <h3>{t('personalInformation')}</h3>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <span className="detail-label">{t('fullName')}</span>
                <span className="detail-value">{customer.fullName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('username')}</span>
                <span className="detail-value">@{customer.userName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('gender')}</span>
                <span className="detail-value">
                  <span className="gender-badge">{customer.gender}</span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('customerId')}</span>
                <span className="detail-value">#{customer.id}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="detail-card">
            <div className="card-header">
              <Icon name="users" size={20} />
              <h3>{t('contactInformation')}</h3>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <span className="detail-label">{t('emailAddress')}</span>
                <span className="detail-value">{customer.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('phoneNumber')}</span>
                <span className="detail-value">{customer.phone}</span>
              </div>
              {customer.googleId && (
                <div className="detail-row">
                  <span className="detail-label">{t('googleId')}</span>
                  <span className="detail-value google-id">{customer.googleId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="detail-card">
            <div className="card-header">
              <Icon name="settings" size={20} />
              <h3>{t('accountInformation')}</h3>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <span className="detail-label">{t('accountCreated')}</span>
                <span className="detail-value">{formatDate(customer.createdAt)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('accountType')}</span>
                <span className="detail-value">
                  {customer.googleId ? t('googleOAuth') : t('emailAndPassword')}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('profileImage')}</span>
                <span className="detail-value">
                  {customer.image ? (
                    <a href={customer.image} target="_blank" rel="noopener noreferrer">{t('viewImage')}</a>
                  ) : (
                    t('noImage')
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="detail-card">
            <div className="card-header">
              <Icon name="barChart" size={20} />
              <h3>{t('activitySummary')}</h3>
            </div>
            <div className="card-body">
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">{t('totalBookings')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">$0.00</div>
                <div className="stat-label">{t('totalSpent')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">{t('activeTickets')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditCustomerDialog
        isOpen={showEditDialog}
        customer={customer}
        onSave={handleSaveEdit}
        onCancel={cancelEdit}
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

export default CustomerDetailPage;

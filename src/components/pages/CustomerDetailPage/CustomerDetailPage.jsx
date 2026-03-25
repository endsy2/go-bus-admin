import React, { useState, useEffect } from 'react';
import Icon from '../../atoms/Icon/Icon';
import Button from '../../atoms/Button/Button';
import Snackbar from '../../atoms/Snackbar/Snackbar';
import EditCustomerDialog from '../../molecules/EditCustomerDialog/EditCustomerDialog';
import { apiRequest } from '../../../utils/api';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';

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
        
        setCustomer(updatedCustomer);
        setShowEditDialog(false);
        setError('');
        
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
      <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900">
        <div className="text-center py-16 text-lg text-slate-900 dark:text-slate-100">{t('loadingCustomerDetails')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900">
        <div className="mb-6">
          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 px-4 rounded-lg text-sm text-slate-900 dark:text-slate-100 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 mb-6" onClick={onBack}>
            <Icon name="arrowLeft" size={20} />
            {t('backToCustomers')}
          </button>
        </div>
        <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 p-4 rounded-lg border-l-4 border-red-600">{error}</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900">
        <div className="mb-6">
          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 px-4 rounded-lg text-sm text-slate-900 dark:text-slate-100 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 mb-6" onClick={onBack}>
            <Icon name="arrowLeft" size={20} />
            {t('backToCustomers')}
          </button>
        </div>
        <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-base">{t('customerNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <div className="mb-6">
        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 px-4 rounded-lg text-sm text-slate-900 dark:text-slate-100 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 mb-6" onClick={onBack}>
          <Icon name="arrowLeft" size={20} />
          {t('backToCustomers')}
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-10 mb-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 text-white flex items-center justify-center font-bold text-4xl flex-shrink-0 shadow-lg">
            {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="flex-1">
            <h1 className="m-0 mb-2 text-3xl text-slate-900 dark:text-slate-100">{customer.fullName}</h1>
            <p className="m-0 mb-4 text-lg text-slate-600 dark:text-slate-400">@{customer.userName}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                <Icon name="calendar" size={16} />
                {t('joined')} {formatDate(customer.createdAt)}
              </span>
              <span className={`py-1.5 px-3 rounded-xl text-xs font-semibold ${customer.googleId ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'}`}>
                {customer.googleId ? t('googleAccount') : t('localAccount')}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleEditClick}>
              <Icon name="edit" size={18} />
              {t('editProfile')}
            </Button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 py-5 px-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <Icon name="users" size={20} />
              <h3 className="m-0 text-lg text-slate-900 dark:text-slate-100">{t('personalInformation')}</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('fullName')}</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold text-right">{customer.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('username')}</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold text-right">@{customer.userName}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('gender')}</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold text-right">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 py-1 px-2.5 rounded-xl text-xs font-semibold capitalize">{customer.gender}</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('customerId')}</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold text-right">#{customer.id}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 py-5 px-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <Icon name="users" size={20} />
              <h3 className="m-0 text-lg text-slate-900 dark:text-slate-100">{t('contactInformation')}</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('emailAddress')}</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold text-right">{customer.email}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('phoneNumber')}</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold text-right">{customer.phone}</span>
              </div>
              {customer.googleId && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('googleId')}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold text-right font-mono text-xs">{customer.googleId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 py-5 px-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <Icon name="settings" size={20} />
              <h3 className="m-0 text-lg text-slate-900 dark:text-slate-100">{t('accountInformation')}</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('accountCreated')}</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold text-right">{formatDate(customer.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('accountType')}</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold text-right">
                  {customer.googleId ? t('googleOAuth') : t('emailAndPassword')}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('profileImage')}</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold text-right">
                  {customer.image ? (
                    <a href={customer.image} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{t('viewImage')}</a>
                  ) : (
                    t('noImage')
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 py-5 px-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <Icon name="barChart" size={20} />
              <h3 className="m-0 text-lg text-slate-900 dark:text-slate-100">{t('activitySummary')}</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-blue-500 mb-1">0</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('totalBookings')}</div>
              </div>
              <div className="text-center py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-blue-500 mb-1">$0.00</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('totalSpent')}</div>
              </div>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-blue-500 mb-1">0</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('activeTickets')}</div>
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

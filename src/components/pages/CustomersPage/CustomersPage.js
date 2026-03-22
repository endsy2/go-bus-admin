import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import Input from '../../atoms/Input/Input';
import Snackbar from '../../atoms/Snackbar/Snackbar';
import ConfirmDialog from '../../molecules/ConfirmDialog/ConfirmDialog';
import EditCustomerDialog from '../../molecules/EditCustomerDialog/EditCustomerDialog';
import Pagination from '../../molecules/Pagination/Pagination';
import CustomerDetailPage from '../CustomerDetailPage/CustomerDetailPage';
import { apiRequest } from '../../../utils/api';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import { canViewCustomers, canEditCustomers, canDeleteCustomers, canCreateCustomers } from '../../../utils/permissions';
import './CustomersPage.css';

const CustomersPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  
  // Get current user from localStorage for permission checks
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Permission checks
  const canView = canViewCustomers(currentUser);
  const canEdit = canEditCustomers(currentUser);
  const canDelete = canDeleteCustomers(currentUser);
  const canCreate = canCreateCustomers(currentUser);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    userName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'MALE'
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });
  const [filters, setFilters] = useState({
    userId: '',
    email: '',
    phone: '',
    username: '',
    googleId: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 15,
    totalPages: 0,
    totalElements: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (filterParams = null, page = 1, size = 15) => {
    try {
      setLoading(true);

      // Use the new specification endpoint for customers
      let url = `${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users/specification`;
      
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      queryParams.append('pageStart', page);
      queryParams.append('pageSize', size);
      queryParams.append('isEmployee', 'false');
      
      // If filters are provided, add them as query parameters
      if (filterParams) {
        Object.keys(filterParams).forEach(key => {
          if (filterParams[key]) {
            queryParams.append(key, filterParams[key]);
          }
        });
      }
      
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }

      const response = await apiRequest(url, {
        method: 'GET'
      });

      const result = await response.json();

      if (response.ok) {
        // Handle paginated response structure
        const users = result.data?.content || result.content || result.data || result;
        setCustomers(Array.isArray(users) ? users : []);
        
        // Update pagination info - adjust for pageStart vs page difference
        const pageData = result.data || result;
        setPagination({
          currentPage: (pageData.number || page - 1),
          pageSize: pageData.size || size,
          totalPages: pageData.totalPages || 1,
          totalElements: pageData.totalElements || 0
        });
        
        setError('');
      } else {
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    // Check if at least one filter has a value
    const hasFilters = Object.values(filters).some(value => value.trim() !== '');
    
    if (!hasFilters) {
      return;
    }
    
    fetchCustomers(filters, 1, pagination.pageSize);
  };

  const handleClearFilters = () => {
    setFilters({
      userId: '',
      email: '',
      phone: '',
      username: '',
      googleId: ''
    });
    fetchCustomers(null, 1, pagination.pageSize);
  };

  const handlePageChange = (newPage) => {
    fetchCustomers(filters, newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newSize) => {
    fetchCustomers(filters, 1, newSize);
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbar({
        isOpen: true,
        message: `${label} ${t('copiedToClipboard')}`,
        type: 'success'
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
      setSnackbar({
        isOpen: true,
        message: t('failedToCopy'),
        type: 'error'
      });
    });
  };

  const handleDeleteClick = (customer) => {
    if (!canDelete) {
      setSnackbar({
        isOpen: true,
        message: 'You do not have permission to delete customers',
        type: 'error'
      });
      return;
    }
    setCustomerToDelete(customer);
    setShowDeleteDialog(true);
  };

  const handleEditClick = (customer) => {
    if (!canEdit) {
      setSnackbar({
        isOpen: true,
        message: 'You do not have permission to edit customers',
        type: 'error'
      });
      return;
    }
    setCustomerToEdit(customer);
    setShowEditDialog(true);
  };

  const handleViewClick = (customer) => {
    setSelectedCustomerId(customer.id);
    setShowDetailView(true);
  };

  const handleBackFromDetail = () => {
    setShowDetailView(false);
    setSelectedCustomerId(null);
    // Refresh the customer list when coming back from detail
    fetchCustomers(filters, pagination.currentPage, pagination.pageSize);
  };

  const handleSaveEdit = async (updateData) => {
    if (!customerToEdit) return;

    try {
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users/${customerToEdit.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        const updatedCustomer = result.data || result;
        
        // Update customer in list
        setCustomers(customers.map(c => 
          c.id === customerToEdit.id ? { ...c, ...updatedCustomer } : c
        ));
        
        setShowEditDialog(false);
        setCustomerToEdit(null);
        setError('');
        
        // Show success snackbar
        setSnackbar({
          isOpen: true,
          message: 'Customer updated successfully!',
          type: 'success'
        });
      } else {
        const result = await response.json();
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to update customer');
      }
    } catch (err) {
      setError('Network error. Failed to update customer.');
      console.error('Error updating customer:', err);
    }
  };

  const cancelEdit = () => {
    setShowEditDialog(false);
    setCustomerToEdit(null);
  };

  const handleCreateClick = () => {
    if (!canCreate) {
      setSnackbar({
        isOpen: true,
        message: 'You do not have permission to create customers',
        type: 'error'
      });
      return;
    }
    setShowCreateForm(true);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (createErrors[name]) {
      setCreateErrors(prev => ({ ...prev, [name]: '' }));
    }
    setError('');
  };

  const validateCreate = () => {
    const newErrors = {};
    if (!createFormData.userName.trim()) {
      newErrors.userName = 'Username is required';
    }
    if (!createFormData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!createFormData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(createFormData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!createFormData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!createFormData.password) {
      newErrors.password = 'Password is required';
    } else if (createFormData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (createFormData.password !== createFormData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError('');

    const newErrors = validateCreate();
    if (Object.keys(newErrors).length > 0) {
      setCreateErrors(newErrors);
      return;
    }

    setCreateLoading(true);

    try {
      const { confirmPassword, ...createData } = createFormData;

      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users`, {
        method: 'POST',
        body: JSON.stringify(createData)
      });

      if (response.ok) {
        const result = await response.json();
        const newCustomer = result.data || result;
        
        // Add new customer to list
        setCustomers([newCustomer, ...customers]);
        
        // Reset form and go back to list
        setCreateFormData({
          userName: '',
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          gender: 'MALE'
        });
        setCreateErrors({});
        setShowCreateForm(false);
        setError('');
        
        // Show success snackbar
        setSnackbar({
          isOpen: true,
          message: 'Customer created successfully!',
          type: 'success'
        });
      } else {
        const result = await response.json();
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to create customer');
      }
    } catch (err) {
      setError('Network error. Failed to create customer.');
      console.error('Error creating customer:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setCreateFormData({
      userName: '',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      gender: 'MALE'
    });
    setCreateErrors({});
    setShowCreateForm(false);
    setError('');
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users/${customerToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove customer from list
        setCustomers(customers.filter(c => c.id !== customerToDelete.id));
        setShowDeleteDialog(false);
        setCustomerToDelete(null);
      } else {
        const result = await response.json();
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to delete customer');
        setShowDeleteDialog(false);
      }
    } catch (err) {
      setError('Network error. Failed to delete customer.');
      console.error('Error deleting customer:', err);
      setShowDeleteDialog(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setCustomerToDelete(null);
  };

  // If user doesn't have permission to view customers, show access denied
  if (!canView) {
    return (
      <div className="customers-page">
        <div className="page-header">
          <div>
            <h1>{t('customerManagement')}</h1>
            <p>{t('customerManagementDesc')}</p>
          </div>
        </div>
        <div className="access-denied">
          <Icon name="lock" size={48} />
          <h3>Access Denied</h3>
          <p>You do not have permission to view customer information. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="customers-page">
        <div className="page-header">
          <div>
            <h1>{t('customerManagement')}</h1>
            <p>{t('customerManagementDesc')}</p>
          </div>
          <Button variant="primary" disabled>
            <Icon name="plus" size={18} />
            {t('addCustomer')}
          </Button>
        </div>

        <div className="filters-container">
          <div className="filters-grid">
            <div className="filter-group">
              <label>{t('userId')}</label>
              <Input
                type="text"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                placeholder={t('userId')}
                disabled
              />
            </div>
            <div className="filter-group">
              <label>{t('username')}</label>
              <Input
                type="text"
                name="username"
                value={filters.username}
                onChange={handleFilterChange}
                placeholder={t('username')}
                disabled
              />
            </div>
            <div className="filter-group">
              <label>{t('email')}</label>
              <Input
                type="text"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                placeholder={t('email')}
                disabled
              />
            </div>
            <div className="filter-group">
              <label>{t('phone')}</label>
              <Input
                type="text"
                name="phone"
                value={filters.phone}
                onChange={handleFilterChange}
                placeholder={t('phone')}
                disabled
              />
            </div>
            <div className="filter-group">
              <label>{t('googleId')}</label>
              <Input
                type="text"
                name="googleId"
                value={filters.googleId}
                onChange={handleFilterChange}
                placeholder={t('googleId')}
                disabled
              />
            </div>
          </div>
          <div className="filter-actions">
            <Button variant="secondary" disabled>
              {t('clearFilters')}
            </Button>
            <Button variant="primary" disabled>
              {t('Search')}
            </Button>
          </div>
        </div>

        <div className="customers-table">
          <table>
            <thead>
              <tr>
                <th>{t('customerId')}</th>
                <th>{t('name')}</th>
                <th>{t('email')}</th>
                <th>{t('phone')}</th>
                <th>{t('gender')}</th>
                <th>{t('joinedDate')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td><div className="shimmer shimmer-text"></div></td>
                  <td>
                    <div className="customer-name">
                      <div className="shimmer shimmer-avatar"></div>
                      <div style={{ flex: 1 }}>
                        <div className="shimmer shimmer-text" style={{ marginBottom: '4px' }}></div>
                        <div className="shimmer shimmer-text" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td><div className="shimmer shimmer-text"></div></td>
                  <td><div className="shimmer shimmer-text"></div></td>
                  <td><div className="shimmer shimmer-badge"></div></td>
                  <td><div className="shimmer shimmer-text"></div></td>
                  <td>
                    <div className="action-buttons">
                      <div className="shimmer shimmer-icon"></div>
                      <div className="shimmer shimmer-icon"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Show detail view
  if (showDetailView) {
    return (
      <CustomerDetailPage
        customerId={selectedCustomerId}
        onBack={handleBackFromDetail}
      />
    );
  }

  // Show create form
  if (showCreateForm) {
    return (
      <div className="customers-page">
        <div className="page-header">
          <button className="back-btn" onClick={handleCancelCreate}>
            <Icon name="arrowLeft" size={20} />
            {t('backToCustomers')}
          </button>
        </div>

        <div className="create-customer-container">
          <div className="create-customer-card">
            <h1>{t('createNewCustomer')}</h1>
            <p className="subtitle">{t('addNewCustomerToSystem')}</p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitCreate} className="create-customer-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('username')} *</label>
                  <Input
                    type="text"
                    name="userName"
                    value={createFormData.userName}
                    onChange={handleCreateChange}
                    placeholder={t('enterUsername')}
                    required
                    error={createErrors.userName}
                  />
                </div>

                <div className="form-group">
                  <label>{t('fullName')} *</label>
                  <Input
                    type="text"
                    name="fullName"
                    value={createFormData.fullName}
                    onChange={handleCreateChange}
                    placeholder={t('enterFullName')}
                    required
                    error={createErrors.fullName}
                  />
                </div>

                <div className="form-group">
                  <label>{t('email')} *</label>
                  <Input
                    type="email"
                    name="email"
                    value={createFormData.email}
                    onChange={handleCreateChange}
                    placeholder={t('enterEmailAddress')}
                    required
                    error={createErrors.email}
                  />
                </div>

                <div className="form-group">
                  <label>{t('phone')} *</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={createFormData.phone}
                    onChange={handleCreateChange}
                    placeholder={t('enterPhoneNumber')}
                    required
                    error={createErrors.phone}
                  />
                </div>

                <div className="form-group">
                  <label>{t('gender')} *</label>
                  <select
                    name="gender"
                    value={createFormData.gender}
                    onChange={handleCreateChange}
                    className="select-input"
                  >
                    <option value="MALE">{t('male')}</option>
                    <option value="FEMALE">{t('female')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('password')} *</label>
                  <Input
                    type="password"
                    name="password"
                    value={createFormData.password}
                    onChange={handleCreateChange}
                    placeholder={t('enterPassword')}
                    required
                    error={createErrors.password}
                  />
                </div>

                <div className="form-group full-width">
                  <label>{t('confirmPassword')} *</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={createFormData.confirmPassword}
                    onChange={handleCreateChange}
                    placeholder={t('confirmPasswordPlaceholder')}
                    required
                    error={createErrors.confirmPassword}
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button type="button" variant="secondary" onClick={handleCancelCreate}>
                  {t('cancel')}
                </Button>
                <Button type="submit" variant="primary" disabled={createLoading}>
                  {createLoading ? t('creating') : t('createCustomer')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show customer list
  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>{t('customerManagement')}</h1>
          <p>{t('customerManagementDesc')}</p>
        </div>
        <Button variant="primary" onClick={handleCreateClick} disabled={!canCreate}>
          <Icon name="plus" size={18} />
          {t('addCustomer')}
        </Button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="filters-container">
        <div className="filters-grid">
          <div className="filter-group">
            <label>{t('userId')}</label>
            <Input
              type="text"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder={t('userId')}
            />
          </div>
          <div className="filter-group">
            <label>{t('username')}</label>
            <Input
              type="text"
              name="username"
              value={filters.username}
              onChange={handleFilterChange}
              placeholder={t('username')}
            />
          </div>
          <div className="filter-group">
            <label>{t('email')}</label>
            <Input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder={t('email')}
            />
          </div>
          <div className="filter-group">
            <label>{t('phone')}</label>
            <Input
              type="text"
              name="phone"
              value={filters.phone}
              onChange={handleFilterChange}
              placeholder={t('phone')}
            />
          </div>
          <div className="filter-group">
            <label>{t('googleId')}</label>
            <Input
              type="text"
              name="googleId"
              value={filters.googleId}
              onChange={handleFilterChange}
              placeholder={t('googleId')}
            />
          </div>
        </div>
        <div className="filter-actions">
          <Button variant="secondary" onClick={handleClearFilters}>
            {t('clearFilters')}
          </Button>
          <Button variant="primary" onClick={handleApplyFilters}>
            {t('Search')}
          </Button>
        </div>
      </div>

      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>{t('customerId')}</th>
              <th>{t('name')}</th>
              <th>{t('email')}</th>
              <th>{t('phone')}</th>
              <th>{t('gender')}</th>
              <th>{t('joinedDate')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  {t('noCustomersFound')}
                </td>
              </tr>
            ) : (
              customers.map(customer => (
                <tr key={customer.id}>
                  <td className="customer-id">
                    <div className="cell-with-copy">
                      #{customer.id}
                      <button 
                        className="btn-copy" 
                        title="Copy ID"
                        onClick={() => handleCopyToClipboard(customer.id.toString(), 'Customer ID')}
                      >
                        <Icon name="copy" size={14} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="customer-name">
                      <div className="avatar">
                        {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <div>{customer.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>@{customer.userName}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-copy">
                      {customer.email}
                      <button 
                        className="btn-copy" 
                        title="Copy Email"
                        onClick={() => handleCopyToClipboard(customer.email, 'Email')}
                      >
                        <Icon name="copy" size={14} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-copy">
                      {customer.phone}
                      <button 
                        className="btn-copy" 
                        title="Copy Phone"
                        onClick={() => handleCopyToClipboard(customer.phone, 'Phone')}
                      >
                        <Icon name="copy" size={14} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="gender-badge">{customer.gender}</span>
                  </td>
                  <td>{formatDate(customer.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon btn-view" title="View" onClick={() => handleViewClick(customer)}>
                        <Icon name="eye" size={18} />
                      </button>
                      {canDelete && (
                        <button className="btn-icon btn-delete" title="Delete" onClick={() => handleDeleteClick(customer)}>
                          <Icon name="trash" size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {customers.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalElements={pagination.totalElements}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={t('confirmDelete')}
        message={t('confirmDeleteMessage')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        type="danger"
      />

      <EditCustomerDialog
        isOpen={showEditDialog}
        customer={customerToEdit}
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

export default CustomersPage;

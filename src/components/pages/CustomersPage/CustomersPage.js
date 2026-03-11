import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import Input from '../../atoms/Input/Input';
import Snackbar from '../../atoms/Snackbar/Snackbar';
import ConfirmDialog from '../../molecules/ConfirmDialog/ConfirmDialog';
import EditCustomerDialog from '../../molecules/EditCustomerDialog/EditCustomerDialog';
import CustomerDetailPage from '../CustomerDetailPage/CustomerDetailPage';
import { apiRequest } from '../../../utils/api';
import './CustomersPage.css';

const CustomersPage = () => {
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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users`, {
        method: 'GET'
      });

      const result = await response.json();

      if (response.ok) {
        // Handle both direct and nested data structures
        const users = result.data || result;
        setCustomers(Array.isArray(users) ? users : []);
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

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteDialog(true);
  };

  const handleEditClick = (customer) => {
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
    fetchCustomers();
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

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading-state">Loading customers...</div>
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
            Back to Customers
          </button>
        </div>

        <div className="create-customer-container">
          <div className="create-customer-card">
            <h1>Create New Customer</h1>
            <p className="subtitle">Add a new customer to the system</p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitCreate} className="create-customer-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Username *</label>
                  <Input
                    type="text"
                    name="userName"
                    value={createFormData.userName}
                    onChange={handleCreateChange}
                    placeholder="Enter username"
                    required
                    error={createErrors.userName}
                  />
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <Input
                    type="text"
                    name="fullName"
                    value={createFormData.fullName}
                    onChange={handleCreateChange}
                    placeholder="Enter full name"
                    required
                    error={createErrors.fullName}
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <Input
                    type="email"
                    name="email"
                    value={createFormData.email}
                    onChange={handleCreateChange}
                    placeholder="Enter email address"
                    required
                    error={createErrors.email}
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={createFormData.phone}
                    onChange={handleCreateChange}
                    placeholder="Enter phone number"
                    required
                    error={createErrors.phone}
                  />
                </div>

                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={createFormData.gender}
                    onChange={handleCreateChange}
                    className="select-input"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <Input
                    type="password"
                    name="password"
                    value={createFormData.password}
                    onChange={handleCreateChange}
                    placeholder="Enter password"
                    required
                    error={createErrors.password}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Confirm Password *</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={createFormData.confirmPassword}
                    onChange={handleCreateChange}
                    placeholder="Confirm password"
                    required
                    error={createErrors.confirmPassword}
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button type="button" variant="secondary" onClick={handleCancelCreate}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create Customer'}
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
          <h1>Customer Management</h1>
          <p>View and manage customer information</p>
        </div>
        <Button variant="primary" onClick={handleCreateClick}>+ Add Customer</Button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map(customer => (
                <tr key={customer.id}>
                  <td className="customer-id">#{customer.id}</td>
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
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <span className="gender-badge">{customer.gender}</span>
                  </td>
                  <td>{formatDate(customer.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon btn-view" title="View" onClick={() => handleViewClick(customer)}>
                        <Icon name="eye" size={18} />
                      </button>
                      <button className="btn-icon btn-delete" title="Delete" onClick={() => handleDeleteClick(customer)}>
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this?"
        confirmText="Delete"
        cancelText="Cancel"
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

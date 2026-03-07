import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import ConfirmDialog from '../../molecules/ConfirmDialog/ConfirmDialog';
import './CustomersPage.css';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token || user?.accessToken;

      console.log('User from localStorage:', user);
      console.log('Token being sent:', token);

      const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
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

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token || user?.accessToken;

      const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users/${customerToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
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

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>Customer Management</h1>
          <p>View and manage customer information</p>
        </div>
        <Button variant="primary">+ Add Customer</Button>
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
                      <button className="btn-icon btn-view" title="View">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button className="btn-icon btn-edit" title="Edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button className="btn-icon btn-delete" title="Delete" onClick={() => handleDeleteClick(customer)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
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
    </div>
  );
};

export default CustomersPage;

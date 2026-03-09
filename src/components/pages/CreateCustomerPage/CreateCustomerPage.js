import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../atoms/Input/Input';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import { apiRequest } from '../../../utils/api';
import './CreateCustomerPage.css';

const CreateCustomerPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'MALE'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...createData } = formData;

      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users`, {
        method: 'POST',
        body: JSON.stringify(createData)
      });

      if (response.ok) {
        // Navigate back to customers page
        navigate('/customers');
      } else {
        const result = await response.json();
        const errorData = result.data || result;
        setApiError(errorData.message || 'Failed to create customer');
      }
    } catch (err) {
      setApiError('Network error. Failed to create customer.');
      console.error('Error creating customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  return (
    <div className="create-customer-page">
      <div className="page-header">
        <button className="back-btn" onClick={handleCancel}>
          <Icon name="arrowLeft" size={20} />
          Back to Customers
        </button>
      </div>

      <div className="create-customer-container">
        <div className="create-customer-card">
          <h1>Create New Customer</h1>
          <p className="subtitle">Add a new customer to the system</p>

          {apiError && (
            <div className="error-message">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-customer-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Username *</label>
                <Input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                  error={errors.userName}
                />
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  error={errors.fullName}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  error={errors.email}
                />
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                  error={errors.phone}
                />
              </div>

              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  error={errors.password}
                />
              </div>

              <div className="form-group full-width">
                <label>Confirm Password *</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  error={errors.confirmPassword}
                />
              </div>
            </div>

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Customer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerPage;

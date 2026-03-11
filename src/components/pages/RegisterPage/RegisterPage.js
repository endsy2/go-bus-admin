import React, { useState } from 'react';
import Input from '../../atoms/Input/Input';
import Button from '../../atoms/Button/Button';
import './RegisterPage.css';

const RegisterPage = ({ onRegisterSuccess, onSwitchToLogin }) => {
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
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
      const { confirmPassword, ...registerData } = formData;

      const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      });

      const responseData = await response.json();

      if (response.ok) {
        const data = responseData.data || responseData;
        const token = data.token || data.accessToken;

        // If registration returns a token, fetch profile and login
        if (token) {
          try {
            const profileResponse = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users/profile`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            if (profileResponse.ok) {
              const profileResult = await profileResponse.json();
              const profileData = profileResult.data || profileResult;
              
              const userProfile = {
                ...data,
                ...profileData,
                fullName: profileData.fullName || registerData.fullName,
                userName: profileData.userName || registerData.userName
              };
              
              localStorage.setItem('user', JSON.stringify(userProfile));
              onRegisterSuccess(userProfile);
            } else {
              // Profile fetch failed, use registration data
              const userProfile = {
                ...data,
                fullName: data.fullName || registerData.fullName,
                userName: data.userName || registerData.userName
              };
              localStorage.setItem('user', JSON.stringify(userProfile));
              onRegisterSuccess(userProfile);
            }
          } catch (profileError) {
            console.warn('Profile fetch failed:', profileError);
            const userProfile = {
              ...data,
              fullName: data.fullName || registerData.fullName,
              userName: data.userName || registerData.userName
            };
            localStorage.setItem('user', JSON.stringify(userProfile));
            onRegisterSuccess(userProfile);
          }
        } else {
          // No token returned, redirect to login
          setIsSuccess(true);
          setApiError('Registration successful! Redirecting to login...');
          setTimeout(() => {
            onSwitchToLogin();
          }, 2000);
        }
      } else {
        const data = responseData.data || responseData;
        console.error('Registration failed:', data);
        setApiError(data.message || `Registration failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setApiError('Network error. Please check your connection and ensure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {apiError && (
            <div className={`api-error ${isSuccess ? 'success' : ''}`}>
              {apiError}
            </div>
          )}

          <Input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="Username"
            required
            error={errors.userName}
          />

          <Input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            required
            error={errors.fullName}
          />

          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            error={errors.email}
          />

          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone (e.g., 012-345-6789)"
            required
            error={errors.phone}
            prefix={<img src="https://flagcdn.com/w40/kh.png" alt="KH" style={{ width: '24px', height: '16px' }} />}
          />

          <div className="input-wrapper">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            error={errors.password}
          />

          <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <a href="#login" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Sign In</a></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

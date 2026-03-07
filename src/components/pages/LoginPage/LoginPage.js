import React, { useState } from 'react';
import Input from '../../atoms/Input/Input';
import Button from '../../atoms/Button/Button';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      // Step 1: Login to get token
      const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();

      if (response.ok) {
        // Extract data from response (handle both direct and nested data structures)
        const data = responseData.data || responseData;
        
        // Step 2: Fetch user profile with the token
        const token = data.token || data.accessToken;
        
        console.log('Login response data:', data);
        console.log('Extracted token:', token);
        
        try {
          const profileResponse = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (profileResponse.ok) {
            const profileResult = await profileResponse.json();
            const profileData = profileResult.data || profileResult;
            
            console.log('Profile response data:', profileData);
            
            // Combine login data (token) with profile data
            const userProfile = {
              ...data,
              ...profileData,
              fullName: profileData.fullName || profileData.name || data.fullName || 'User',
              userName: profileData.userName || profileData.username || data.userName || formData.email.split('@')[0]
            };
            
            console.log('Saving user profile to localStorage:', userProfile);
            localStorage.setItem('user', JSON.stringify(userProfile));
            onLoginSuccess(userProfile);
          } else {
            // If profile fetch fails, use login data with fallbacks
            const userProfile = {
              ...data,
              fullName: data.fullName || data.name || 'User',
              userName: data.userName || data.username || formData.email.split('@')[0]
            };
            localStorage.setItem('user', JSON.stringify(userProfile));
            onLoginSuccess(userProfile);
          }
        } catch (profileError) {
          // If profile API fails, proceed with login data
          console.warn('Profile fetch failed:', profileError);
          const userProfile = {
            ...data,
            fullName: data.fullName || data.name || 'User',
            userName: data.userName || data.username || formData.email.split('@')[0]
          };
          localStorage.setItem('user', JSON.stringify(userProfile));
          onLoginSuccess(userProfile);
        }
      } else {
        const data = responseData.data || responseData;
        setApiError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setApiError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Bus Booking System</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {apiError && (
            <div className="api-error">
              {apiError}
            </div>
          )}

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
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            error={errors.password}
          />

          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="#register" onClick={onSwitchToRegister}>Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

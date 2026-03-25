import React, { useState } from 'react';
import { Input } from 'shared/components/common/Input';
import { Button } from 'shared/components/common/Button';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import authService from '../../services/authService';
import { userService } from 'features/team/services/userService';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
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
      const responseData = await authService.login(formData);
      const data = responseData.data || responseData;
      
      // Step 2: Fetch user profile with the token
      const token = data.token || data.accessToken;
      
      console.log('Login response data:', data);
      console.log('Extracted token:', token);
      
      // Store token temporarily for profile fetch
      localStorage.setItem('user', JSON.stringify(data));
      
      try {
        const profileResult = await userService.getProfile();
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
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.data?.message || 'Login failed. Please try again.';
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-container">
            <img 
              src="/go_bus_new_logo.png" 
              alt="GoBus Admin" 
              className="login-logo"
            />
          </div>
          <p>{t('signInToAccount')}</p>
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
            placeholder={t('email')}
            required
            error={errors.email}
          />

          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t('password')}
            required
            error={errors.password}
          />

          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? t('signingIn') : t('signIn')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { Input } from 'shared/components/common/Input';
import { Button } from 'shared/components/common/Button';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import { AlertCircle, Loader2 } from 'lucide-react';
import authService from '../../services/authService';
import userService from 'features/team/services/userService';

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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-5">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center items-center">
            <img 
              src="/go_bus_new_logo.png" 
              alt="GoBus Admin" 
              className="max-w-[200px] max-h-20 w-auto h-auto object-contain drop-shadow-md dark:brightness-110"
            />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            {t('signInToAccount')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {apiError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg border-l-4 border-red-700 dark:border-red-500 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{apiError}</span>
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
            className="flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? t('signingIn') : t('signIn')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import Input from '../../atoms/Input/Input';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './EditCustomerDialog.css';

const EditCustomerDialog = ({ isOpen, customer, onSave, onCancel }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const [formData, setFormData] = useState({
    userName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    gender: 'MALE'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        userName: customer.userName || '',
        fullName: customer.fullName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        password: '',
        gender: customer.gender || 'MALE'
      });
    }
  }, [customer]);

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
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    // Prepare data - only include password if it's not empty
    const updateData = { ...formData };
    if (!updateData.password) {
      delete updateData.password;
    }
    
    await onSave(updateData);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="edit-dialog-overlay" onClick={onCancel}>
      <div className="edit-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{t('editCustomer')}</h3>
        <form onSubmit={handleSubmit} className="edit-form">
          <Input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder={t('username')}
            required
            error={errors.userName}
          />

          <Input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder={t('fullName')}
            required
            error={errors.fullName}
          />

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
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t('phone')}
            required
            error={errors.phone}
          />

          <div className="input-wrapper">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input"
            >
              <option value="MALE">{t('male')}</option>
              <option value="FEMALE">{t('female')}</option>
            </select>
          </div>

          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t('newPasswordLeaveEmpty')}
            error={errors.password}
          />

          <div className="edit-dialog-actions">
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerDialog;

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';

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

  const handleChange = (name, value) => {
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
    
    const updateData = { ...formData };
    if (!updateData.password) {
      delete updateData.password;
    }
    
    await onSave(updateData);
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editCustomer')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">{t('username')}</Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
              className={errors.userName ? 'border-destructive' : ''}
            />
            {errors.userName && <p className="text-sm text-destructive">{errors.userName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">{t('fullName')}</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">{t('gender')}</Label>
            <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">{t('male')}</SelectItem>
                <SelectItem value="FEMALE">{t('female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('newPasswordLeaveEmpty')}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={t('newPasswordLeaveEmpty')}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? t('saving') : t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;

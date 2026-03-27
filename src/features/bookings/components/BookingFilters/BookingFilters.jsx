import React, { useState } from 'react';
import { Input } from 'shared/components/common/Input';
import { Button } from 'shared/components/common/Button';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import { Filter, X, Search } from 'lucide-react';

const BookingFilters = ({ onFilterChange, onReset }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  
  const [filters, setFilters] = useState({
    bookingStatus: '',
    paymentStatus: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    const cleanFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        cleanFilters[key] = filters[key];
      }
    });
    onFilterChange(cleanFilters);
  };

  const handleReset = () => {
    setFilters({
      bookingStatus: '',
      paymentStatus: '',
      paymentMethod: '',
      minAmount: '',
      maxAmount: '',
    });
    onReset();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-500" />
          {t('filters') || 'Filters'}
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
        >
          {showFilters ? t('hide') || 'Hide' : t('show') || 'Show'}
        </Button>
      </div>

      {showFilters && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('bookingStatus') || 'Booking Status'}
              </label>
              <select
                name="bookingStatus"
                value={filters.bookingStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('all') || 'All'}</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('paymentStatus') || 'Payment Status'}
              </label>
              <select
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('all') || 'All'}</option>
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('paymentMethod') || 'Payment Method'}
              </label>
              <select
                name="paymentMethod"
                value={filters.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('all') || 'All'}</option>
                <option value="CREDIT_CARD">CREDIT CARD</option>
                <option value="DEBIT_CARD">DEBIT CARD</option>
                <option value="CASH">CASH</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('minAmount') || 'Min Amount'}
              </label>
              <Input
                type="number"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('maxAmount') || 'Max Amount'}
              </label>
              <Input
                type="number"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleChange}
                placeholder="1000.00"
                min="0"
                step="0.01"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleApply}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Search className="w-4 h-4" />
              {t('applyFilters') || 'Apply Filters'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
            >
              <X className="w-4 h-4" />
              {t('resetFilters') || 'Reset'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFilters;

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
    const hasActiveFilters = Object.values(filters).some(v => v !== '');
    setFilters({ bookingStatus: '', paymentStatus: '' });
    if (hasActiveFilters) {
      onReset();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          {t('filters') || 'Filters'}
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
        >
          {showFilters ? t('hide') || 'Hide' : t('show') || 'Show'}
        </Button>
      </div>

      {showFilters && (
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('bookingStatus') || 'Booking Status'}
              </label>
              <select
                name="bookingStatus"
                value={filters.bookingStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('all') || 'All'}</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('paymentStatus') || 'Payment Status'}
              </label>
              <select
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('all') || 'All'}</option>
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleApply}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
            >
              <Search className="w-4 h-4" />
              {t('applyFilters') || 'Apply Filters'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white w-full sm:w-auto"
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

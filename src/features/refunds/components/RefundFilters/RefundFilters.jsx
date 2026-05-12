import React, { useState } from 'react';
import { Button } from 'shared/components/common/Button';
import { Filter, X } from 'lucide-react';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';

const RefundFilters = ({ onFilterChange, onReset }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleApplyFilters = () => {
    const filters = {};
    if (status) filters.status = status;
    if (fromDate) filters.fromDate = new Date(fromDate).toISOString();
    if (toDate) filters.toDate = new Date(toDate).toISOString();
    
    onFilterChange(filters);
  };

  const handleReset = () => {
    setStatus('');
    setFromDate('');
    setToDate('');
    onReset();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('filters') || 'Filters'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('status') || 'Status'}
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('all') || 'All'}</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        {/* From Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('fromDate') || 'From Date'}
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('toDate') || 'To Date'}
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-end gap-2">
          <Button
            variant="primary"
            onClick={handleApplyFilters}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {t('apply') || 'Apply'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleReset}
            className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RefundFilters;

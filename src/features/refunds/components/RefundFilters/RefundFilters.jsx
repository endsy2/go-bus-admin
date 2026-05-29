import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'shared/components/common/Button';
import { Label } from 'shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shared/components/ui/select';
import { DatePicker } from 'shared/components/ui/date-picker';
import { Filter, X } from 'lucide-react';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';

const RefundFilters = ({ onFilterChange, onReset }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [showFilters, setShowFilters] = useState(false);
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Real-time search: filters apply automatically (debounced 400ms after the
  // last change) so the list updates as you pick — no "Apply" button needed.
  // We always send every field (incl. empty ones) so clearing one actually
  // removes it from the applied filters.
  const skipFirstSync = useRef(true);
  useEffect(() => {
    if (skipFirstSync.current) {
      skipFirstSync.current = false;
      return;
    }
    const handle = setTimeout(() => {
      onFilterChange({
        status,
        fromDate: fromDate ? new Date(fromDate).toISOString() : '',
        toDate: toDate ? new Date(toDate).toISOString() : '',
      });
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, fromDate, toDate]);

  const handleReset = () => {
    setStatus('');
    setFromDate('');
    setToDate('');
    // Skip the debounced effect's duplicate run; onReset fetches the unfiltered list now.
    skipFirstSync.current = true;
    onReset();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6">
      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 mb-3 sm:mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          {t('filters') || 'Filters'}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? t('hide') || 'Hide' : t('show') || 'Show'}
        </Button>
      </div>

      {showFilters && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label>{t('status') || 'Status'}</Label>
              <Select
                value={status || '__all__'}
                onValueChange={(value) => setStatus(value === '__all__' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('all') || 'All'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t('all') || 'All'}</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="APPROVED">APPROVED</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* From Date */}
            <div className="space-y-2">
              <Label>{t('fromDate') || 'From Date'}</Label>
              <DatePicker
                value={fromDate}
                onChange={(value) => setFromDate(value)}
                placeholder={t('fromDate') || 'From Date'}
              />
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <Label>{t('toDate') || 'To Date'}</Label>
              <DatePicker
                value={toDate}
                onChange={(value) => setToDate(value)}
                placeholder={t('toDate') || 'To Date'}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleReset}
              className="flex items-center gap-2"
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

export default RefundFilters;

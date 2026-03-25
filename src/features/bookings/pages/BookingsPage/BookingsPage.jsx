import React, { useState } from 'react';
import { useBookings } from 'shared/hooks/useBookings';
import { Badge } from 'shared/components/common/Badge';
import { Button } from 'shared/components/common/Button';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import { User, MapPin, Calendar } from 'lucide-react';

const BookingsPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { bookings, loading } = useBookings();
  const [filter, setFilter] = useState('all');

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
          <div className="flex gap-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-3 mb-5">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t('bookingsManagement')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('manageAllBusTicketBookings')}
          </p>
        </div>
        <Button variant="primary">+ {t('newBooking')}</Button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
        <div className="flex gap-3">
          <button 
            className={`px-5 py-2.5 border-2 rounded-lg font-semibold transition-all duration-300 ${
              filter === 'all' 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-primary'
            }`}
            onClick={() => setFilter('all')}
          >
            {t('all')} ({bookings.length})
          </button>
          <button 
            className={`px-5 py-2.5 border-2 rounded-lg font-semibold transition-all duration-300 ${
              filter === 'confirmed' 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-primary'
            }`}
            onClick={() => setFilter('confirmed')}
          >
            {t('confirmed')}
          </button>
          <button 
            className={`px-5 py-2.5 border-2 rounded-lg font-semibold transition-all duration-300 ${
              filter === 'pending' 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-primary'
            }`}
            onClick={() => setFilter('pending')}
          >
            {t('pending')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBookings.map(booking => (
          <div 
            key={booking.id} 
            className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <span className="font-bold text-lg text-primary">
                {booking.id}
              </span>
              <Badge variant={booking.status}>
                {t(booking.status.toLowerCase())}
              </Badge>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t('customer')}:
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {booking.customer}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t('route')}:
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {booking.route}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('date')}:
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {booking.date}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1">
                {t('viewDetailsBtn')}
              </Button>
              <Button variant="primary" className="flex-1">
                {t('edit')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsPage;

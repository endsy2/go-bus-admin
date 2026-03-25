import React from 'react';
import StatsGrid from '../../components/StatsGrid/StatsGrid';
import { BookingTable } from 'features/bookings';
import { useStats } from '../../hooks/useStats';
import { useBookings } from 'features/bookings';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';

const DashboardPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { stats, loading: statsLoading } = useStats();
  const { bookings, loading: bookingsLoading } = useBookings();

  const isLoading = statsLoading || bookingsLoading;

  if (isLoading) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 min-h-screen">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-7 w-16 mb-2" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <Skeleton className="h-5 w-48 mb-5" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-5 mb-4 items-center">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t('dashboard')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t('welcomeBack')}
        </p>
      </div>

      <StatsGrid stats={stats} loading={statsLoading} />
      <BookingTable bookings={bookings} loading={bookingsLoading} />
    </div>
  );
};

export default DashboardPage;

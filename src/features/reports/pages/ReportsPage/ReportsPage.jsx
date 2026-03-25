import React from 'react';
import { Download, TrendingUp, TrendingDown, Calendar, Clock } from 'lucide-react';
import { Button } from 'shared/components/ui/button';
import { Card, CardContent } from 'shared/components/ui/card';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';

const ReportsPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  
  const reports = [
    { title: t('revenueReport'), period: t('monthly'), lastGenerated: '2026-03-01', icon: '💰', color: 'bg-emerald-500' },
    { title: t('bookingAnalytics'), period: t('weekly'), lastGenerated: '2026-02-28', icon: '📊', color: 'bg-blue-500' },
    { title: t('customerInsights'), period: t('quarterly'), lastGenerated: '2026-01-01', icon: '👥', color: 'bg-purple-500' },
    { title: t('busPerformance'), period: t('monthly'), lastGenerated: '2026-03-01', icon: '🚌', color: 'bg-orange-500' },
  ];

  const recentStats = [
    { label: t('totalRevenueThisMonth'), value: '$45,678', change: '+18%', trend: 'up' },
    { label: t('totalBookingsThisMonth'), value: '1,234', change: '+12%', trend: 'up' },
    { label: t('averageTicketPrice'), value: '$37', change: '+5%', trend: 'up' },
    { label: t('cancellationRate'), value: '3.2%', change: '-1.5%', trend: 'down' },
  ];

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900 min-h-screen">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-6 w-32 mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-32 mb-3" />
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reports Skeleton */}
        <div>
          <Skeleton className="h-6 w-40 mb-5" />
          <div className="grid gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                    <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-3 w-full">
                      <Skeleton className="h-5 w-48" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t('reportsAnalytics')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('viewBusinessInsights')}
          </p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          {t('exportAll')}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-5">
          {t('keyMetrics')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {recentStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {stat.label}
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {stat.value}
                </div>
                <div className={`text-sm font-semibold flex items-center gap-1 ${
                  stat.trend === 'up' 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Reports */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-5">
          {t('availableReports')}
        </h2>
        <div className="grid gap-4 md:gap-6">
          {reports.map((report, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  {/* Icon */}
                  <div className={`${report.color} w-20 h-20 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 shadow-md`}>
                    {report.icon}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {report.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {report.period}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {t('lastGenerated')}: {report.lastGenerated}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none">
                      {t('view')}
                    </Button>
                    <Button className="flex-1 md:flex-none">
                      {t('generate')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

import React from 'react';
import { Button } from 'shared/components/common/Button';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import './ReportsPage.css';

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
    { title: t('revenueReport'), period: t('monthly'), lastGenerated: '2026-03-01', icon: '💰' },
    { title: t('bookingAnalytics'), period: t('weekly'), lastGenerated: '2026-02-28', icon: '📊' },
    { title: t('customerInsights'), period: t('quarterly'), lastGenerated: '2026-01-01', icon: '👥' },
    { title: t('busPerformance'), period: t('monthly'), lastGenerated: '2026-03-01', icon: '🚌' },
  ];

  const recentStats = [
    { label: t('totalRevenueThisMonth'), value: '$45,678', change: '+18%', trend: 'up' },
    { label: t('totalBookingsThisMonth'), value: '1,234', change: '+12%', trend: 'up' },
    { label: t('averageTicketPrice'), value: '$37', change: '+5%', trend: 'up' },
    { label: t('cancellationRate'), value: '3.2%', change: '-1.5%', trend: 'down' },
  ];

  if (loading) {
    return (
      <div className="reports-page">
        <div className="page-header">
          <div>
            <div className="shimmer shimmer-header"></div>
            <div className="shimmer shimmer-subtitle"></div>
          </div>
          <div className="shimmer shimmer-button"></div>
        </div>

        <div className="stats-overview">
          <div className="shimmer shimmer-section-title"></div>
          <div className="shimmer-metrics-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="shimmer-metric-card">
                <div className="shimmer shimmer-metric-label"></div>
                <div className="shimmer shimmer-metric-value"></div>
                <div className="shimmer shimmer-metric-change"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="reports-section">
          <div className="shimmer shimmer-section-title"></div>
          <div className="shimmer-reports-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="shimmer-report-card">
                <div className="shimmer shimmer-report-icon"></div>
                <div className="shimmer-report-info">
                  <div className="shimmer shimmer-report-title"></div>
                  <div className="shimmer-report-meta">
                    <div className="shimmer shimmer-report-meta-item"></div>
                    <div className="shimmer shimmer-report-meta-item"></div>
                  </div>
                </div>
                <div className="shimmer-report-actions">
                  <div className="shimmer shimmer-report-action-button"></div>
                  <div className="shimmer shimmer-report-action-button"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>{t('reportsAnalytics')}</h1>
          <p>{t('viewBusinessInsights')}</p>
        </div>
        <Button variant="primary">📥 {t('exportAll')}</Button>
      </div>

      <div className="stats-overview">
        <h2>{t('keyMetrics')}</h2>
        <div className="metrics-grid">
          {recentStats.map((stat, index) => (
            <div key={index} className="metric-card">
              <div className="metric-label">{stat.label}</div>
              <div className="metric-value">{stat.value}</div>
              <div className={`metric-change ${stat.trend}`}>
                {stat.trend === 'up' ? '📈' : '📉'} {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="reports-section">
        <h2>{t('availableReports')}</h2>
        <div className="reports-grid">
          {reports.map((report, index) => (
            <div key={index} className="report-card">
              <div className="report-icon">{report.icon}</div>
              <div className="report-info">
                <h3>{report.title}</h3>
                <div className="report-meta">
                  <span>📅 {report.period}</span>
                  <span>🕒 {t('lastGenerated')}: {report.lastGenerated}</span>
                </div>
              </div>
              <div className="report-actions">
                <Button variant="secondary">{t('view')}</Button>
                <Button variant="primary">{t('generate')}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

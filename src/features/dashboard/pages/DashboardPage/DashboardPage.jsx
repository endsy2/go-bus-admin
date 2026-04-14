import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, Bus, AlertCircle, Download, Plus, ArrowRight, Activity } from 'lucide-react';
import { useStats } from '../../hooks/useStats';
import { useBookings } from 'features/bookings';
import { Skeleton } from 'shared/components/ui/skeleton';
import { Button } from 'shared/components/ui/button';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { stats, loading: statsLoading } = useStats();
  const { bookings, loading: bookingsLoading } = useBookings({}, 0, 5);

  const isLoading = statsLoading || bookingsLoading;

  // Mock data for charts and additional sections
  const bookingTrends = [45, 52, 68, 45, 58, 72, 65, 78, 85, 72, 95, 88];
  const revenueBreakdown = [
    { method: 'Bakong', percentage: 54, color: 'bg-blue-500' },
    { method: 'Card', percentage: 31, color: 'bg-green-500' },
    { method: 'Wallet', percentage: 15, color: 'bg-purple-500' }
  ];

  const recentActivities = [
    { id: 1, type: 'booking', title: 'New Booking #FTA-3021', subtitle: 'Economy Class', time: '2m ago', color: 'bg-blue-500' },
    { id: 2, type: 'alert', title: 'System Alert: Bus ID-104', subtitle: 'Engine check required', time: '14m ago', color: 'bg-red-500' },
    { id: 3, type: 'driver', title: 'New Driver Registered', subtitle: 'Samriang Vong', time: '42m ago', color: 'bg-blue-500' },
    { id: 4, type: 'payment', title: 'Payment Confirmed', subtitle: '$120.00 via Bakong', time: '1h ago', color: 'bg-green-500' }
  ];

  const topRoutes = [
    { from: 'Phnom Penh', to: 'Siem Reap', occupancy: 82, revenue: '$12,480', growth: '+8.2%' },
    { from: 'Battambang', to: 'Phnom Penh', occupancy: 78, revenue: '$9,150', growth: '+2.1%' }
  ];

  if (isLoading) {
    return (
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-[#0F1419] min-h-screen">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-[#0F1419] min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Operational Overview
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time performance and system health across the FTA network.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white dark:bg-card border-gray-200 dark:border-gray-700">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Bookings Today */}
        <div className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs font-medium text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Bookings Today</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">1,284</div>
        </div>

        {/* Revenue this Week */}
        <div className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-xs font-medium text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +18.4%
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenue this Week</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">$42,500.00</div>
        </div>

        {/* Active Buses */}
        <div className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Bus className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Buses</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            86 <span className="text-sm font-normal text-gray-500">/ 92 Total</span>
          </div>
        </div>

        {/* Pending Refunds */}
        <div className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Refunds</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">14</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Booking Trends - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Trends</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ticket sales velocity over the last 30 days</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Economy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">VIP</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {bookingTrends.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                  style={{ height: `${(value / 100) * 100}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Stream */}
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Stream</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Split by Payment Method</p>
          </div>
          <div className="mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="text-sm opacity-80 mb-1">WEEKLY TOTAL</div>
              <div className="text-3xl font-bold">$42.5k</div>
            </div>
          </div>
          <div className="space-y-3">
            {revenueBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.method}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bus Fleet Status */}
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bus Fleet Status</h3>
            <button 
              onClick={() => navigate('/buses')}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              View All Fleet
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border-l-4 border-green-500 pl-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">ON ROAD</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">62</div>
            </div>
            <div className="border-l-4 border-red-500 pl-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">MAINTENANCE</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">18</div>
            </div>
            <div className="border-l-4 border-gray-400 pl-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">IDLE</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">TOP PERFORMING ROUTES</div>
            <div className="space-y-3">
              {topRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {route.from} → {route.to}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {route.occupancy}% Avg. Occupancy
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{route.revenue}</div>
                    <div className="text-xs text-green-500">{route.growth}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <Plus className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/schedules')}
              className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Create Schedule</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate('/buses')}
              className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bus className="w-5 h-5" />
                <span className="font-medium">Add Bus</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Generate Report</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full ${activity.color} mt-2`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{activity.subtitle}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="w-full mt-4 py-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

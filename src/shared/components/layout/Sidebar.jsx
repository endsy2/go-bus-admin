import React, { useState } from 'react';
import { NavItem } from './NavItem';
import { Icon } from 'shared/components/common/Icon';
import { Button } from 'shared/components/ui/button';
import { Avatar, AvatarFallback } from 'shared/components/ui/avatar';
import { LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'shared/components/ui/dialog';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import { hasPermission } from 'shared/utils/permissions';

export const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { locale } = useLocale();
  
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const allMenuItems = [
    { 
      id: 'dashboard', 
      icon: <Icon name="dashboard" />, 
      label: t('dashboard'),
      requiresPermission: null
    },
    { 
      id: 'bookings', 
      icon: <Icon name="calendar" />, 
      label: t('bookings'),
      requiresPermission: 'BOOKING_READ'
    },
    { 
      id: 'buses', 
      icon: <Icon name="bus" />, 
      label: t('buses'),
      requiresPermission: 'BUS_READ'
    },
    { 
      id: 'routes', 
      icon: <Icon name="mapPin" />, 
      label: t('routes'),
      requiresPermission: 'BUS_READ'
    },
    { 
      id: 'schedules', 
      icon: <Icon name="calendar" />, 
      label: 'Schedules',
      requiresPermission: 'BUS_READ'
    },
    { 
      id: 'layouts', 
      icon: <Icon name="grid" />, 
      label: 'Seat Layouts',
      requiresPermission: 'BUS_READ'
    },
    { 
      id: 'customers', 
      icon: <Icon name="users" />, 
      label: t('customers'),
      requiresPermission: 'USER_READ'
    },
    { 
      id: 'promos', 
      icon: <Icon name="ticket" />, 
      label: 'Promos',
      requiresPermission: 'ADMIN_ACCESS'
    },
    { 
      id: 'payments', 
      icon: <Icon name="dollarSign" />, 
      label: 'Payments',
      requiresPermission: 'BOOKING_READ'
    },
    { 
      id: 'wallets', 
      icon: <Icon name="dollarSign" />, 
      label: 'Wallets',
      requiresPermission: 'ADMIN_ACCESS'
    },
    { 
      id: 'notifications', 
      icon: <Icon name="bell" />, 
      label: 'Notifications',
      requiresPermission: null
    },
    { 
      id: 'reports', 
      icon: <Icon name="barChart" />, 
      label: t('reports'),
      requiresPermission: 'ADMIN_ACCESS'
    },
  ];

  const allTeamItems = [
    { 
      id: 'team', 
      icon: <Icon name="userCheck" />, 
      label: t('team'),
      requiresPermission: 'ADMIN_ACCESS'
    },
    { 
      id: 'admin', 
      icon: <Icon name="shield" />, 
      label: 'Admin Panel',
      requiresPermission: 'ADMIN_ACCESS'
    },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (!item.requiresPermission) return true;
    return hasPermission(user, item.requiresPermission);
  });

  const teamItems = allTeamItems.filter(item => {
    if (!item.requiresPermission) return true;
    return hasPermission(user, item.requiresPermission);
  });

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <>
      <div className="w-[260px] h-screen bg-gradient-to-b from-blue-600 via-blue-500 to-blue-700 text-white flex flex-col shadow-2xl fixed left-0 top-0 z-[100]">
        {/* Header */}
        <div className="px-6 py-6 border-b border-white/10 flex-shrink-0">
          <div className="mb-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center">
            <img 
              src="/go_bus_new_logo.png" 
              alt="GoBus Logo" 
              className="max-w-[160px] h-auto max-h-16 object-contain" 
            />
          </div>
          <p className="text-sm text-center text-white/80 font-medium">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="py-4 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="mb-5">
            <div className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
              MAIN
            </div>
            <div className="space-y-1">
              {menuItems.map(item => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                />
              ))}
            </div>
          </div>

          {teamItems.length > 0 && (
            <div className="mb-5">
              <div className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
                TEAM
              </div>
              <div className="space-y-1">
                {teamItems.map(item => (
                  <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/10 flex-shrink-0 bg-black/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl mb-3 hover:bg-white/15 transition-all duration-200">
            <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-white/20">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-base font-bold">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">
                {user?.userName || 'User'}
              </div>
              <div className="text-xs text-white/60 truncate">
                {user?.email || 'email'}
              </div>
            </div>
          </div>
          <Button 
            variant="destructive" 
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-white border border-red-400/30 hover:border-red-400/50 transition-all duration-200 shadow-lg"
            onClick={handleLogoutClick}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </div>

      <Dialog open={showLogoutDialog} onOpenChange={cancelLogout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelLogout}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;

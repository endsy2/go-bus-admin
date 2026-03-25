import React, { useState } from 'react';
import { NavItem } from './NavItem';
import { Icon } from 'shared/components/common/Icon';
import { Button } from 'shared/components/ui/button';
import { Avatar, AvatarFallback } from 'shared/components/ui/avatar';
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
      id: 'customers', 
      icon: <Icon name="users" />, 
      label: t('customers'),
      requiresPermission: 'USER_READ'
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
      <div className="w-[260px] h-screen bg-primary text-white flex flex-col shadow-lg fixed left-0 top-0 z-[100]">
        <div className="px-5 py-8 border-b border-white/10 flex-shrink-0 text-center">
          <div className="mb-4">
            <img src="/go_bus_new_logo.png" alt="GoBus Logo" className="max-w-[180px] h-auto max-h-20 object-contain mx-auto" />
          </div>
          <p className="text-sm opacity-80">Admin Panel</p>
        </div>

        <nav className="py-5 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mb-6">
            <div className="px-5 py-2 text-xs font-bold uppercase tracking-wide text-white/50 mb-1">
              Main
            </div>
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

          {teamItems.length > 0 && (
            <div className="mb-6">
              <div className="px-5 py-2 text-xs font-bold uppercase tracking-wide text-white/50 mb-1">
                Team
              </div>
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
          )}
        </nav>

        <div className="p-5 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg mb-4">
            <Avatar className="h-11 w-11 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">
                {user?.userName || 'User'}
              </div>
              <div className="text-xs text-white/70 truncate">
                {user?.email || 'email'}
              </div>
            </div>
          </div>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogoutClick}
          >
            Logout
          </Button>
        </div>
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

import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Eye, Trash2, AlertCircle, Bus as BusIcon, Users, MapPin } from 'lucide-react';
import { Button } from 'shared/components/ui/button';
import { Card, CardContent } from 'shared/components/ui/card';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useToast } from 'shared/components/ui/toast';
import { ConfirmDialog } from 'shared/components/feedback/ConfirmDialog';
import { Pagination } from 'shared/components/feedback/Pagination';
import BusDetailPage from '../BusDetailPage/BusDetailPage';
import CreateBusPage from '../CreateBusPage/CreateBusPage';
import busService from '../../services/busService';
import { routeService } from 'features/routes';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';

const BusesPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { addToast } = useToast();

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState({});
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [filterRoute, setFilterRoute] = useState('ALL');
  const [minSeats, setMinSeats] = useState('');
  const [maxSeats, setMaxSeats] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [busToDelete, setBusToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 15,
    totalPages: 0,
    totalElements: 0
  });

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchBuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.pageSize]);

  // Auto-fetch when filters change
  useEffect(() => {
    if (!loading) {
      setPagination(prev => ({ ...prev, currentPage: 0 }));
      fetchBuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRoute, filterType, filterStatus, minSeats, maxSeats]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchAllBuses(), fetchRoutes()]);
    setLoading(false);
  };

  const fetchAllBuses = async () => {
    try {
      const params = { pageNo: pagination.currentPage + 1, pageSize: pagination.pageSize };
      const result = await busService.getBuses(params);
      const data = result.data || result;
      const busData = data.content || data;
      setBuses(Array.isArray(busData) ? busData : []);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || (Array.isArray(busData) ? busData.length : 0)
      }));
      
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || 'Failed to fetch buses';
      setError(errorMessage);
      console.error('Error fetching buses:', err);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    setSearching(true);
    fetchBuses().finally(() => setSearching(false));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setPagination(prev => ({ ...prev, currentPage: 0 }));
      setSearching(true);
      fetchBuses().finally(() => setSearching(false));
    }
  };

  const handleClearFilters = () => {
    setFilterStatus('ALL');
    setFilterType('ALL');
    setFilterRoute('ALL');
    setSearch('');
    setMinSeats('');
    setMaxSeats('');
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchAllBuses();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination(prev => ({ ...prev, currentPage: 0, pageSize: newSize }));
  };

  const fetchBuses = async () => {
    try {
      const params = { pageNo: pagination.currentPage + 1, pageSize: pagination.pageSize };
      if (filterRoute !== 'ALL' && filterRoute) params.routeId = filterRoute;
      if (filterType !== 'ALL' && filterType) params.busType = filterType;
      if (filterStatus !== 'ALL' && filterStatus) params.status = filterStatus;
      if (search.trim()) params.busNumber = search.trim();
      if (minSeats && !isNaN(minSeats)) params.minSeats = minSeats;
      if (maxSeats && !isNaN(maxSeats)) params.maxSeats = maxSeats;

      const result = await busService.getBuses(params);
      const data = result.data || result;
      const busData = data.content || data;
      setBuses(Array.isArray(busData) ? busData : []);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || (Array.isArray(busData) ? busData.length : 0)
      }));
      
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || 'Failed to fetch buses';
      setError(errorMessage);
      console.error('Error fetching buses:', err);
    }
  };

  const fetchRoutes = async () => {
    try {
      const result = await routeService.getRoutes();
      const data = result.data || result;
      const routesArray = Array.isArray(data) ? data : [];
      const map = {};
      routesArray.forEach(r => {
        map[r.id] = `${r.origin} → ${r.destination}`;
      });
      setRoutes(map);
    } catch (err) {
      console.error('Error fetching routes:', err);
    }
  };

  const getRouteName = (routeId) => {
    if (!routeId) return 'Not Assigned';
    return routes[routeId] || `Route ${routeId}`;
  };

  const handleDeleteBus = (bus) => {
    setBusToDelete(bus);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!busToDelete) return;
    try {
      await busService.deleteBus(busToDelete.id);
      setBuses(prev => prev.filter(b => b.id !== busToDelete.id));
      addToast({
        message: `Bus ${busToDelete.busNumber} deleted successfully`,
        type: 'success'
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete bus';
      addToast({ message: errorMessage, type: 'error' });
    } finally {
      setShowDeleteDialog(false);
      setBusToDelete(null);
    }
  };

  const statusCounts = {
    active: buses.filter(b => (b.status || b.busStatus) === 'Active').length,
    standby: buses.filter(b => (b.status || b.busStatus) === 'Standby').length,
    maintenance: buses.filter(b => (b.status || b.busStatus) === 'Maintenance').length,
    inactive: buses.filter(b => (b.status || b.busStatus) === 'Inactive').length,
    inservice: buses.filter(b => (b.status || b.busStatus) === 'InService').length,
  };

  if (showCreatePage) {
    return (
      <CreateBusPage
        onBack={() => setShowCreatePage(false)}
        onSuccess={() => {
          setShowCreatePage(false);
          fetchAll();
          addToast({ message: t('busCreated') || 'Bus created successfully', type: 'success' });
        }}
      />
    );
  }

  if (selectedBusId) {
    return <BusDetailPage busId={selectedBusId} onBack={() => { setSelectedBusId(null); fetchAll(); }} />;
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
            </div>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
            <BusIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            {t('busManagement') || 'Bus Management'}
          </h1>
          <p className="text-muted-foreground">
            {t('busManagementDesc') || 'Manage your fleet of buses, routes, and schedules'}
          </p>
        </div>
        <Button onClick={() => setShowCreatePage(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addNewBus') || 'Add New Bus'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-l-4 border-destructive bg-destructive/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <span className="font-medium text-destructive">{error}</span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl text-white">
                <BusIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{buses.length}</div>
                <div className="text-sm text-muted-foreground">{t('totalBuses') || 'Total Buses'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl text-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{statusCounts.active}</div>
                <div className="text-sm text-muted-foreground">{t('active') || 'Active'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl text-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="10" y1="15" x2="10" y2="9"/>
                  <line x1="14" y1="15" x2="14" y2="9"/>
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{statusCounts.standby}</div>
                <div className="text-sm text-muted-foreground">{t('standby') || 'Standby'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl text-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{statusCounts.maintenance}</div>
                <div className="text-sm text-muted-foreground">{t('maintenance') || 'Maintenance'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-3 rounded-xl text-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{statusCounts.inactive}</div>
                <div className="text-sm text-muted-foreground">{t('inactive') || 'Inactive'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl text-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10 8 16 12 10 16 10 8"/>
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{statusCounts.inservice}</div>
                <div className="text-sm text-muted-foreground">{t('inservice') || 'In Service'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('searchBuses') || 'Search buses by number or model...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-10 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="gap-2"
            >
              {searching ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('searching') || 'Searching...'}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  {t('search') || 'Search'}
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('route') || 'Route'}</label>
              <select
                value={filterRoute}
                onChange={e => setFilterRoute(e.target.value)}
                className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ALL">{t('allRoutes') || 'All Routes'}</option>
                {Object.entries(routes).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('type') || 'Type'}</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ALL">{t('allTypes') || 'All Types'}</option>
                <option value="AC">AC</option>
                <option value="SLEEPER">Sleeper</option>
                <option value="SEATER">Seater</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('status') || 'Status'}</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ALL">{t('allStatus') || 'All Status'}</option>
                <option value="Active">{t('active') || 'Active'}</option>
                <option value="Standby">{t('standby') || 'Standby'}</option>
                <option value="Maintenance">{t('maintenance') || 'Maintenance'}</option>
                <option value="Inactive">{t('inactive') || 'Inactive'}</option>
                <option value="InService">{t('inservice') || 'In Service'}</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('minSeats') || 'Min Seats'}</label>
              <input
                type="number"
                placeholder="Min"
                value={minSeats}
                onChange={e => setMinSeats(e.target.value)}
                className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                min="1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('maxSeats') || 'Max Seats'}</label>
              <input
                type="number"
                placeholder="Max"
                value={maxSeats}
                onChange={e => setMaxSeats(e.target.value)}
                className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                min="1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium opacity-0">Clear</label>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                {t('clearFilters') || 'Clear Filters'}
              </Button>
            </div>
          </div>

          {searching ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : buses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BusIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {t('noBusesFound') || 'No buses found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('tryAdjustingFilters') || "Try adjusting your search or filters to find what you're looking for"}
              </p>
              <Button variant="outline" onClick={handleClearFilters} className="gap-2">
                <X className="h-4 w-4" />
                {t('clearFilters') || 'Clear Filters'}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm font-medium text-muted-foreground">
                      <th className="pb-3 px-4">{t('busInfo') || 'Bus Information'}</th>
                      <th className="pb-3 px-4">{t('type') || 'Type'}</th>
                      <th className="pb-3 px-4">{t('route') || 'Route'}</th>
                      <th className="pb-3 px-4">{t('seats') || 'Seats'}</th>
                      <th className="pb-3 px-4">{t('status') || 'Status'}</th>
                      <th className="pb-3 px-4 text-center">{t('actions') || 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map(bus => (
                      <tr key={bus.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-foreground">{bus.busNumber}</h3>
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                ID: B-{bus.id}
                              </span>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                  <line x1="1" y1="10" x2="23" y2="10"/>
                                </svg>
                                {bus.plate || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                  <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                {bus.model || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            bus.busType === 'SLEEPER' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            {bus.busType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-blue-600 dark:text-blue-400 font-medium">{getRouteName(bus.routeId)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {bus.totalSeats ?? 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            (bus.status || bus.busStatus) === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                            (bus.status || bus.busStatus) === 'Standby' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                            (bus.status || bus.busStatus) === 'Maintenance' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                            (bus.status || bus.busStatus) === 'InService' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              (bus.status || bus.busStatus) === 'Active' ? 'bg-emerald-500' :
                              (bus.status || bus.busStatus) === 'Standby' ? 'bg-amber-500' :
                              (bus.status || bus.busStatus) === 'Maintenance' ? 'bg-purple-500' :
                              (bus.status || bus.busStatus) === 'InService' ? 'bg-cyan-500' :
                              'bg-gray-500'
                            }`} />
                            {bus.status || bus.busStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedBusId(bus.id)}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                              title={t('viewDetails') || 'View Details'}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBus(bus)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                              title={t('delete') || 'Delete'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  pageSize={pagination.pageSize}
                  totalElements={pagination.totalElements}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title={t('deleteBus') || 'Delete Bus'}
        message={`${t('deleteBusConfirm') || 'Are you sure you want to delete'} ${busToDelete?.busNumber}? ${t('thisActionCannotBeUndone') || 'This action cannot be undone.'}`}
        confirmText={t('delete') || 'Delete'}
        cancelText={t('cancel') || 'Cancel'}
        type="danger"
      />
    </div>
  );
};

export default BusesPage;

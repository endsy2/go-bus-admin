import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Eye, Trash2, AlertCircle, MapPin, Clock, Activity, Bus, RefreshCw } from 'lucide-react';
import { Button } from 'shared/components/ui/button';
import { Card, CardContent } from 'shared/components/ui/card';
import { Badge } from 'shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shared/components/ui/select';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useToast } from 'shared/components/ui/toast';
import { ConfirmDialog } from 'shared/components/feedback/ConfirmDialog';
import RouteDetailPage from '../RouteDetailPage/RouteDetailPage';
import CreateRoutePage from '../CreateRoutePage/CreateRoutePage';
import { apiRequest } from 'shared/utils/api';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

const RoutesPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { addToast } = useToast();

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [allRoutes, setAllRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`${BASE_URL}/api/routes`, { method: 'GET' });
      const result = await response.json();
      if (response.ok) {
        const data = result.data || result;
        const routesArray = Array.isArray(data) ? data : [];
        setRoutes(routesArray);
        setAllRoutes(routesArray);
        setError('');
      } else {
        setError((result.data || result).message || 'Failed to fetch routes');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (origin = null, destination = null) => {
    let searchOrigin = origin;
    let searchDestination = destination;
    
    if (!origin && !destination) {
      if (!search.trim()) {
        fetchRoutes();
        return;
      }
      
      const searchTerms = search.trim().split(/\s+/);
      if (searchTerms.length >= 2) {
        searchOrigin = searchTerms[0];
        searchDestination = searchTerms.slice(1).join(' ');
      } else {
        searchOrigin = search.trim();
        searchDestination = search.trim();
      }
    }

    setSearching(true);
    
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('origin', searchOrigin);
      searchParams.append('destination', searchDestination);

      const response = await apiRequest(`${BASE_URL}/api/routes/search?${searchParams.toString()}`, { method: 'GET' });
      const result = await response.json();
      
      if (response.ok) {
        const data = result.data || result;
        setRoutes(Array.isArray(data) ? data : []);
        setError('');
      } else {
        setError((result.data || result).message || 'Search failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error searching routes:', err);
    } finally {
      setSearching(false);
    }
  };

  const resetSearch = () => {
    setSearch('');
    fetchRoutes();
  };

  const handleViewRoute = (routeId) => {
    setSelectedRouteId(routeId);
  };

  const handleBackFromDetail = () => {
    setSelectedRouteId(null);
    fetchRoutes();
  };

  const handleCreateRoute = () => {
    setShowCreateRoute(true);
  };

  const handleBackFromCreate = () => {
    setShowCreateRoute(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateRoute(false);
    fetchRoutes();
  };

  const handleDeleteRoute = (route) => {
    setRouteToDelete(route);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!routeToDelete) return;
    try {
      const response = await apiRequest(`${BASE_URL}/api/routes/${routeToDelete.id}`, { method: 'DELETE' });
      if (response.ok) {
        setRoutes(prev => prev.filter(r => r.id !== routeToDelete.id));
        addToast({
          message: `Route ${routeToDelete.origin} → ${routeToDelete.destination} deleted successfully`,
          type: 'success'
        });
      } else {
        addToast({ message: 'Failed to delete route', type: 'error' });
      }
    } catch (err) {
      addToast({ message: 'Network error', type: 'error' });
    } finally {
      setShowDeleteDialog(false);
      setRouteToDelete(null);
    }
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const totalBuses = routes.reduce((sum, r) => sum + (r.busCount || 0), 0);
  const totalDistance = routes.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
  const avgDuration = routes.length
    ? Math.round(routes.reduce((sum, r) => sum + (r.durationMinutes || 0), 0) / routes.length)
    : 0;

  if (showCreateRoute) {
    return (
      <CreateRoutePage
        onBack={handleBackFromCreate}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  if (selectedRouteId) {
    return (
      <RouteDetailPage
        routeId={selectedRouteId}
        onBack={handleBackFromDetail}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
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
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            {t('routesManagement') || 'Routes Management'}
          </h1>
          <p className="text-muted-foreground">
            {t('routesManagementDesc') || 'Manage bus routes, distances, and schedules'}
          </p>
        </div>
        <Button onClick={handleCreateRoute} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addNewRoute') || 'Add New Route'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-l-4 border-destructive bg-destructive/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <span className="font-medium text-destructive">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{routes.length}</div>
                <div className="text-sm text-muted-foreground">{t('totalRoutes') || 'Total Routes'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl text-white">
                <Bus className="h-6 w-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalBuses}</div>
                <div className="text-sm text-muted-foreground">{t('totalBusesAssigned') || 'Buses Assigned'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl text-white">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatDuration(avgDuration)}</div>
                <div className="text-sm text-muted-foreground">{t('avgDuration') || 'Avg Duration'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl text-white">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {Math.round(totalDistance).toLocaleString()}
                  <span className="text-lg text-muted-foreground ml-1">km</span>
                </div>
                <div className="text-sm text-muted-foreground">{t('totalDistance') || 'Total Distance'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Card */}
      <Card>
        <CardContent className="p-6">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="flex-1 relative">
              <Select value={search} onValueChange={setSearch}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectRoute') || 'Select a route to search...'} />
                </SelectTrigger>
                <SelectContent>
                  {allRoutes.map(route => (
                    <SelectItem 
                      key={route.id} 
                      value={`${route.origin} → ${route.destination}`}
                    >
                      {route.origin} → {route.destination} ({route.distanceKm?.toFixed(0)}km, {formatDuration(route.durationMinutes)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                if (search) {
                  const [origin, destination] = search.split(' → ');
                  handleSearch(origin, destination);
                } else {
                  fetchRoutes();
                }
              }}
              disabled={searching}
              className="gap-2"
            >
              {searching ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('searching') || 'Searching...'}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  {search ? (t('search') || 'Search') : (t('showAll') || 'Show All')}
                </>
              )}
            </Button>
            {search && (
              <Button
                variant="outline"
                onClick={resetSearch}
                disabled={searching}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                {t('clear') || 'Clear'}
              </Button>
            )}
          </div>

          {/* Routes List */}
          {routes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-muted p-6 rounded-full mb-4">
                <MapPin className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('noRoutesFound') || 'No routes found'}</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {search
                  ? t('tryAdjustingFilters') || "Try adjusting your search to find what you're looking for"
                  : t('startByAddingRoute') || 'Start by adding your first route'}
              </p>
              {search && (
                <Button variant="outline" onClick={resetSearch} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t('clearSearch') || 'Clear Search'}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {routes.map(route => (
                <Card key={route.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Route Path */}
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
                            <div className="text-xs text-muted-foreground mt-1">{t('origin') || 'Origin'}</div>
                          </div>
                          <div>
                            <div className="font-bold text-sm">{route.origin}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 px-3">
                          <div className="h-px w-8 bg-gradient-to-r from-blue-500 to-indigo-600" />
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <div className="h-px w-8 bg-gradient-to-r from-blue-500 to-indigo-600" />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-green-600" />
                            <div className="text-xs text-muted-foreground mt-1">{t('destination') || 'Destination'}</div>
                          </div>
                          <div>
                            <div className="font-bold text-sm">{route.destination}</div>
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="ml-2">ID: R-{route.id}</Badge>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 lg:gap-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{route.distanceKm?.toFixed(0)} km</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatDuration(route.durationMinutes)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Bus className="h-4 w-4 text-muted-foreground" />
                          <Badge className={route.busCount > 0 ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : ''}>
                            {route.busCount ?? 0} {route.busCount === 1 ? 'bus' : 'buses'}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleViewRoute(route.id)}
                          title={t('viewDetails') || 'View Details'}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteRoute(route)}
                          title={t('delete') || 'Delete'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Footer */}
          {routes.length > 0 && (
            <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
              {search ? (
                <>
                  {t('searchResults') || 'Search results'}: <strong>{routes.length}</strong> {t('routes') || 'routes'}
                  {routes.length > 0 && (
                    <span> for "{search}"</span>
                  )}
                </>
              ) : (
                <>
                  {t('showing') || 'Showing'} <strong>{routes.length}</strong> {t('routes') || 'routes'}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setShowDeleteDialog(false); setRouteToDelete(null); }}
        title={t('deleteRoute') || 'Delete Route'}
        message={`${t('deleteRouteConfirm') || 'Are you sure you want to delete the route'} ${routeToDelete?.origin} → ${routeToDelete?.destination}? ${t('thisActionCannotBeUndone') || 'This action cannot be undone.'}`}
        confirmText={t('delete') || 'Delete'}
        cancelText={t('cancel') || 'Cancel'}
        type="danger"
      />
    </div>
  );
};

export default RoutesPage;

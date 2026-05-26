import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Eye, Trash2, AlertCircle, MapPin, Clock, Activity, Bus } from 'lucide-react';
import { Button } from 'shared/components/ui/button';
import { Card, CardContent } from 'shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shared/components/ui/select';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useToast } from 'shared/components/ui/toast';
import { ConfirmDialog } from 'shared/components/feedback/ConfirmDialog';
import { Pagination } from 'shared/components/feedback/Pagination';
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
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 15,
    totalPages: 0,
    totalElements: 0
  });

  useEffect(() => {
    fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.pageSize]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      // Use paginated endpoint
      const response = await apiRequest(
        `${BASE_URL}/api/routes/paginate?pageNo=${pagination.currentPage + 1}&pageSize=${pagination.pageSize}`, 
        { method: 'GET' }
      );
      const result = await response.json();
      
      if (response.ok) {
        const data = result.data || result;
        const routesArray = data.content || data;
        
        setRoutes(Array.isArray(routesArray) ? routesArray : []);
        
        // Update pagination from API response
        setPagination(prev => ({
          ...prev,
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || 0
        }));
        
        setError('');
        
        // Also fetch all routes for the search dropdown
        fetchAllRoutesForDropdown();
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

  const fetchAllRoutesForDropdown = async () => {
    try {
      const response = await apiRequest(`${BASE_URL}/api/routes`, { method: 'GET' });
      const result = await response.json();
      if (response.ok) {
        const data = result.data || result;
        const routesArray = Array.isArray(data) ? data : [];
        setAllRoutes(routesArray);
      }
    } catch (err) {
      console.error('Error fetching all routes for dropdown:', err);
    }
  };

  const handleSearch = async (origin = null, destination = null) => {
    let searchOrigin = origin;
    let searchDestination = destination;
    
    if (!origin && !destination) {
      if (!search.trim()) {
        setPagination(prev => ({ ...prev, currentPage: 0 }));
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
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('origin', searchOrigin);
      searchParams.append('destination', searchDestination);

      const response = await apiRequest(`${BASE_URL}/api/routes/search?${searchParams.toString()}`, { method: 'GET' });
      const result = await response.json();
      
      if (response.ok) {
        const data = result.data || result;
        const routesArray = Array.isArray(data) ? data : [];
        
        setRoutes(routesArray);
        
        // Update pagination for search results (client-side pagination)
        setPagination(prev => ({
          ...prev,
          currentPage: 0,
          totalPages: Math.ceil(routesArray.length / prev.pageSize),
          totalElements: routesArray.length
        }));
        
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

  const handleClearFilters = () => {
    if (search) {
      setSearch('');
      setPagination(prev => ({ ...prev, currentPage: 0 }));
      fetchRoutes();
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination(prev => ({ ...prev, currentPage: 0, pageSize: newSize }));
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

  const totalBuses = allRoutes.reduce((sum, r) => sum + (r.busCount || 0), 0);
  const totalDistance = allRoutes.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
  const avgDuration = allRoutes.length
    ? Math.round(allRoutes.reduce((sum, r) => sum + (r.durationMinutes || 0), 0) / allRoutes.length)
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

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
            {t('routesManagement') || 'Routes Management'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('routesManagementDesc') || 'Manage bus routes, distances, and schedules'}
          </p>
        </div>
        <Button onClick={handleCreateRoute} className="gap-2 w-full sm:w-auto justify-center">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-1">{t('totalRoutes') || 'Total Routes'}</div>
          {loading ? <Skeleton className="h-6 w-12" /> : <div className="text-xl font-semibold text-foreground">{pagination.totalElements}</div>}
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-md bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Bus className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-1">{t('totalBusesAssigned') || 'Buses Assigned'}</div>
          {loading ? <Skeleton className="h-6 w-12" /> : <div className="text-xl font-semibold text-foreground">{totalBuses}</div>}
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-md bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-1">{t('avgDuration') || 'Avg Duration'}</div>
          {loading ? <Skeleton className="h-6 w-12" /> : <div className="text-xl font-semibold text-foreground">{formatDuration(avgDuration)}</div>}
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-md bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-1">{t('totalDistance') || 'Total Distance'}</div>
          {loading ? <Skeleton className="h-6 w-12" /> : (
            <div className="text-xl font-semibold text-foreground">
              {Math.round(totalDistance).toLocaleString()}
              <span className="text-sm text-muted-foreground ml-1">km</span>
            </div>
          )}
        </div>
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
                }
              }}
              disabled={searching || !search}
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
                  {t('search') || 'Search'}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={searching}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              {t('clearFilters') || 'Clear Filters'}
            </Button>
          </div>

          {/* Routes List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : routes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">{t('noRoutesFound') || 'No routes found'}</h3>
              <p className="text-sm text-muted-foreground mb-4 px-4">
                {search
                  ? t('tryAdjustingFilters') || "Try adjusting your search to find what you're looking for"
                  : t('startByAddingRoute') || 'Start by adding your first route'}
              </p>
              {search && (
                <Button variant="outline" onClick={handleClearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  {t('clearFilters') || 'Clear Filters'}
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {routes.map(route => (
                <div key={route.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 hover:bg-muted/30 -mx-2 px-2 rounded transition-colors">
                  {/* Route info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">
                      {route.origin} → {route.destination}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      R-{route.id} · {route.distanceKm?.toFixed(0)} km · {formatDuration(route.durationMinutes)} · {route.busCount ?? 0} {route.busCount === 1 ? 'bus' : 'buses'}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleViewRoute(route.id)}
                      title={t('viewDetails') || 'View Details'}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteRoute(route)}
                      title={t('delete') || 'Delete'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {routes.length > 0 && (
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

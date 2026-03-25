import React, { useState, useEffect } from 'react';
import { Button } from 'shared/components/common/Button';
import { Icon } from 'shared/components/common/Icon';
import { Snackbar } from 'shared/components/common/Snackbar';
import { ConfirmDialog } from 'shared/components/feedback/ConfirmDialog';
import RouteDetailPage from '../RouteDetailPage/RouteDetailPage';
import CreateRoutePage from '../CreateRoutePage/CreateRoutePage';
import { apiRequest } from 'shared/utils/api';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import './RoutesPage.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

const RoutesPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [allRoutes, setAllRoutes] = useState([]); // Store all routes for dropdown options

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
        setAllRoutes(routesArray); // Store all routes for suggestions
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
    // If called from dropdown selection, use provided origin/destination
    // Otherwise, parse from search input
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (search) {
        const [origin, destination] = search.split(' → ');
        handleSearch(origin, destination);
      } else {
        fetchRoutes();
      }
    }
  };

  const resetSearch = () => {
    setSearch('');
    fetchRoutes(); // Reload all routes when clearing search
  };

  const handleViewRoute = (routeId) => {
    setSelectedRouteId(routeId);
  };

  const handleBackFromDetail = () => {
    setSelectedRouteId(null);
    fetchRoutes(); // Refresh routes list
  };

  const handleCreateRoute = () => {
    setShowCreateRoute(true);
  };

  const handleBackFromCreate = () => {
    setShowCreateRoute(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateRoute(false);
    fetchRoutes(); // Refresh routes list
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
        setSnackbar({
          isOpen: true,
          message: `Route ${routeToDelete.origin} → ${routeToDelete.destination} deleted successfully`,
          type: 'success'
        });
      } else {
        setSnackbar({ isOpen: true, message: 'Failed to delete route', type: 'error' });
      }
    } catch (err) {
      setSnackbar({ isOpen: true, message: 'Network error', type: 'error' });
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

  const filteredRoutes = routes; // Routes are now filtered server-side

  const totalBuses = routes.reduce((sum, r) => sum + (r.busCount || 0), 0);
  const totalDistance = routes.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
  const avgDuration = routes.length
    ? Math.round(routes.reduce((sum, r) => sum + (r.durationMinutes || 0), 0) / routes.length)
    : 0;

  // Show CreateRoutePage if creating a new route
  if (showCreateRoute) {
    return (
      <CreateRoutePage
        onBack={handleBackFromCreate}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  // Show RouteDetailPage if a route is selected
  if (selectedRouteId) {
    return (
      <RouteDetailPage
        routeId={selectedRouteId}
        onBack={handleBackFromDetail}
      />
    );
  }

  // ── Skeleton Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="routes-page">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-subtitle"></div>
            </div>
            <div className="skeleton skeleton-button"></div>
          </div>
        </div>

        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card skeleton-card">
              <div className="skeleton skeleton-stat-icon"></div>
              <div className="stat-content">
                <div className="skeleton skeleton-stat-value"></div>
                <div className="skeleton skeleton-stat-label"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="content-card">
          <div className="filter-section">
            <div className="search-container">
              <div className="skeleton skeleton-search-input"></div>
              <div className="skeleton skeleton-search-button"></div>
            </div>
          </div>
          <div className="routes-list">
            <div className="list-header">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton skeleton-header-cell"></div>
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="route-list-item skeleton-list-item">
                <div className="route-path-cell">
                  <div className="skeleton skeleton-bus-number"></div>
                  <div className="skeleton skeleton-route-arrow"></div>
                  <div className="skeleton skeleton-bus-number"></div>
                </div>
                <div className="skeleton skeleton-route-stat"></div>
                <div className="skeleton skeleton-route-stat"></div>
                <div className="skeleton skeleton-route-stat"></div>
                <div className="actions-cell">
                  <div className="skeleton skeleton-action-btn"></div>
                  <div className="skeleton skeleton-action-btn"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="routes-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {t('routesManagement') || 'Routes Management'}
            </h1>
            <p className="page-subtitle">{t('routesManagementDesc') || 'Manage bus routes, distances, and schedules'}</p>
          </div>
          <Button variant="primary" className="add-bus-btn" onClick={handleCreateRoute}>
            <Icon name="plus" size={18} />
            {t('addNewRoute') || 'Add New Route'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <Icon name="alert-circle" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{routes.length}</span>
            <span className="stat-label">{t('totalRoutes') || 'Total Routes'}</span>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <path d="M16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalBuses}</span>
            <span className="stat-label">{t('totalBusesAssigned') || 'Buses Assigned'}</span>
          </div>
        </div>

        <div className="stat-card standby">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatDuration(avgDuration)}</span>
            <span className="stat-label">{t('avgDuration') || 'Avg Duration'}</span>
          </div>
        </div>

        <div className="stat-card maintenance">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h4l3-9 4 18 3-9h4"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{Math.round(totalDistance).toLocaleString()}<span className="stat-unit">km</span></span>
            <span className="stat-label">{t('totalDistance') || 'Total Distance'}</span>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="content-card">
        {/* Search */}
        <div className="filter-section">
          <div className="search-container">
            <div className="search-dropdown-wrapper">
              <div className="search-icon-left">
                <Icon name="search" size={18} />
              </div>
              <select
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  // Don't auto-search, just set the value
                }}
                className="search-dropdown-select"
              >
                <option value="">{t('selectRoute') || 'Select a route to search...'}</option>
                {allRoutes.map(route => (
                  <option 
                    key={route.id} 
                    value={`${route.origin} → ${route.destination}`}
                  >
                    {route.origin} → {route.destination} ({route.distanceKm?.toFixed(0)}km, {formatDuration(route.durationMinutes)})
                  </option>
                ))}
              </select>
              {search && (
                <button 
                  className="clear-search-btn" 
                  onClick={() => {
                    setSearch('');
                    // Don't auto-reload, just clear the selection
                  }}
                  title={t('clearSelection') || 'Clear Selection'}
                >
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
            <button
              className="search-btn"
              onClick={() => {
                if (search) {
                  const [origin, destination] = search.split(' → ');
                  handleSearch(origin, destination);
                } else {
                  fetchRoutes(); // Show all routes when no selection
                }
              }}
              disabled={searching}
            >
              {searching ? (
                <>
                  <div className="search-spinner"></div>
                  {t('searching') || 'Searching...'}
                </>
              ) : (
                <>
                  <Icon name="search" size={16} />
                  {search ? (t('search') || 'Search') : (t('showAll') || 'Show All')}
                </>
              )}
            </button>
            
            {/* Clear Button - separate from dropdown */}
            {search && (
              <button
                className="clear-btn"
                onClick={() => {
                  setSearch('');
                  fetchRoutes(); // Reset to show all routes
                }}
                disabled={searching}
                title={t('clearAndShowAll') || 'Clear and Show All Routes'}
              >
                <Icon name="x" size={16} />
                {t('clear') || 'Clear'}
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {filteredRoutes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
              </svg>
            </div>
            <h3 className="empty-title">{t('noRoutesFound') || 'No routes found'}</h3>
            <p className="empty-description">
              {search
                ? t('tryAdjustingFilters') || "Try adjusting your search to find what you're looking for"
                : t('startByAddingRoute') || 'Start by adding your first route'}
            </p>
            {search && (
              <Button variant="secondary" onClick={resetSearch} className="empty-action-btn">
                <Icon name="refresh-cw" size={18} />
                {t('clearSearch') || 'Clear Search'}
              </Button>
            )}
          </div>
        ) : (
          <div className="routes-list">
            {/* List Header */}
            <div className="list-header routes-list-header">
              <div className="list-header-cell route-path-header">{t('route') || 'Route'}</div>
              <div className="list-header-cell">{t('distance') || 'Distance'}</div>
              <div className="list-header-cell">{t('duration') || 'Duration'}</div>
              <div className="list-header-cell">{t('buses') || 'Buses'}</div>
              <div className="list-header-cell actions-header">{t('actions') || 'Actions'}</div>
            </div>

            {filteredRoutes.map(route => (
              <div key={route.id} className="route-list-item">
                {/* Route Path */}
                <div className="route-path-cell">
                  <div className="route-endpoint">
                    <div className="endpoint-dot origin-dot"></div>
                    <div className="endpoint-info">
                      <span className="endpoint-name">{route.origin}</span>
                      <span className="endpoint-label">{t('origin') || 'Origin'}</span>
                    </div>
                  </div>
                  <div className="route-connector">
                    <div className="connector-line"></div>
                    <div className="connector-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </div>
                    <div className="connector-line"></div>
                  </div>
                  <div className="route-endpoint">
                    <div className="endpoint-dot destination-dot"></div>
                    <div className="endpoint-info">
                      <span className="endpoint-name">{route.destination}</span>
                      <span className="endpoint-label">{t('destination') || 'Destination'}</span>
                    </div>
                  </div>
                  <span className="route-id-badge">ID: R-{route.id}</span>
                </div>

                {/* Distance */}
                <div className="list-cell">
                  <div className="route-stat">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12h4l3-9 4 18 3-9h4"/>
                    </svg>
                    <span className="route-stat-value">{route.distanceKm?.toFixed(0)} km</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="list-cell">
                  <div className="route-stat">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span className="route-stat-value">{formatDuration(route.durationMinutes)}</span>
                  </div>
                </div>

                {/* Bus Count */}
                <div className="list-cell">
                  <div className="route-stat">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="2"/>
                      <path d="M16 8h4l3 3v5h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    <span className={`bus-count-badge ${route.busCount > 0 ? 'has-buses' : 'no-buses'}`}>
                      {route.busCount ?? 0} {route.busCount === 1 ? 'bus' : 'buses'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="list-cell actions-cell">
                  <button
                    className="action-btn view-btn"
                    title={t('viewDetails') || 'View Details'}
                    onClick={() => handleViewRoute(route.id)}
                  >
                    <Icon name="eye" size={16} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    title={t('delete') || 'Delete'}
                    onClick={() => handleDeleteRoute(route)}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>

                {/* Mobile info */}
                <div className="mobile-info">
                  <div className="mobile-row">
                    <span className="mobile-label">{t('distance') || 'Distance'}</span>
                    <span>{route.distanceKm?.toFixed(0)} km</span>
                  </div>
                  <div className="mobile-row">
                    <span className="mobile-label">{t('duration') || 'Duration'}</span>
                    <span>{formatDuration(route.durationMinutes)}</span>
                  </div>
                  <div className="mobile-row">
                    <span className="mobile-label">{t('buses') || 'Buses'}</span>
                    <span className={`bus-count-badge ${route.busCount > 0 ? 'has-buses' : 'no-buses'}`}>
                      {route.busCount ?? 0} {route.busCount === 1 ? 'bus' : 'buses'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="results-footer">
          <span className="results-count">
            {search ? (
              <>
                {t('searchResults') || 'Search results'}: <strong>{filteredRoutes.length}</strong> {t('routes') || 'routes'}
                {filteredRoutes.length > 0 && (
                  <span className="search-hint"> for "{search}"</span>
                )}
              </>
            ) : (
              <>
                {t('showing') || 'Showing'} <strong>{filteredRoutes.length}</strong> {t('routes') || 'routes'}
              </>
            )}
          </span>
        </div>
      </div>

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

      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar(s => ({ ...s, isOpen: false }))}
        duration={3000}
      />
    </div>
  );
};

export default RoutesPage;
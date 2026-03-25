import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import Snackbar from '../../atoms/Snackbar/Snackbar';
import ConfirmDialog from '../../molecules/ConfirmDialog/ConfirmDialog';
import BusDetailPage from '../BusDetailPage/BusDetailPage';
import CreateBusPage from '../CreateBusPage/CreateBusPage';
import { busService, routeService } from '../../../services';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './BusesPage.css';

const BusesPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState({});
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });
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

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchAllBuses(), fetchRoutes()]);
    setLoading(false);
  };

  // Fetch all buses without filters for initial load
  const fetchAllBuses = async () => {
    try {
      const params = {
        pageNo: 1,
        pageSize: 1000
      };

      const result = await busService.getBuses(params);
      const data = result.data || result;
      const busData = data.content || data;
      setBuses(Array.isArray(busData) ? busData : []);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || 'Failed to fetch buses';
      setError(errorMessage);
      console.error('Error fetching buses:', err);
    }
  };

  const handleSearch = () => {
    setSearching(true);
    fetchBuses().finally(() => setSearching(false));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setSearching(true);
      fetchBuses().finally(() => setSearching(false));
    }
  };

  const resetFilters = () => {
    setFilterStatus('ALL');
    setFilterType('ALL');
    setFilterRoute('ALL');
    setSearch('');
    setMinSeats('');
    setMaxSeats('');
    // Fetch all buses without filters after resetting
    setSearching(true);
    setTimeout(() => {
      fetchAllBuses().finally(() => setSearching(false));
    }, 0);
  };

  const fetchBuses = async () => {
    try {
      // Build query parameters for API filtering
      const params = {
        pageNo: 1,
        pageSize: 1000
      };

      // Add filters only if they have values
      if (filterRoute !== 'ALL' && filterRoute) {
        params.routeId = filterRoute;
      }
      if (filterType !== 'ALL' && filterType) {
        params.busType = filterType;
      }
      if (filterStatus !== 'ALL' && filterStatus) {
        params.status = filterStatus;
      }
      if (search.trim()) {
        params.busNumber = search.trim();
      }
      if (minSeats && !isNaN(minSeats)) {
        params.minSeats = minSeats;
      }
      if (maxSeats && !isNaN(maxSeats)) {
        params.maxSeats = maxSeats;
      }

      const result = await busService.getBuses(params);
      const data = result.data || result;
      const busData = data.content || data;
      setBuses(Array.isArray(busData) ? busData : []);
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
      setSnackbar({
        isOpen: true,
        message: t('busDeleted') || `Bus ${busToDelete.busNumber} deleted successfully`,
        type: 'success'
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete bus';
      setSnackbar({ isOpen: true, message: errorMessage, type: 'error' });
    } finally {
      setShowDeleteDialog(false);
      setBusToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setBusToDelete(null);
  };

  const filteredBuses = buses; // Remove client-side filtering since we're using API filtering

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
          setSnackbar({ isOpen: true, message: t('busCreated') || 'Bus created successfully', type: 'success' });
        }}
      />
    );
  }

  if (selectedBusId) {
    return <BusDetailPage busId={selectedBusId} onBack={() => { setSelectedBusId(null); fetchAll(); }} />;
  }

  if (loading) {
    return (
      <div className="buses-page">
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
          {[...Array(6)].map((_, index) => (
            <div key={index} className="stat-card skeleton-card">
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
            <div className="filter-controls">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="filter-group">
                  <div className="skeleton skeleton-filter-label"></div>
                  <div className="skeleton skeleton-filter-input"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="buses-list">
            <div className="list-header">
              <div className="skeleton skeleton-header-cell"></div>
              <div className="skeleton skeleton-header-cell"></div>
              <div className="skeleton skeleton-header-cell"></div>
              <div className="skeleton skeleton-header-cell"></div>
              <div className="skeleton skeleton-header-cell"></div>
              <div className="skeleton skeleton-header-cell"></div>
            </div>

            {[...Array(5)].map((_, index) => (
              <div key={index} className="bus-list-item skeleton-list-item">
                <div className="bus-info-cell">
                  <div className="bus-main-info">
                    <div className="skeleton skeleton-bus-number"></div>
                    <div className="skeleton skeleton-bus-id"></div>
                  </div>
                  <div className="bus-details">
                    <div className="skeleton skeleton-bus-detail"></div>
                    <div className="skeleton skeleton-bus-detail"></div>
                  </div>
                </div>
                <div className="skeleton skeleton-type-badge"></div>
                <div className="skeleton skeleton-route-name"></div>
                <div className="skeleton skeleton-seats"></div>
                <div className="skeleton skeleton-status-badge"></div>
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

  return (
    <div className="buses-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              <Icon name="bus" size={28} />
              {t('busManagement') || 'Bus Management'}
            </h1>
            <p className="page-subtitle">{t('busManagementDesc') || 'Manage your fleet of buses, routes, and schedules'}</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreatePage(true)} className="add-bus-btn">
            <Icon name="plus" size={18} />
            {t('addNewBus') || 'Add New Bus'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <Icon name="alert-circle" size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        {/* Total Buses */}
        <div className="stat-card total">
          <div className="stat-icon">
            <Icon name="bus" size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{buses.length}</span>
            <span className="stat-label">{t('totalBuses') || 'Total Buses'}</span>
          </div>
        </div>

        {/* Active */}
        <div className="stat-card active">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{statusCounts.active}</span>
            <span className="stat-label">{t('active') || 'Active'}</span>
          </div>
        </div>

        {/* Standby */}
        <div className="stat-card standby">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="10" y1="15" x2="10" y2="9"/>
              <line x1="14" y1="15" x2="14" y2="9"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{statusCounts.standby}</span>
            <span className="stat-label">{t('standby') || 'Standby'}</span>
          </div>
        </div>

        {/* Maintenance */}
        <div className="stat-card maintenance">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{statusCounts.maintenance}</span>
            <span className="stat-label">{t('maintenance') || 'Maintenance'}</span>
          </div>
        </div>

        {/* Inactive */}
        <div className="stat-card inactive">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{statusCounts.inactive}</span>
            <span className="stat-label">{t('inactive') || 'Inactive'}</span>
          </div>
        </div>

        {/* In Service */}
        <div className="stat-card inservice">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{statusCounts.inservice}</span>
            <span className="stat-label">{t('inservice') || 'In Service'}</span>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="filter-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <Icon name="search" size={18} />
              <input
                type="text"
                placeholder={t('searchBuses') || 'Search buses by number or model...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input"
              />
              {search && (
                <button className="clear-search-btn" onClick={() => setSearch('')}>
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
            <button 
              className="search-btn"
              onClick={handleSearch}
              disabled={searching}
              title={t('search') || 'Search'}
            >
              {searching ? (
                <>
                  <div className="search-spinner"></div>
                  {t('searching') || 'Searching...'}
                </>
              ) : (
                <>
                  <Icon name="search" size={16} />
                  {t('search') || 'Search'}
                </>
              )}
            </button>
          </div>
          <div className="filter-controls">
            <div className="filter-group">
              <label className="filter-label">{t('route') || 'Route'}</label>
              <select
                value={filterRoute}
                onChange={e => setFilterRoute(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">{t('allRoutes') || 'All Routes'}</option>
                {Object.entries(routes).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">{t('type') || 'Type'}</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">{t('allTypes') || 'All Types'}</option>
                <option value="AC">AC</option>
                <option value="SLEEPER">Sleeper</option>
                <option value="SEATER">Seater</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">{t('status') || 'Status'}</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">{t('allStatus') || 'All Status'}</option>
                <option value="Active">{t('active') || 'Active'}</option>
                <option value="Standby">{t('standby') || 'Standby'}</option>
                <option value="Maintenance">{t('maintenance') || 'Maintenance'}</option>
                <option value="Inactive">{t('inactive') || 'Inactive'}</option>
                <option value="InService">{t('inservice') || 'In Service'}</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">{t('minSeats') || 'Min Seats'}</label>
              <input
                type="number"
                placeholder="Min"
                value={minSeats}
                onChange={e => setMinSeats(e.target.value)}
                className="filter-input"
                min="1"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">{t('maxSeats') || 'Max Seats'}</label>
              <input
                type="number"
                placeholder="Max"
                value={maxSeats}
                onChange={e => setMaxSeats(e.target.value)}
                className="filter-input"
                min="1"
              />
            </div>
            <div className="filter-group">
              <button 
                className="reset-filters-btn"
                onClick={resetFilters}
                title={t('resetFilters') || 'Reset Filters'}
              >
                <Icon name="refresh-cw" size={16} />
                {t('reset') || 'Reset'}
              </button>
            </div>
          </div>
        </div>

        {searching ? (
          <div className="buses-list">
            <div className="list-header">
              <div className="list-header-cell bus-info-header">{t('busInfo') || 'Bus Information'}</div>
              <div className="list-header-cell">{t('type') || 'Type'}</div>
              <div className="list-header-cell">{t('route') || 'Route'}</div>
              <div className="list-header-cell">{t('seats') || 'Seats'}</div>
              <div className="list-header-cell">{t('status') || 'Status'}</div>
              <div className="list-header-cell actions-header">{t('actions') || 'Actions'}</div>
            </div>

            {[...Array(5)].map((_, index) => (
              <div key={index} className="bus-list-item skeleton-list-item">
                <div className="bus-info-cell">
                  <div className="bus-main-info">
                    <div className="skeleton skeleton-bus-number"></div>
                    <div className="skeleton skeleton-bus-id"></div>
                  </div>
                  <div className="bus-details">
                    <div className="skeleton skeleton-bus-detail"></div>
                    <div className="skeleton skeleton-bus-detail"></div>
                  </div>
                </div>
                <div className="skeleton skeleton-type-badge"></div>
                <div className="skeleton skeleton-route-name"></div>
                <div className="skeleton skeleton-seats"></div>
                <div className="skeleton skeleton-status-badge"></div>
                <div className="actions-cell">
                  <div className="skeleton skeleton-action-btn"></div>
                  <div className="skeleton skeleton-action-btn"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="bus" size={64} />
            </div>
            <h3 className="empty-title">
              {t('noBusesFound') || 'No buses found'}
            </h3>
            <p className="empty-description">
              {t('tryAdjustingFilters') || "Try adjusting your search or filters to find what you're looking for"}
            </p>
            <Button variant="secondary" onClick={resetFilters} className="empty-action-btn">
              <Icon name="refresh-cw" size={18} />
              {t('resetFilters') || 'Reset Filters'}
            </Button>
          </div>
        ) : (
          <div className="buses-list">
            <div className="list-header">
              <div className="list-header-cell bus-info-header">{t('busInfo') || 'Bus Information'}</div>
              <div className="list-header-cell">{t('type') || 'Type'}</div>
              <div className="list-header-cell">{t('route') || 'Route'}</div>
              <div className="list-header-cell">{t('seats') || 'Seats'}</div>
              <div className="list-header-cell">{t('status') || 'Status'}</div>
              <div className="list-header-cell actions-header">{t('actions') || 'Actions'}</div>
            </div>

            {filteredBuses.map(bus => (
              <div key={bus.id} className="bus-list-item">
                <div className="bus-info-cell">
                  <div className="bus-main-info">
                    <h3 className="bus-number">{bus.busNumber}</h3>
                    <span className="bus-id">ID: B-{bus.id}</span>
                  </div>
                  <div className="bus-details">
                    <div className="bus-detail">
                      <Icon name="credit-card" size={14} />
                      <span>{bus.plate || 'N/A'}</span>
                    </div>
                    <div className="bus-detail">
                      <Icon name="truck" size={14} />
                      <span>{bus.model || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="list-cell">
                  <span className={`type-badge type-${(bus.busType || '').toLowerCase()}`}>
                    {bus.busType || 'N/A'}
                  </span>
                </div>

                <div className="list-cell route-cell">
                  <Icon name="map-pin" size={16} />
                  <span className="route-name">{getRouteName(bus.routeId)}</span>
                </div>

                <div className="list-cell seats-cell">
                  <Icon name="users" size={16} />
                  <span>{bus.totalSeats ?? 'N/A'}</span>
                </div>

                <div className="list-cell">
                  <span className={`status-badge status-${((bus.status || bus.busStatus) || '').toLowerCase()}`}>
                    <div className="status-indicator"></div>
                    {t(((bus.status || bus.busStatus) || '').toLowerCase()) || (bus.status || bus.busStatus)}
                  </span>
                </div>

                <div className="list-cell actions-cell">
                  <button
                    className="action-btn view-btn"
                    title={t('viewDetails') || 'View Details'}
                    onClick={() => setSelectedBusId(bus.id)}
                  >
                    <Icon name="eye" size={16} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    title={t('delete') || 'Delete'}
                    onClick={() => handleDeleteBus(bus)}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>

                {/* Mobile-only additional info */}
                <div className="mobile-info">
                  <div className="mobile-row">
                    <span className="mobile-label">{t('type') || 'Type'}</span>
                    <span className={`type-badge type-${(bus.busType || '').toLowerCase()}`}>
                      {bus.busType || 'N/A'}
                    </span>
                  </div>
                  <div className="mobile-row">
                    <span className="mobile-label">{t('route') || 'Route'}</span>
                    <span className="route-name">{getRouteName(bus.routeId)}</span>
                  </div>
                  <div className="mobile-row">
                    <span className="mobile-label">{t('seats') || 'Seats'}</span>
                    <span>{bus.totalSeats ?? 'N/A'}</span>
                  </div>
                  <div className="mobile-row">
                    <span className="mobile-label">{t('status') || 'Status'}</span>
                    <span className={`status-badge status-${((bus.status || bus.busStatus) || '').toLowerCase()}`}>
                      <div className="status-indicator"></div>
                      {t(((bus.status || bus.busStatus) || '').toLowerCase()) || (bus.status || bus.busStatus)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="results-footer">
          <span className="results-count">
            {t('showing') || 'Showing'} <strong>{filteredBuses.length}</strong> {t('of') || 'of'} <strong>{buses.length}</strong> {t('buses') || 'buses'}
          </span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title={t('deleteBus') || 'Delete Bus'}
        message={`${t('deleteBusConfirm') || 'Are you sure you want to delete'} ${busToDelete?.busNumber}? ${t('thisActionCannotBeUndone') || 'This action cannot be undone.'}`}
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

export default BusesPage;
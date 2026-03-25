import React, { useState, useEffect } from 'react';
import { Button } from 'shared/components/common/Button';
import { Icon } from 'shared/components/common/Icon';
import { Input } from 'shared/components/common/Input';
import { Snackbar } from 'shared/components/common/Snackbar';
import { ConfirmDialog } from 'shared/components/feedback/ConfirmDialog';
import { apiRequest } from 'shared/utils/api';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import './RouteDetailPage.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

const RouteDetailPage = ({ routeId, onBack }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distanceKm: '',
    durationMinutes: '',
    lat: '',
    lng: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (routeId) fetchRouteDetails();
  }, [routeId]);

  // Parse the location JSON string → { lat, lng } or null
  const parseLocation = (locationStr) => {
    if (!locationStr) return null;
    try {
      const parsed = typeof locationStr === 'string' ? JSON.parse(locationStr) : locationStr;
      if (parsed?.lat !== undefined && parsed?.lng !== undefined) return parsed;
      return null;
    } catch {
      return null;
    }
  };

  const fetchRouteDetails = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${BASE_URL}/api/routes/${routeId}`, { method: 'GET' });
      if (response.ok) {
        const result = await response.json();
        const routeData = result.data || result;
        setRoute(routeData);
        const loc = parseLocation(routeData.location);
        setFormData({
          origin: routeData.origin || '',
          destination: routeData.destination || '',
          distanceKm: routeData.distanceKm?.toString() || '',
          durationMinutes: routeData.durationMinutes?.toString() || '',
          lat: loc?.lat?.toString() || '',
          lng: loc?.lng?.toString() || '',
        });
        setError('');
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to fetch route details');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.origin.trim()) errors.origin = 'Origin is required';
    if (!formData.destination.trim()) errors.destination = 'Destination is required';
    if (!formData.distanceKm || isNaN(formData.distanceKm) || parseFloat(formData.distanceKm) <= 0)
      errors.distanceKm = 'Valid distance is required';
    if (!formData.durationMinutes || isNaN(formData.durationMinutes) || parseInt(formData.durationMinutes) <= 0)
      errors.durationMinutes = 'Valid duration is required';
    if (formData.lat && isNaN(parseFloat(formData.lat))) errors.lat = 'Invalid latitude';
    if (formData.lng && isNaN(parseFloat(formData.lng))) errors.lng = 'Invalid longitude';
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setSaving(true);
    try {
      // Rebuild location JSON string if coords provided
      const locationValue = formData.lat && formData.lng
        ? JSON.stringify({ lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) })
        : route?.location || '';

      const updateData = {
        origin: formData.origin,
        destination: formData.destination,
        distanceKm: parseFloat(formData.distanceKm),
        durationMinutes: parseInt(formData.durationMinutes),
        location: locationValue,
      };

      const response = await apiRequest(`${BASE_URL}/api/routes/${routeId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedRoute = result.data || result;
        setRoute(updatedRoute);
        setIsEditing(false);
        setSnackbar({ isOpen: true, message: t('routeUpdated') || 'Route updated successfully!', type: 'success' });
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to update route');
      }
    } catch (err) {
      setError('Network error. Failed to update route.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await apiRequest(`${BASE_URL}/api/routes/${routeId}`, { method: 'DELETE' });
      if (response.ok) {
        setSnackbar({ isOpen: true, message: t('routeDeleted') || 'Route deleted successfully!', type: 'success' });
        setTimeout(() => onBack(), 1000);
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to delete route');
      }
    } catch (err) {
      setError('Network error. Failed to delete route.');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleCancel = () => {
    if (route) {
      const loc = parseLocation(route.location);
      setFormData({
        origin: route.origin || '',
        destination: route.destination || '',
        distanceKm: route.distanceKm?.toString() || '',
        durationMinutes: route.durationMinutes?.toString() || '',
        lat: loc?.lat?.toString() || '',
        lng: loc?.lng?.toString() || '',
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  const openInMaps = (lat, lng, label) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}&z=12&hl=en`, '_blank');
  };

  // ── Skeleton ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="route-detail-page">
        <div className="route-detail-header">
          <div className="skeleton skeleton-back-btn"></div>
        </div>
        <div className="route-detail-container">
          <div className="route-detail-card">
            <div className="route-header">
              <div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-subtitle"></div>
              </div>
              <div className="header-actions">
                <div className="skeleton skeleton-button"></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            </div>
            <div className="route-path-visual">
              <div className="location-point">
                <div className="skeleton skeleton-location-icon"></div>
                <div className="location-info">
                  <div className="skeleton skeleton-location-name"></div>
                  <div className="skeleton skeleton-location-label"></div>
                </div>
              </div>
              <div className="route-line-container">
                <div className="skeleton skeleton-route-line"></div>
              </div>
              <div className="location-point">
                <div className="skeleton skeleton-location-icon"></div>
                <div className="location-info">
                  <div className="skeleton skeleton-location-name"></div>
                  <div className="skeleton skeleton-location-label"></div>
                </div>
              </div>
            </div>
            <div className="route-details-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="detail-item">
                  <div className="skeleton skeleton-detail-label"></div>
                  <div className="skeleton skeleton-detail-value"></div>
                </div>
              ))}
            </div>
            <div className="skeleton skeleton-map-preview"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="route-detail-page">
        <div className="route-detail-header">
          <button className="back-btn" onClick={onBack}>
            <Icon name="arrow-left" size={20} />
            {t('backToRoutes') || 'Back to Routes'}
          </button>
        </div>
        <div className="error-state">
          <Icon name="alert-circle" size={48} />
          <h3>{t('routeNotFound') || 'Route Not Found'}</h3>
          <p>{t('routeNotFoundDesc') || "The route you're looking for doesn't exist or has been deleted."}</p>
          <Button variant="primary" onClick={onBack}>{t('backToRoutes') || 'Back to Routes'}</Button>
        </div>
      </div>
    );
  }

  const location = parseLocation(route.location);

  return (
    <div className="route-detail-page">
      {/* Header */}
      <div className="route-detail-header">
        <button className="back-btn" onClick={onBack}>
          <Icon name="arrow-left" size={20} />
          {t('backToRoutes') || 'Back to Routes'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <Icon name="alert-circle" size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="route-detail-container">
        <div className="route-detail-card">

          {/* Card Header */}
          <div className="route-header">
            <div>
              <h1>{t('routeDetails') || 'Route Details'}</h1>
              <p>{t('routeDetailsDesc') || 'Manage route information and settings'}</p>
            </div>
            <div className="header-actions">
              {!isEditing ? (
                <>
                  <Button variant="secondary" onClick={() => setIsEditing(true)}>
                    <Icon name="edit" size={16} />
                    {t('edit') || 'Edit Route'}
                  </Button>
                  <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
                    <Icon name="trash" size={16} />
                    {t('delete') || 'Delete'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={handleCancel}>
                    {t('cancel') || 'Cancel'}
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? (t('saving') || 'Saving...') : (t('saveChanges') || 'Save Changes')}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* ── View Mode ───────────────────────────────────────────────── */}
          {!isEditing ? (
            <>
              {/* Route Path Visual */}
              <div className="route-path-visual">
                <div className="location-point">
                  <div className="location-icon origin-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="location-info">
                    <div className="location-name">{route.origin}</div>
                    <div className="location-label">{t('origin') || 'Origin'}</div>
                  </div>
                </div>

                <div className="route-line-container">
                  <div className="route-line">
                    <div className="route-line-track"></div>
                    <div className="route-line-bus">🚌</div>
                  </div>
                  <div className="route-stats">
                    <span className="route-stat">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12h4l3-9 4 18 3-9h4"/>
                      </svg>
                      {route.distanceKm} km
                    </span>
                    <span className="route-stat">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {formatDuration(route.durationMinutes)}
                    </span>
                  </div>
                </div>

                <div className="location-point">
                  <div className="location-icon destination-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="location-info">
                    <div className="location-name">{route.destination}</div>
                    <div className="location-label">{t('destination') || 'Destination'}</div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="route-details-grid">
                <div className="detail-item">
                  <div className="detail-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    {t('routeId') || 'Route ID'}
                  </div>
                  <div className="detail-value mono">RT-{route.id}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12h4l3-9 4 18 3-9h4"/>
                    </svg>
                    {t('distance') || 'Distance'}
                  </div>
                  <div className="detail-value">{route.distanceKm} km</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {t('duration') || 'Duration'}
                  </div>
                  <div className="detail-value">{formatDuration(route.durationMinutes)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    {t('totalBusesAssigned') || 'Buses Assigned'}
                  </div>
                  <div className="detail-value">
                    <span className={`bus-count-badge ${(route.busCount || 0) > 0 ? 'has-buses' : 'no-buses'}`}>
                      {route.busCount || 0} {(route.busCount === 1) ? 'bus' : 'buses'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Location Section ──────────────────────────────────── */}
              <div className="location-section">
                <div className="location-section-header">
                  <div className="location-section-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {t('locationCoordinates') || 'Location Coordinates'}
                  </div>
                </div>

                {location ? (
                  <div className="location-display">
                    {/* Coordinate Cards */}
                    <div className="coordinate-cards">
                      <div className="coordinate-card">
                        <div className="coordinate-label">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                          Latitude
                        </div>
                        <div className="coordinate-value">{location.lat.toFixed(6)}°</div>
                        <div className="coordinate-direction">{location.lat >= 0 ? 'North' : 'South'}</div>
                      </div>
                      <div className="coordinate-card">
                        <div className="coordinate-label">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                          </svg>
                          Longitude
                        </div>
                        <div className="coordinate-value">{location.lng.toFixed(6)}°</div>
                        <div className="coordinate-direction">{location.lng >= 0 ? 'East' : 'West'}</div>
                      </div>
                    </div>

                    {/* Map Preview — static embed via OpenStreetMap */}
                    <div className="map-preview-container">
                      <div className="map-preview-header">
                        <span className="map-preview-label">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                          </svg>
                          Map Preview
                        </span>
                        <button
                          className="open-maps-btn"
                          onClick={() => openInMaps(location.lat, location.lng)}
                          title="Open in Google Maps"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                          Open in Google Maps
                        </button>
                      </div>
                      <div className="map-frame-wrapper">
                        <iframe
                          title="Route Location Map"
                          className="map-frame"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.15},${location.lat - 0.1},${location.lng + 0.15},${location.lat + 0.1}&layer=mapnik&marker=${location.lat},${location.lng}`}
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                      <div className="map-coords-footer">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-location">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                    <p>{t('noLocationData') || 'No location coordinates available'}</p>
                    <span>{t('noLocationDataDesc') || 'Edit this route to add GPS coordinates'}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── Edit Mode ────────────────────────────────────────────── */
            <div className="edit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('origin') || 'Origin'} *</label>
                  <Input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="e.g. Phnom Penh"
                    error={formErrors.origin}
                  />
                </div>

                <div className="form-group">
                  <label>{t('destination') || 'Destination'} *</label>
                  <Input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="e.g. Kampot"
                    error={formErrors.destination}
                  />
                </div>

                <div className="form-group">
                  <label>{t('distance') || 'Distance'} (km) *</label>
                  <Input
                    type="number"
                    name="distanceKm"
                    value={formData.distanceKm}
                    onChange={handleInputChange}
                    placeholder="e.g. 148"
                    min="1"
                    step="0.1"
                    error={formErrors.distanceKm}
                  />
                </div>

                <div className="form-group">
                  <label>{t('duration') || 'Duration'} ({t('minutes') || 'minutes'}) *</label>
                  <Input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    placeholder="e.g. 360"
                    min="1"
                    error={formErrors.durationMinutes}
                  />
                </div>

                {/* Coordinates — split into two readable fields */}
                <div className="form-group coords-section">
                  <label className="coords-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {t('locationCoordinates') || 'Location Coordinates'}
                    <span className="optional-tag">({t('optional') || 'optional'})</span>
                  </label>
                  <div className="coords-inputs">
                    <div className="coord-input-group">
                      <span className="coord-prefix">LAT</span>
                      <input
                        type="number"
                        name="lat"
                        value={formData.lat}
                        onChange={handleInputChange}
                        placeholder="e.g. 11.5564"
                        step="0.0001"
                        className={`coord-input ${formErrors.lat ? 'has-error' : ''}`}
                      />
                    </div>
                    <div className="coord-input-group">
                      <span className="coord-prefix">LNG</span>
                      <input
                        type="number"
                        name="lng"
                        value={formData.lng}
                        onChange={handleInputChange}
                        placeholder="e.g. 104.9282"
                        step="0.0001"
                        className={`coord-input ${formErrors.lng ? 'has-error' : ''}`}
                      />
                    </div>
                  </div>
                  {(formErrors.lat || formErrors.lng) && (
                    <span className="coord-error">{formErrors.lat || formErrors.lng}</span>
                  )}
                  <span className="coord-hint">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Coordinates will be shown on an interactive map on the detail page.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title={t('deleteRoute') || 'Delete Route'}
        message={`${t('deleteRouteConfirm') || 'Are you sure you want to delete the route from'} ${route?.origin} ${t('to') || 'to'} ${route?.destination}? ${t('thisActionCannotBeUndone') || 'This action cannot be undone.'}`}
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

export default RouteDetailPage;
import React, { useState } from 'react';
import { Button } from 'shared/components/common/Button';
import { Icon } from 'shared/components/common/Icon';
import { Snackbar } from 'shared/components/common/Snackbar';
import { apiRequest } from 'shared/utils/api';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import './CreateRoutePage.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

const CreateRoutePage = ({ onBack, onSuccess }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distanceKm: '',
    durationMinutes: '',
    lat: '',
    lng: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ── Helpers ────────────────────────────────────────────────────────────
  const formatDurationPreview = (minutes) => {
    const m = parseInt(minutes);
    if (!m || isNaN(m) || m <= 0) return null;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'origin':
        if (!value.trim()) return t('originRequired') || 'Origin is required';
        if (value.trim().length < 2) return t('originTooShort') || 'At least 2 characters';
        return '';
      case 'destination':
        if (!value.trim()) return t('destinationRequired') || 'Destination is required';
        if (value.trim().length < 2) return t('destinationTooShort') || 'At least 2 characters';
        if (value.trim().toLowerCase() === formData.origin.trim().toLowerCase())
          return t('sameOriginDestination') || 'Origin and destination cannot be the same';
        return '';
      case 'distanceKm':
        if (!value) return t('distanceRequired') || 'Distance is required';
        if (isNaN(value) || parseFloat(value) <= 0) return t('distanceInvalid') || 'Enter a valid positive number';
        if (parseFloat(value) > 10000) return t('distanceTooLarge') || 'Distance seems too large';
        return '';
      case 'durationMinutes':
        if (!value) return t('durationRequired') || 'Duration is required';
        if (isNaN(value) || parseInt(value) <= 0) return t('durationInvalid') || 'Enter a valid positive number';
        if (parseInt(value) > 10080) return t('durationTooLarge') || 'Duration exceeds 1 week';
        return '';
      case 'lat':
        if (value && (isNaN(value) || parseFloat(value) < -90 || parseFloat(value) > 90))
          return t('latInvalid') || 'Latitude must be between -90 and 90';
        return '';
      case 'lng':
        if (value && (isNaN(value) || parseFloat(value) < -180 || parseFloat(value) > 180))
          return t('lngInvalid') || 'Longitude must be between -180 and 180';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Touch all fields
    const allTouched = Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const locationValue = formData.lat && formData.lng
        ? JSON.stringify({ lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) })
        : null;

      const payload = {
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
        distanceKm: parseFloat(formData.distanceKm),
        durationMinutes: parseInt(formData.durationMinutes),
        ...(locationValue && { location: locationValue }),
      };

      const response = await apiRequest(`${BASE_URL}/api/routes`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSnackbar({ isOpen: true, message: t('routeCreated') || 'Route created successfully!', type: 'success' });
        setTimeout(() => onSuccess?.(), 1200);
      } else {
        const result = await response.json();
        setSnackbar({ isOpen: true, message: result.message || 'Failed to create route', type: 'error' });
      }
    } catch (err) {
      setSnackbar({ isOpen: true, message: 'Network error. Please check your connection.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const durationPreview = formatDurationPreview(formData.durationMinutes);
  const hasCoords = formData.lat && formData.lng;
  const completedFields = Object.values(formData).filter(v => v.trim() !== '').length;
  const requiredFields = 4; // origin, destination, distance, duration
  const progress = Math.min(
    Math.round((Object.entries(formData)
      .filter(([k]) => ['origin', 'destination', 'distanceKm', 'durationMinutes'].includes(k))
      .filter(([, v]) => v.trim() !== '').length / requiredFields) * 100),
    100
  );

  return (
    <div className="create-route-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-btn" onClick={onBack}>
              <Icon name="arrow-left" size={18} />
              {t('backToRoutes') || 'Back to Routes'}
            </button>
            <div className="header-text">
              <h1 className="page-title">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                {t('createRoute') || 'Create New Route'}
              </h1>
              <p className="page-subtitle">{t('createRouteDesc') || 'Add a new bus route with origin, destination, and GPS coordinates'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="create-route-layout">
        {/* ── Left: Form ─────────────────────────────────────────────── */}
        <div className="form-column">
          <form onSubmit={handleSubmit} noValidate>

            {/* Progress Bar */}
            <div className="progress-card">
              <div className="progress-header">
                <span className="progress-label">{t('formCompletion') || 'Form Completion'}</span>
                <span className="progress-pct">{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="progress-hint">
                {progress === 100
                  ? (t('readyToCreate') || '✓ Ready to create route')
                  : (t('fillRequired') || 'Fill in all required fields to continue')}
              </span>
            </div>

            {/* Section: Route Path */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon blue">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </div>
                <div>
                  <h2 className="section-title">{t('routePath') || 'Route Path'}</h2>
                  <p className="section-subtitle">{t('routePathDesc') || 'Define the start and end points of this route'}</p>
                </div>
              </div>

              <div className="path-inputs">
                {/* Origin */}
                <div className={`field-group ${touched.origin && errors.origin ? 'has-error' : touched.origin && !errors.origin && formData.origin ? 'is-valid' : ''}`}>
                  <label className="field-label">
                    <span className="origin-dot"></span>
                    {t('origin') || 'Origin'} <span className="required-star">*</span>
                  </label>
                  <div className="field-input-wrapper">
                    <input
                      type="text"
                      name="origin"
                      value={formData.origin}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('originPlaceholder') || 'e.g. Phnom Penh'}
                      className="field-input"
                      autoComplete="off"
                    />
                    {touched.origin && !errors.origin && formData.origin && (
                      <div className="field-valid-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  {touched.origin && errors.origin && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {errors.origin}
                    </span>
                  )}
                </div>

                {/* Visual connector */}
                <div className="path-connector">
                  <div className="connector-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="connector-arrow">
                    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                  </svg>
                </div>

                {/* Destination */}
                <div className={`field-group ${touched.destination && errors.destination ? 'has-error' : touched.destination && !errors.destination && formData.destination ? 'is-valid' : ''}`}>
                  <label className="field-label">
                    <span className="destination-dot"></span>
                    {t('destination') || 'Destination'} <span className="required-star">*</span>
                  </label>
                  <div className="field-input-wrapper">
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('destinationPlaceholder') || 'e.g. Siem Reap'}
                      className="field-input"
                      autoComplete="off"
                    />
                    {touched.destination && !errors.destination && formData.destination && (
                      <div className="field-valid-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  {touched.destination && errors.destination && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {errors.destination}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Trip Details */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon green">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h4l3-9 4 18 3-9h4"/>
                  </svg>
                </div>
                <div>
                  <h2 className="section-title">{t('tripDetails') || 'Trip Details'}</h2>
                  <p className="section-subtitle">{t('tripDetailsDesc') || 'Enter distance and travel time for this route'}</p>
                </div>
              </div>

              <div className="two-col-grid">
                {/* Distance */}
                <div className={`field-group ${touched.distanceKm && errors.distanceKm ? 'has-error' : touched.distanceKm && !errors.distanceKm && formData.distanceKm ? 'is-valid' : ''}`}>
                  <label className="field-label">
                    {t('distance') || 'Distance'} <span className="required-star">*</span>
                  </label>
                  <div className="field-input-wrapper has-suffix">
                    <input
                      type="number"
                      name="distanceKm"
                      value={formData.distanceKm}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 314"
                      className="field-input"
                      min="0.1"
                      step="0.1"
                    />
                    <span className="field-suffix">km</span>
                  </div>
                  {touched.distanceKm && errors.distanceKm && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {errors.distanceKm}
                    </span>
                  )}
                </div>

                {/* Duration */}
                <div className={`field-group ${touched.durationMinutes && errors.durationMinutes ? 'has-error' : touched.durationMinutes && !errors.durationMinutes && formData.durationMinutes ? 'is-valid' : ''}`}>
                  <label className="field-label">
                    {t('duration') || 'Duration'} <span className="required-star">*</span>
                  </label>
                  <div className="field-input-wrapper has-suffix">
                    <input
                      type="number"
                      name="durationMinutes"
                      value={formData.durationMinutes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 360"
                      className="field-input"
                      min="1"
                    />
                    <span className="field-suffix">min</span>
                  </div>
                  {touched.durationMinutes && errors.durationMinutes ? (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {errors.durationMinutes}
                    </span>
                  ) : durationPreview ? (
                    <span className="field-hint-ok">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {durationPreview}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Section: GPS Coordinates (optional) */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon purple">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h2 className="section-title">
                    {t('locationCoordinates') || 'GPS Coordinates'}
                    <span className="optional-badge">{t('optional') || 'Optional'}</span>
                  </h2>
                  <p className="section-subtitle">{t('coordsDesc') || 'Add coordinates to show this route on an interactive map'}</p>
                </div>
              </div>

              <div className="coords-grid">
                <div className={`field-group ${touched.lat && errors.lat ? 'has-error' : ''}`}>
                  <label className="field-label">Latitude</label>
                  <div className="coord-input-wrapper">
                    <span className="coord-badge">LAT</span>
                    <input
                      type="number"
                      name="lat"
                      value={formData.lat}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 11.5564"
                      className="coord-input"
                      step="0.0001"
                    />
                  </div>
                  {touched.lat && errors.lat && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {errors.lat}
                    </span>
                  )}
                </div>

                <div className={`field-group ${touched.lng && errors.lng ? 'has-error' : ''}`}>
                  <label className="field-label">Longitude</label>
                  <div className="coord-input-wrapper">
                    <span className="coord-badge">LNG</span>
                    <input
                      type="number"
                      name="lng"
                      value={formData.lng}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 104.9282"
                      className="coord-input"
                      step="0.0001"
                    />
                  </div>
                  {touched.lng && errors.lng && (
                    <span className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {errors.lng}
                    </span>
                  )}
                </div>
              </div>

              {hasCoords && !errors.lat && !errors.lng && (
                <div className="map-mini-preview">
                  <div className="map-mini-header">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                    </svg>
                    {t('mapPreview') || 'Map Preview'}
                  </div>
                  <iframe
                    title="Coordinate Preview"
                    className="map-mini-frame"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(formData.lng) - 0.1},${parseFloat(formData.lat) - 0.08},${parseFloat(formData.lng) + 0.1},${parseFloat(formData.lat) + 0.08}&layer=mapnik&marker=${formData.lat},${formData.lng}`}
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="form-actions">
              <Button variant="secondary" type="button" onClick={onBack} disabled={submitting}>
                {t('cancel') || 'Cancel'}
              </Button>
              <button
                type="submit"
                className={`submit-btn ${submitting ? 'is-loading' : ''} ${progress === 100 ? 'is-ready' : ''}`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="submit-spinner"></div>
                    {t('creating') || 'Creating...'}
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    {t('createRoute') || 'Create Route'}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* ── Right: Live Preview ────────────────────────────────────── */}
        <div className="preview-column">
          <div className="preview-card">
            <div className="preview-card-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {t('livePreview') || 'Live Preview'}
            </div>

            <div className="preview-body">
              {/* Route visual */}
              <div className="preview-route">
                <div className="preview-endpoint">
                  <div className="preview-dot origin"></div>
                  <div className="preview-city">
                    {formData.origin || <span className="preview-empty">{t('origin') || 'Origin'}</span>}
                    <span className="preview-city-label">{t('origin') || 'Origin'}</span>
                  </div>
                </div>
                <div className="preview-line">
                  <div className="preview-track"></div>
                  <span className="preview-bus">🚌</span>
                </div>
                <div className="preview-endpoint">
                  <div className="preview-dot destination"></div>
                  <div className="preview-city">
                    {formData.destination || <span className="preview-empty">{t('destination') || 'Destination'}</span>}
                    <span className="preview-city-label">{t('destination') || 'Destination'}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="preview-stats">
                <div className="preview-stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h4l3-9 4 18 3-9h4"/>
                  </svg>
                  <span className="preview-stat-label">{t('distance') || 'Distance'}</span>
                  <span className="preview-stat-value">
                    {formData.distanceKm ? `${formData.distanceKm} km` : <span className="preview-empty">—</span>}
                  </span>
                </div>
                <div className="preview-stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className="preview-stat-label">{t('duration') || 'Duration'}</span>
                  <span className="preview-stat-value">
                    {durationPreview || <span className="preview-empty">—</span>}
                  </span>
                </div>
                <div className="preview-stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span className="preview-stat-label">GPS</span>
                  <span className="preview-stat-value">
                    {hasCoords
                      ? `${parseFloat(formData.lat).toFixed(4)}, ${parseFloat(formData.lng).toFixed(4)}`
                      : <span className="preview-empty">—</span>}
                  </span>
                </div>
              </div>

              {/* JSON payload preview */}
              <div className="preview-payload">
                <div className="payload-header">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                  </svg>
                  POST /api/routes
                </div>
                <pre className="payload-body">{JSON.stringify({
                  origin: formData.origin || '...',
                  destination: formData.destination || '...',
                  distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm) : '...',
                  durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : '...',
                  ...(hasCoords && { location: `{"lat": ${formData.lat}, "lng": ${formData.lng}}` })
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default CreateRoutePage;
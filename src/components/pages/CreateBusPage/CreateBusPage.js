import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import { apiRequest } from '../../../utils/api';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './CreateBusPage.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

const BUS_TYPES = ['AC', 'SLEEPER', 'SEATER'];
const STATUS_OPTIONS = ['Active', 'Standby', 'Maintenance', 'Inactive', 'InService'];

const CreateBusPage = ({ onBack, onSuccess }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [routes, setRoutes] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    routeId: '',
    busNumber: '',
    model: '',
    plate: '',
    totalSeats: '',
    busType: 'AC',
    layoutId: '',
    busStatus: 'Active',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      await Promise.all([fetchRoutes(), fetchLayouts()]);
      setLoadingData(false);
    };
    fetchData();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await apiRequest(`${BASE_URL}/api/routes`, { method: 'GET' });
      const result = await res.json();
      if (res.ok) setRoutes(result.data || result || []);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    }
  };

  const fetchLayouts = async () => {
    try {
      const res = await apiRequest(`${BASE_URL}/api/layouts`, { method: 'GET' });
      const result = await res.json();
      if (res.ok) setLayouts(result.data || result || []);
    } catch (err) {
      console.error('Failed to fetch layouts:', err);
    }
  };

  const selectedRoute = routes.find(r => String(r.id) === String(form.routeId));

  const parseLayout = (raw) => {
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return [];
    }
  };

  const countSeats = (layout) => {
    const rows = parseLayout(layout);
    return rows.reduce((acc, row) => acc + (row.seats?.length || 0), 0);
  };

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.routeId) e.routeId = 'Route is required';
    if (!form.busNumber.trim()) e.busNumber = 'Bus number is required';
    if (!form.plate.trim()) e.plate = 'Plate number is required';
    if (!form.layoutId) e.layoutId = 'Layout is required';
    if (form.totalSeats && isNaN(Number(form.totalSeats))) e.totalSeats = 'Must be a number';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const payload = {
        routeId: Number(form.routeId),
        busNumber: form.busNumber.trim(),
        model: form.model.trim() || undefined,
        plate: form.plate.trim(),
        totalSeats: form.totalSeats ? Number(form.totalSeats) : undefined,
        busType: form.busType,
        layoutId: Number(form.layoutId),
        busStatus: form.busStatus,
      };

      const res = await apiRequest(`${BASE_URL}/api/buses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        onSuccess && onSuccess(result.data || result);
      } else {
        setErrors({ submit: result.message || 'Failed to create bus' });
      }
    } catch (err) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="create-bus-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="create-bus-page">
      <div className="create-bus-topbar">
        <button className="back-link" onClick={onBack}>
          <Icon name="arrowLeft" size={15} />
          {t('buses') || 'Buses'}
        </button>
        <div className="create-bus-breadcrumb">
          <span>{t('buses') || 'Buses'}</span>
          <span className="breadcrumb-sep">/</span>
          <span>{t('addNewBus') || 'Add New Bus'}</span>
        </div>
      </div>

      <div className="create-bus-header">
        <h1>{t('addNewBus') || 'Add New Bus'}</h1>
        <p>{t('addNewBusDesc') || 'Register a bus and assign it to a route'}</p>
      </div>

      <form onSubmit={handleSubmit} className="create-bus-form" noValidate>

        {/* Route */}
        <div className="form-card">
          <div className="form-card-title">{t('routeAssignment') || 'Route Assignment'}</div>
          <div className="field full">
            <label>{t('route') || 'Route'} <span className="req">*</span></label>
            <select
              value={form.routeId}
              onChange={e => set('routeId', e.target.value)}
              className={errors.routeId ? 'input-error' : ''}
            >
              <option value="">{t('selectRoute') || 'Select a route...'}</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.origin} → {r.destination}
                </option>
              ))}
            </select>
            {errors.routeId && <span className="field-error">{errors.routeId}</span>}
          </div>

          {selectedRoute && (
            <div className="route-info-card">
              <div className="route-info-stat">
                <span>{t('origin') || 'Origin'}</span>
                <strong>{selectedRoute.origin}</strong>
              </div>
              <div className="route-info-stat">
                <span>{t('destination') || 'Destination'}</span>
                <strong>{selectedRoute.destination}</strong>
              </div>
              <div className="route-info-stat">
                <span>{t('distance') || 'Distance'}</span>
                <strong>{selectedRoute.distanceKm} km</strong>
              </div>
              <div className="route-info-stat">
                <span>{t('duration') || 'Duration'}</span>
                <strong>{Math.floor(selectedRoute.durationMinutes / 60)}h {selectedRoute.durationMinutes % 60 > 0 ? `${selectedRoute.durationMinutes % 60}m` : ''}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Bus Details */}
        <div className="form-card">
          <div className="form-card-title">{t('busDetails') || 'Bus Details'}</div>
          <div className="field-row">
            <div className="field">
              <label>{t('busNumber') || 'Bus Number'} <span className="req">*</span></label>
              <input
                value={form.busNumber}
                onChange={e => set('busNumber', e.target.value)}
                placeholder="e.g. SR-001"
                className={errors.busNumber ? 'input-error' : ''}
              />
              {errors.busNumber && <span className="field-error">{errors.busNumber}</span>}
            </div>
            <div className="field">
              <label>{t('model') || 'Model'}</label>
              <input
                value={form.model}
                onChange={e => set('model', e.target.value)}
                placeholder="e.g. BYD, Yutong"
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>{t('plateNumber') || 'Plate Number'} <span className="req">*</span></label>
              <input
                value={form.plate}
                onChange={e => set('plate', e.target.value)}
                placeholder="e.g. 1KY-XXXX"
                className={errors.plate ? 'input-error' : ''}
              />
              {errors.plate && <span className="field-error">{errors.plate}</span>}
            </div>
            <div className="field">
              <label>{t('totalSeats') || 'Total Seats'}</label>
              <input
                type="number"
                value={form.totalSeats}
                onChange={e => set('totalSeats', e.target.value)}
                placeholder="e.g. 40"
                min="1"
                className={errors.totalSeats ? 'input-error' : ''}
              />
              {errors.totalSeats && <span className="field-error">{errors.totalSeats}</span>}
            </div>
          </div>
        </div>

        {/* Bus Type */}
        <div className="form-card">
          <div className="form-card-title">{t('busType') || 'Bus Type'}</div>
          <div className="tile-grid three">
            {BUS_TYPES.map(type => (
              <div
                key={type}
                className={`tile${form.busType === type ? ' selected' : ''}`}
                onClick={() => set('busType', type)}
              >
                <div className="tile-name">{type.replace('_', ' ')}</div>
                <div className="tile-desc">
                  {type === 'AC' ? 'Air conditioned'
                    : type === 'SLEEPER' ? 'Reclining beds'
                    : 'Standard seats'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Layout */}
        <div className="form-card">
          <div className="form-card-title">{t('seatLayout') || 'Seat Layout'} <span className="req">*</span></div>
          {errors.layoutId && <span className="field-error" style={{display:'block',marginBottom:8}}>{errors.layoutId}</span>}
          <div className="tile-grid two">
            {layouts.map(layout => {
              const rows = parseLayout(layout.layout);
              const totalSeats = countSeats(layout.layout);
              const allSeats = rows.flatMap(r => r.seats || []);
              return (
                <div
                  key={layout.id}
                  className={`tile layout-tile${String(form.layoutId) === String(layout.id) ? ' selected' : ''}`}
                  onClick={() => set('layoutId', layout.id)}
                >
                  <div className="tile-name">{layout.name}</div>
                  <div className="tile-desc">{totalSeats} seats · {rows.length} rows</div>
                  <div className="seat-preview">
                    {allSeats.slice(0, 20).map((seat, i) => (
                      <div key={i} className="seat-dot" title={seat}>{seat.replace(/[A-Z]/,'')}</div>
                    ))}
                    {allSeats.length > 20 && (
                      <div className="seat-dot seat-dot-more">+{allSeats.length - 20}</div>
                    )}
                  </div>
                </div>
              );
            })}
            {layouts.length === 0 && (
              <p className="no-layouts">{t('noLayouts') || 'No layouts available. Create a layout first.'}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="form-card">
          <div className="form-card-title">{t('status') || 'Status'}</div>
          <div className="status-row">
            {STATUS_OPTIONS.map(s => (
              <div
                key={s}
                className={`status-tile status-tile-${s.toLowerCase()}${form.busStatus === s ? ' selected' : ''}`}
                onClick={() => set('busStatus', s)}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {errors.submit && (
          <div className="submit-error">{errors.submit}</div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onBack} disabled={submitting}>
            {t('cancel') || 'Cancel'}
          </button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? (t('creating') || 'Creating...') : (t('createBus') || 'Create Bus')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBusPage;
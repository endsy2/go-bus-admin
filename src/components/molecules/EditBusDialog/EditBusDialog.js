import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import { apiRequest } from '../../../utils/api';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './EditBusDialog.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

const BUS_TYPES = ['AC', 'SLEEPER', 'SEATER'];
const STATUS_OPTIONS = ['Active', 'Standby', 'Maintenance', 'Inactive', 'InService'];

const EditBusDialog = ({ isOpen, bus, onSave, onCancel }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [routes, setRoutes] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
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
    if (isOpen && bus) {
      // Set form with bus data
      setForm({
        routeId: bus.routeId || '',
        busNumber: bus.busNumber || '',
        model: bus.model || '',
        plate: bus.plate || '',
        totalSeats: bus.totalSeats || '',
        busType: bus.busType || 'AC',
        layoutId: bus.layoutId || '',
        busStatus: bus.status || bus.busStatus || 'Active',
      });
      
      // Fetch routes and layouts
      fetchData();
    }
  }, [isOpen, bus]);

  const fetchData = async () => {
    setLoadingData(true);
    await Promise.all([fetchRoutes(), fetchLayouts()]);
    setLoadingData(false);
  };

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

      const res = await apiRequest(`${BASE_URL}/api/buses/${bus.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        onSave && onSave(result.data || result);
      } else {
        setErrors({ submit: result.message || 'Failed to update bus' });
      }
    } catch (err) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onCancel();
  };

  if (!isOpen) return null;

  const selectedRoute = routes.find(r => String(r.id) === String(form.routeId));

  return (
    <div className="edit-bus-dialog-overlay">
      <div className="edit-bus-dialog">
        <div className="dialog-header">
          <h2>{t('editBus') || 'Edit Bus'}</h2>
          <button className="close-btn" onClick={handleCancel}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="dialog-body">
          {loadingData ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <span>{t('loading')}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="edit-bus-form" noValidate>
              {/* Route */}
              <div className="form-section">
                <h3>{t('routeAssignment') || 'Route Assignment'}</h3>
                <div className="field">
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
                  <div className="route-info">
                    <span>{selectedRoute.origin} → {selectedRoute.destination}</span>
                    <span>{selectedRoute.distanceKm} km</span>
                  </div>
                )}
              </div>

              {/* Bus Details */}
              <div className="form-section">
                <h3>{t('busDetails') || 'Bus Details'}</h3>
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
              <div className="form-section">
                <h3>{t('busType') || 'Bus Type'}</h3>
                <div className="type-grid">
                  {BUS_TYPES.map(type => (
                    <div
                      key={type}
                      className={`type-tile${form.busType === type ? ' selected' : ''}`}
                      onClick={() => set('busType', type)}
                    >
                      {type.replace('_', ' ')}
                    </div>
                  ))}
                </div>
              </div>

              {/* Layout */}
              <div className="form-section">
                <h3>{t('seatLayout') || 'Seat Layout'} <span className="req">*</span></h3>
                {errors.layoutId && <span className="field-error" style={{display:'block',marginBottom:8}}>{errors.layoutId}</span>}
                <div className="field">
                  <label>{t('layout') || 'Layout'}</label>
                  <select
                    value={form.layoutId}
                    onChange={e => set('layoutId', e.target.value)}
                    className={errors.layoutId ? 'input-error' : ''}
                  >
                    <option value="">{t('selectLayout') || 'Select a layout...'}</option>
                    {layouts.map(layout => (
                      <option key={layout.id} value={layout.id}>
                        {layout.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="form-section">
                <h3>{t('status') || 'Status'}</h3>
                <div className="status-grid">
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
            </form>
          )}
        </div>

        <div className="dialog-footer">
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={submitting}>
            {t('cancel') || 'Cancel'}
          </Button>
          <Button type="submit" variant="primary" onClick={handleSubmit} disabled={submitting || loadingData}>
            {submitting ? (t('updating') || 'Updating...') : (t('updateBus') || 'Update Bus')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditBusDialog;
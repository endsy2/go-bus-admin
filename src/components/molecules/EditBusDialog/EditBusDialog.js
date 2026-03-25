import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Loader2, X } from 'lucide-react';
import { apiRequest } from '../../../utils/api';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import { cn } from '../../../lib/utils';

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

  const fetchRoutes = useCallback(async () => {
    try {
      const res = await apiRequest(`${BASE_URL}/api/routes`, { method: 'GET' });
      const result = await res.json();
      if (res.ok) setRoutes(result.data || result || []);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    }
  }, []);

  const fetchLayouts = useCallback(async () => {
    try {
      const res = await apiRequest(`${BASE_URL}/api/layouts`, { method: 'GET' });
      const result = await res.json();
      if (res.ok) setLayouts(result.data || result || []);
    } catch (err) {
      console.error('Failed to fetch layouts:', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    await Promise.all([fetchRoutes(), fetchLayouts()]);
    setLoadingData(false);
  }, [fetchRoutes, fetchLayouts]);

  useEffect(() => {
    if (isOpen && bus) {
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
      fetchData();
    }
  }, [isOpen, bus, fetchData]);

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

  const selectedRoute = routes.find(r => String(r.id) === String(form.routeId));

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editBus') || 'Edit Bus'}</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('loading')}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold pb-2 border-b">{t('routeAssignment') || 'Route Assignment'}</h3>
              <div className="space-y-2">
                <Label>{t('route') || 'Route'} <span className="text-destructive">*</span></Label>
                <Select value={String(form.routeId)} onValueChange={(val) => set('routeId', val)}>
                  <SelectTrigger className={errors.routeId ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('selectRoute') || 'Select a route...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map(r => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.origin} → {r.destination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.routeId && <p className="text-sm text-destructive">{errors.routeId}</p>}
              </div>
              {selectedRoute && (
                <div className="flex items-center gap-3 p-2 bg-muted rounded-md text-xs text-muted-foreground">
                  <span>{selectedRoute.origin} → {selectedRoute.destination}</span>
                  <span>{selectedRoute.distanceKm} km</span>
                </div>
              )}
            </div>

            {/* Bus Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold pb-2 border-b">{t('busDetails') || 'Bus Details'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('busNumber') || 'Bus Number'} <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.busNumber}
                    onChange={(e) => set('busNumber', e.target.value)}
                    placeholder="e.g. SR-001"
                    className={errors.busNumber ? 'border-destructive' : ''}
                  />
                  {errors.busNumber && <p className="text-sm text-destructive">{errors.busNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{t('model') || 'Model'}</Label>
                  <Input
                    value={form.model}
                    onChange={(e) => set('model', e.target.value)}
                    placeholder="e.g. BYD, Yutong"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('plateNumber') || 'Plate Number'} <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.plate}
                    onChange={(e) => set('plate', e.target.value)}
                    placeholder="e.g. 1KY-XXXX"
                    className={errors.plate ? 'border-destructive' : ''}
                  />
                  {errors.plate && <p className="text-sm text-destructive">{errors.plate}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{t('totalSeats') || 'Total Seats'}</Label>
                  <Input
                    type="number"
                    value={form.totalSeats}
                    onChange={(e) => set('totalSeats', e.target.value)}
                    placeholder="e.g. 40"
                    min="1"
                    className={errors.totalSeats ? 'border-destructive' : ''}
                  />
                  {errors.totalSeats && <p className="text-sm text-destructive">{errors.totalSeats}</p>}
                </div>
              </div>
            </div>

            {/* Bus Type */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold pb-2 border-b">{t('busType') || 'Bus Type'}</h3>
              <div className="grid grid-cols-3 gap-2">
                {BUS_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    className={cn(
                      "p-3 border rounded-lg text-xs font-medium text-center cursor-pointer transition-all",
                      form.busType === type 
                        ? "border-2 border-primary bg-primary/10 text-primary" 
                        : "border-border bg-background text-muted-foreground hover:bg-accent hover:border-primary"
                    )}
                    onClick={() => set('busType', type)}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold pb-2 border-b">{t('seatLayout') || 'Seat Layout'} <span className="text-destructive">*</span></h3>
              {errors.layoutId && <p className="text-sm text-destructive mb-2">{errors.layoutId}</p>}
              <div className="space-y-2">
                <Label>{t('layout') || 'Layout'}</Label>
                <Select value={String(form.layoutId)} onValueChange={(val) => set('layoutId', val)}>
                  <SelectTrigger className={errors.layoutId ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('selectLayout') || 'Select a layout...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {layouts.map(layout => (
                      <SelectItem key={layout.id} value={String(layout.id)}>
                        {layout.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold pb-2 border-b">{t('status') || 'Status'}</h3>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={cn(
                      "p-3 border rounded-lg text-xs font-medium text-center cursor-pointer transition-all",
                      form.busStatus === s 
                        ? "border-2 border-primary bg-primary/10 text-primary" 
                        : "border-border bg-background text-muted-foreground hover:bg-accent hover:border-primary"
                    )}
                    onClick={() => set('busStatus', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                {errors.submit}
              </div>
            )}
          </form>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
            {t('cancel') || 'Cancel'}
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={submitting || loadingData}>
            {submitting ? (t('updating') || 'Updating...') : (t('updateBus') || 'Update Bus')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBusDialog;

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from 'shared/components/ui/dialog';
import { Button } from 'shared/components/ui/button';
import { Label } from 'shared/components/ui/label';
import { DateTimePicker } from 'shared/components/ui/datetime-picker';
import scheduleService from '../../services/scheduleService';

const normalizeTime = (value) => {
  if (!value) return '';

  if (value.includes('T')) {
    return value.split('T')[1].slice(0, 5);
  }

  return value.slice(0, 5);
};

const normalizeDateTimeForPicker = (dateTime, date, time) => {
  if (dateTime) {
    return dateTime.slice(0, 16);
  }

  if (date && time) {
    const datePart = date.split('T')[0];
    const timePart = normalizeTime(time);
    return `${datePart}T${timePart}`;
  }

  return '';
};

const toIsoWithSeconds = (value) => {
  if (!value) return '';
  if (value.length === 16) return `${value}:00`;
  return value;
};

const buildInitialFormData = (schedule) => ({
  busId: schedule?.busId || schedule?.bus?.id || '',
  departureDateTime: normalizeDateTimeForPicker(
    schedule?.departureDateTime,
    schedule?.departureDate,
    schedule?.departureTime
  ),
  arrivalDateTime: normalizeDateTimeForPicker(
    schedule?.arrivalDateTime,
    schedule?.departureDate,
    schedule?.arrivalTime
  ),
  price: schedule?.price || '',
});

const EditScheduleDialog = ({ open, schedule, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(() => buildInitialFormData(schedule));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(buildInitialFormData(schedule));
  }, [schedule]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const departureDateTime = formData.departureDateTime || normalizeDateTimeForPicker(
      schedule?.departureDateTime,
      schedule?.departureDate,
      schedule?.departureTime
    );

    const arrivalDateTime = formData.arrivalDateTime || normalizeDateTimeForPicker(
      schedule?.arrivalDateTime,
      schedule?.departureDate,
      schedule?.arrivalTime
    );

    const payload = {
      busId: formData.busId || schedule?.busId || schedule?.bus?.id,
      price: parseFloat(formData.price),
      departureDate: toIsoWithSeconds(departureDateTime),
      departureTime: normalizeTime(departureDateTime),
      arrivalTime: normalizeTime(arrivalDateTime),
    };

    if (!payload.busId || !payload.departureDate || !payload.departureTime || !payload.arrivalTime || Number.isNaN(payload.price)) {
      alert('Please provide departure date/time, arrival time, and a valid price.');
      return;
    }

    try {
      setLoading(true);
      await scheduleService.updateSchedule(schedule.id, payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update schedule:', error);
      alert('Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Route</Label>
              <div className="mt-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100">
                {schedule?.route?.origin && schedule?.route?.destination
                  ? `${schedule.route.origin} -> ${schedule.route.destination}`
                  : 'Route not assigned'}
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Departure Time</Label>
              <DateTimePicker
                value={formData.departureDateTime}
                onChange={(value) => setFormData({ ...formData, departureDateTime: value })}
                placeholder="Select departure date and time"
              />
            </div>
            <div>
              <Label className="text-slate-300">Arrival Time</Label>
              <DateTimePicker
                value={formData.arrivalDateTime}
                onChange={(value) => setFormData({ ...formData, arrivalDateTime: value })}
                placeholder="Select arrival date and time"
              />
            </div>
            <div>
              <Label className="text-slate-300">Price ($)</Label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="0.00"
                  className="w-full px-3 py-2 pl-10 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditScheduleDialog;

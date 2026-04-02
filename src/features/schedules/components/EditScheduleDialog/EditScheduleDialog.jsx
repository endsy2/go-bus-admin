import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from 'shared/components/ui/dialog';
import { Button } from 'shared/components/ui/button';
import { Input } from 'shared/components/ui/input';
import { Label } from 'shared/components/ui/label';
import { DateTimePicker } from 'shared/components/ui/datetime-picker';
import scheduleService from '../../services/scheduleService';

const EditScheduleDialog = ({ open, schedule, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    departureTime: schedule.departureTime?.split('.')[0] || '',
    arrivalTime: schedule.arrivalTime?.split('.')[0] || '',
    price: schedule.price || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await scheduleService.updateSchedule(schedule.id, {
        ...formData,
        price: parseFloat(formData.price),
      });
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
              <Label className="text-slate-300">Departure Time</Label>
              <DateTimePicker
                value={formData.departureTime}
                onChange={(value) => setFormData({ ...formData, departureTime: value })}
                placeholder="Select departure date and time"
              />
            </div>
            <div>
              <Label className="text-slate-300">Arrival Time</Label>
              <DateTimePicker
                value={formData.arrivalTime}
                onChange={(value) => setFormData({ ...formData, arrivalTime: value })}
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

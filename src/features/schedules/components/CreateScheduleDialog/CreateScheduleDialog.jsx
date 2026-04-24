import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from 'shared/components/ui/dialog';
import { Button } from 'shared/components/ui/button';
import { Label } from 'shared/components/ui/label';
import { DateTimePicker } from 'shared/components/ui/datetime-picker';
import { Calendar, Bus, Clock, DollarSign, Loader2 } from 'lucide-react';
import scheduleService from '../../services/scheduleService';
import busService from '../../../buses/services/busService';

const CreateScheduleDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    busId: '',
    departureDateTime: '',
    arrivalDateTime: '',
    price: '',
  });
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (open) {
      fetchBuses();
    }
  }, [open]);

  const fetchBuses = async () => {
    setLoadingData(true);
    try {
      const busesRes = await busService.getBuses({ pageSize: 1000 });
      const busesData = busesRes.data?.content || busesRes.data || busesRes;
      setBuses(Array.isArray(busesData) ? busesData : []);
    } catch (error) {
      console.error('Failed to fetch buses:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await scheduleService.createSchedule({
        busId: parseInt(formData.busId),
        price: parseFloat(formData.price),
        departureDateTime: formData.departureDateTime,
        arrivalDateTime: formData.arrivalDateTime,
      });
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        busId: '',
        departureDateTime: '',
        arrivalDateTime: '',
        price: '',
      });
    } catch (error) {
      console.error('Failed to create schedule:', error);
      alert(error.response?.data?.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-slate-900/95 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <DialogHeader className="border-b border-slate-700/50 pb-4">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Create Schedule
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* Bus Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Bus className="w-4 h-4 text-blue-400" />
                Bus
              </Label>
              <div className="relative">
                <select
                  value={formData.busId}
                  onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                  required
                  disabled={loadingData}
                  className="w-full px-4 py-3 border border-slate-700/50 rounded-xl bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-slate-800">
                    {loadingData ? 'Loading buses...' : 'Select a bus'}
                  </option>
                  {buses
                    .filter(bus => (bus.status || bus.busStatus) === 'Active' || (bus.status || bus.busStatus) === 'Standby')
                    .map(bus => (
                      <option key={bus.id} value={bus.id} className="bg-slate-800">
                        {bus.busNumber} | {bus.busType} | {bus.totalSeats} seats
                        {bus.route ? ` | ${bus.route.origin} → ${bus.route.destination}` : ''}
                        {bus.plate ? ` | ${bus.plate}` : ''}
                        {` | ${bus.status || bus.busStatus}`}
                      </option>
                    ))}
                  {buses.filter(bus => (bus.status || bus.busStatus) !== 'Active' && (bus.status || bus.busStatus) !== 'Standby').length > 0 && (
                    <optgroup label="─── Unavailable Buses ───" className="bg-slate-800">
                      {buses
                        .filter(bus => (bus.status || bus.busStatus) !== 'Active' && (bus.status || bus.busStatus) !== 'Standby')
                        .map(bus => (
                          <option key={bus.id} value={bus.id} disabled className="bg-slate-800 text-slate-500">
                            {bus.busNumber} | {bus.busType} | {bus.totalSeats} seats
                            {bus.route ? ` | ${bus.route.origin} → ${bus.route.destination}` : ''}
                            {` | ${bus.status || bus.busStatus}`}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Only Active and Standby buses are available for scheduling
              </p>
            </div>

            {/* Departure DateTime */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                Departure Date & Time
              </Label>
              <DateTimePicker
                value={formData.departureDateTime}
                onChange={(value) => setFormData({ ...formData, departureDateTime: value })}
                placeholder="Select departure date and time"
              />
            </div>

            {/* Arrival Time */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                Arrival Date & Time
              </Label>
              <DateTimePicker
                value={formData.arrivalDateTime}
                onChange={(value) => setFormData({ ...formData, arrivalDateTime: value })}
                placeholder="Select arrival date and time"
              />
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Price ($)
              </Label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-3 pl-11 border border-slate-700/50 rounded-xl bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-slate-500 transition-all duration-200"
                />
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-3 pt-4 border-t border-slate-700/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50 text-white rounded-xl transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || loadingData}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateScheduleDialog;

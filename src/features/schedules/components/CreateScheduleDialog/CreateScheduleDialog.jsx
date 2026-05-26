import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from 'shared/components/ui/dialog';
import { Button } from 'shared/components/ui/button';
import { Label } from 'shared/components/ui/label';
import { Input } from 'shared/components/common/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shared/components/ui/select';
import { DateTimePicker } from 'shared/components/ui/datetime-picker';
import { useToast } from 'shared/components/ui/toast';
import { Calendar, Bus, Clock, DollarSign, Loader2 } from 'lucide-react';
import scheduleService from '../../services/scheduleService';
import busService from '../../../buses/services/busService';

const CreateScheduleDialog = ({ open, onClose, onSuccess }) => {
  const { addToast } = useToast();
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
    if (!formData.busId || !formData.departureDateTime || !formData.arrivalDateTime || !formData.price) {
      addToast({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }
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
      setFormData({ busId: '', departureDateTime: '', arrivalDateTime: '', price: '' });
    } catch (error) {
      addToast({ message: error.response?.data?.message || 'Failed to create schedule', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const availableBuses = buses.filter(
    bus => (bus.status || bus.busStatus) === 'Active' || (bus.status || bus.busStatus) === 'Standby'
  );
  const unavailableBuses = buses.filter(
    bus => (bus.status || bus.busStatus) !== 'Active' && (bus.status || bus.busStatus) !== 'Standby'
  );

  const getBusLabel = (bus) =>
    [
      bus.busNumber,
      bus.busType,
      bus.totalSeats ? `${bus.totalSeats} seats` : null,
      bus.route ? `${bus.route.origin} → ${bus.route.destination}` : null,
      bus.plate,
      bus.status || bus.busStatus,
    ]
      .filter(Boolean)
      .join(' | ');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Create Schedule
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* Bus Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-blue-400" />
                Bus
              </Label>
              <Select
                value={formData.busId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, busId: value }))}
                disabled={loadingData}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingData ? 'Loading buses...' : 'Select a bus'} />
                </SelectTrigger>
                <SelectContent>
                  {availableBuses.map(bus => (
                    <SelectItem key={bus.id} value={String(bus.id)}>
                      {getBusLabel(bus)}
                    </SelectItem>
                  ))}
                  {unavailableBuses.length > 0 && availableBuses.length > 0 && (
                    <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">
                      ─── Unavailable Buses ───
                    </div>
                  )}
                  {unavailableBuses.map(bus => (
                    <SelectItem key={bus.id} value={String(bus.id)} disabled>
                      {getBusLabel(bus)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only Active and Standby buses are available for scheduling
              </p>
            </div>

            {/* Departure DateTime */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                Departure Date &amp; Time
              </Label>
              <DateTimePicker
                value={formData.departureDateTime}
                onChange={(value) => setFormData(prev => ({ ...prev, departureDateTime: value }))}
                placeholder="Select departure date and time"
              />
            </div>

            {/* Arrival DateTime */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                Arrival Date &amp; Time
              </Label>
              <DateTimePicker
                value={formData.arrivalDateTime}
                onChange={(value) => setFormData(prev => ({ ...prev, arrivalDateTime: value }))}
                placeholder="Select arrival date and time"
              />
            </div>

            {/* Price */}
            <Input
              label={
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Price ($)
                </span>
              }
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required
              placeholder="0.00"
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingData}
              className="flex items-center gap-2"
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

import React, { useState } from 'react';
import { Card } from 'shared/components/ui/card';
import { Button } from 'shared/components/ui/button';
import { Label } from 'shared/components/ui/label';
import { DateTimePicker } from 'shared/components/ui/datetime-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared/components/ui/table';
import { Calendar, Bus, DollarSign, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import scheduleService from '../../services/scheduleService';
import busService from '../../../buses/services/busService';
import CreateScheduleDialog from '../../components/CreateScheduleDialog/CreateScheduleDialog';
import EditScheduleDialog from '../../components/EditScheduleDialog/EditScheduleDialog';

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [filters, setFilters] = useState({
    busId: '',
    fromDate: '',
    toDate: '',
    maxPrice: '',
  });
  const [pagination, setPagination] = useState({
    pageNo: 1,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
  });

  // Fetch buses on component mount and load initial schedules
  React.useEffect(() => {
    fetchBuses();
    fetchSchedules(1); // Load all schedules initially
  }, []);

  const fetchBuses = async () => {
    setLoadingBuses(true);
    try {
      const busesRes = await busService.getBuses({ pageSize: 1000 });
      const busesData = busesRes.data?.content || busesRes.data || busesRes;
      setBuses(Array.isArray(busesData) ? busesData : []);
    } catch (error) {
      console.error('Failed to fetch buses:', error);
    } finally {
      setLoadingBuses(false);
    }
  };

  const fetchSchedules = async (pageNo = 1) => {
    try {
      setLoading(true);
      const response = await scheduleService.filterSchedules(
        filters.busId || null,
        filters.fromDate || null,
        filters.toDate || null,
        filters.maxPrice || null,
        pageNo,
        pagination.pageSize
      );
      
      const scheduleData = response.data?.content || response.content || [];
      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
      
      setPagination({
        pageNo: response.data?.number + 1 || pageNo,
        pageSize: response.data?.size || pagination.pageSize,
        totalPages: response.data?.totalPages || 0,
        totalElements: response.data?.totalElements || 0,
      });
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await scheduleService.deleteSchedule(id);
        fetchSchedules(pagination.pageNo);
      } catch (error) {
        console.error('Failed to delete schedule:', error);
        alert('Failed to delete schedule');
      }
    }
  };

  const handlePageChange = (newPage) => {
    fetchSchedules(newPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-400" />
            Schedules Management
          </h1>
          <p className="text-slate-400 mt-1">Manage bus schedules and timetables</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Create Schedule
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="p-6 mb-6 bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-400" />
          Filter Schedules (Optional)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Bus Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Bus className="w-4 h-4 text-blue-400" />
              Bus
            </Label>
            <div className="relative">
              <select
                value={filters.busId}
                onChange={(e) => setFilters({ ...filters, busId: e.target.value })}
                disabled={loadingBuses}
                className="w-full px-4 py-2.5 border border-slate-700/50 rounded-xl bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
              >
                <option value="">All Buses</option>
                {buses.map(bus => (
                  <option key={bus.id} value={bus.id}>
                    {bus.busNumber} | {bus.busType}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* From Date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300">From Date</Label>
            <DateTimePicker
              value={filters.fromDate}
              onChange={(value) => setFilters({ ...filters, fromDate: value })}
              placeholder="Select from date"
            />
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300">To Date</Label>
            <DateTimePicker
              value={filters.toDate}
              onChange={(value) => setFilters({ ...filters, toDate: value })}
              placeholder="Select to date"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Max Price
            </Label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="Any price"
              className="w-full px-4 py-2.5 border border-slate-700/50 rounded-xl bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-500"
            />
          </div>

          {/* Search Button */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300 opacity-0">Search</Label>
            <Button 
              onClick={() => fetchSchedules(1)}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2 h-[42px]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Card */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700/50 hover:bg-slate-800/50">
                <TableHead className="text-slate-300 font-semibold">ID</TableHead>
                <TableHead className="text-slate-300 font-semibold">Bus Number</TableHead>
                <TableHead className="text-slate-300 font-semibold">Departure</TableHead>
                <TableHead className="text-slate-300 font-semibold">Arrival</TableHead>
                <TableHead className="text-slate-300 font-semibold">Price</TableHead>
                <TableHead className="text-slate-300 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading schedules...
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    No schedules found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id} className="border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <TableCell className="text-white font-medium">#{schedule.id}</TableCell>
                    <TableCell className="text-slate-300">{schedule.busNumber || 'N/A'}</TableCell>
                    <TableCell className="text-slate-300">
                      {schedule.departureDateTime ? new Date(schedule.departureDateTime).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {schedule.arrivalDateTime ? new Date(schedule.arrivalDateTime).toLocaleString() : schedule.arrivalTime || 'N/A'}
                    </TableCell>
                    <TableCell className="text-emerald-400 font-semibold">${schedule.price?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          onClick={() => setEditingSchedule(schedule)}
                          className="bg-slate-700 hover:bg-slate-600 text-white"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(schedule.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {schedules.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
            <div className="text-sm text-slate-400">
              Showing {((pagination.pageNo - 1) * pagination.pageSize) + 1} to {Math.min(pagination.pageNo * pagination.pageSize, pagination.totalElements)} of {pagination.totalElements} results
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handlePageChange(pagination.pageNo - 1)}
                disabled={pagination.pageNo === 1}
                className="bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    size="sm"
                    onClick={() => handlePageChange(i + 1)}
                    className={i + 1 === pagination.pageNo 
                      ? "bg-blue-500 text-white" 
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                onClick={() => handlePageChange(pagination.pageNo + 1)}
                disabled={pagination.pageNo === pagination.totalPages}
                className="bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateScheduleDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchSchedules(pagination.pageNo);
          }}
        />
      )}

      {editingSchedule && (
        <EditScheduleDialog
          open={!!editingSchedule}
          schedule={editingSchedule}
          onClose={() => setEditingSchedule(null)}
          onSuccess={() => {
            setEditingSchedule(null);
            fetchSchedules(pagination.pageNo);
          }}
        />
      )}
    </div>
  );
};

export default SchedulesPage;

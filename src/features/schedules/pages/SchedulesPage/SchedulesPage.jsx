import React, { useState } from 'react';
import { Card } from 'shared/components/ui/card';
import { Button } from 'shared/components/ui/button';
import { Label } from 'shared/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'shared/components/ui/dialog';
import { DatePicker } from 'shared/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared/components/ui/table';
import { Pagination } from 'shared/components/feedback/Pagination';
import { Calendar, Bus, DollarSign, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import scheduleService from '../../services/scheduleService';
import busService from '../../../buses/services/busService';
import routeService from '../../../routes/services/routeService';
import CreateScheduleDialog from '../../components/CreateScheduleDialog/CreateScheduleDialog';
import EditScheduleDialog from '../../components/EditScheduleDialog/EditScheduleDialog';

const SchedulesPage = () => {
  const getTodayStartISO = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    return today.toISOString();
  };

  const initialFilters = {
    routeId: '',
    busId: '',
    fromDate: getTodayStartISO(), // Auto-set to today at midnight
    toDate: '',
    maxPrice: '',
  };

  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deleteScheduleId, setDeleteScheduleId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    pageNo: 1,
    pageSize: 15,
    totalPages: 0,
    totalElements: 0,
  });

  // Fetch buses on component mount and load initial schedules
  React.useEffect(() => {
    fetchBuses();
    fetchRoutes();
    fetchSchedules(1); // Load all schedules initially
  }, []);

  // Auto-search when filters change
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSchedules(1);
    }, 500); // Debounce by 500ms to avoid too many API calls

    return () => clearTimeout(timeoutId);
  }, [filters.routeId, filters.busId, filters.fromDate, filters.toDate, filters.maxPrice]);

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

  const fetchRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const routesRes = await routeService.getRoutes();
      const routesData = routesRes?.data || routesRes;
      const routesArray = Array.isArray(routesData)
        ? routesData
        : Array.isArray(routesData?.data)
          ? routesData.data
          : [];
      setRoutes(routesArray);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
      setRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const fetchSchedules = async (pageNo = 1, overrideFilters = null, overridePageSize = null) => {
    const activeFilters = overrideFilters || filters;
    const activePageSize = overridePageSize || pagination.pageSize;

    try {
      setLoading(true);
      const response = await scheduleService.filterSchedules(
        activeFilters.routeId || null,
        activeFilters.fromDate || null,
        activeFilters.toDate || null,
        activeFilters.maxPrice || null,
        pageNo,
        activePageSize
      );

      const scheduleData = response.data?.content || response.content || [];
      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);

      setPagination({
        pageNo: response.data?.number + 1 || pageNo,
        pageSize: response.data?.size || activePageSize,
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

  const handleDelete = (id) => {
    setDeleteScheduleId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteScheduleId) return;

    try {
      setDeleting(true);
      await scheduleService.deleteSchedule(deleteScheduleId);
      setDeleteScheduleId(null);
      fetchSchedules(pagination.pageNo);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      alert('Failed to delete schedule');
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchSchedules(newPage + 1);
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({
      ...prev,
      pageNo: 1,
      pageSize: newSize,
    }));
    fetchSchedules(1, null, newSize);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    fetchSchedules(1, initialFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            Schedules Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage bus schedules and timetables</p>
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
      <Card className="p-6 mb-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-slate-700/50 shadow-xl dark:shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Filter Schedules
        </h2>
        <div className="flex flex-wrap items-end gap-4">

          {/* Route Filter */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Route</Label>
            <div className="relative">
              <select
                value={filters.routeId}
                onChange={(e) => setFilters({ ...filters, routeId: e.target.value })}
                disabled={loadingRoutes}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700/50 rounded-xl bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
              >
                <option value="">All Routes</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.origin} -&gt; {route.destination}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Bus Filter */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bus</Label>
            <div className="relative">
              <select
                value={filters.busId}
                onChange={(e) => setFilters({ ...filters, busId: e.target.value })}
                disabled={loadingBuses}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700/50 rounded-xl bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
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
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">From Date</Label>
            <DatePicker
              value={filters.fromDate}
              onChange={(value) => setFilters({ ...filters, fromDate: value })}
              placeholder="Select from date"
              className="h-[42px] rounded-xl"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">To Date</Label>
            <DatePicker
              value={filters.toDate}
              onChange={(value) => setFilters({ ...filters, toDate: value })}
              placeholder="Select to date"
              className="h-[42px] rounded-xl"
            />
          </div>

          {/* Max Price */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Max Price</Label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="Any price"
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700/50 rounded-xl bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Clear Button — no label, aligned to bottom via items-end on parent */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              disabled={loading}
              className="h-[42px] px-5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Clear
            </Button>
          </div>

        </div>
      </Card>

      {/* Results Card */}
      <Card className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-slate-700/50 shadow-xl dark:shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">ID</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Bus Number</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Route</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Departure</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Arrival</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Price</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-600 dark:text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading schedules...
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-600 dark:text-slate-400">
                    No schedules found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id} className="border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <TableCell className="text-slate-900 dark:text-white font-medium">#{schedule.id}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">{schedule.busNumber || 'N/A'}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {schedule.route?.origin && schedule.route?.destination
                        ? `${schedule.route.origin} -> ${schedule.route.destination}`
                        : 'Route not assigned'}
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {schedule.departureDateTime ? new Date(schedule.departureDateTime).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {schedule.arrivalDateTime ? new Date(schedule.arrivalDateTime).toLocaleString() : schedule.arrivalTime || 'N/A'}
                    </TableCell>
                    <TableCell className="text-emerald-600 dark:text-emerald-400 font-semibold">${schedule.price?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={() => setEditingSchedule(schedule)}
                          className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(schedule.id)}
                          className="bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/50"
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
          <Pagination
            currentPage={pagination.pageNo - 1}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalElements={pagination.totalElements}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
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

      <Dialog
        open={deleteScheduleId !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteScheduleId(null);
          }
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Schedule</DialogTitle>
            <DialogDescription className="text-slate-300">
              Are you sure you want to delete schedule #{deleteScheduleId}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteScheduleId(null)}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Confirm Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchedulesPage;

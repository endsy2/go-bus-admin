import React, { useState, useRef } from 'react';
import { Card } from 'shared/components/ui/card';
import { Button } from 'shared/components/ui/button';
import { Label } from 'shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shared/components/ui/select';
import { Input } from 'shared/components/common/Input';
import { ConfirmDialog } from 'shared/components/feedback/ConfirmDialog';
import { DatePicker } from 'shared/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared/components/ui/table';
import { Pagination } from 'shared/components/feedback/Pagination';
import { useToast } from 'shared/components/ui/toast';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import scheduleService from '../../services/scheduleService';
import busService from '../../../buses/services/busService';
import routeService from '../../../routes/services/routeService';
import CreateScheduleDialog from '../../components/CreateScheduleDialog/CreateScheduleDialog';
import EditScheduleDialog from '../../components/EditScheduleDialog/EditScheduleDialog';

const SchedulesPage = () => {
  const { addToast } = useToast();
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
  const isInitialMount = useRef(true);
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

  // Auto-search when filters change (skip on initial mount — mount effect already fetches)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchSchedules(1);
    }, 500);

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
      addToast({ message: error.response?.data?.message || 'Failed to delete schedule', type: 'error' });
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
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
            Schedules Management
          </h1>
          <p className="text-sm text-muted-foreground">Manage bus schedules and timetables</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus className="w-4 h-4" />
          Create Schedule
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3 sm:mb-4">
          Filter Schedules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-end gap-3 sm:gap-4">

          {/* Route Filter */}
          <div className="flex flex-col gap-1.5 w-full lg:flex-1 lg:min-w-[140px]">
            <Label>Route</Label>
            <Select
              value={filters.routeId || '__all__'}
              onValueChange={(value) => setFilters({ ...filters, routeId: value === '__all__' ? '' : value })}
              disabled={loadingRoutes}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Routes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Routes</SelectItem>
                {routes.map(route => (
                  <SelectItem key={route.id} value={String(route.id)}>
                    {route.origin} → {route.destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bus Filter */}
          <div className="flex flex-col gap-1.5 w-full lg:flex-1 lg:min-w-[140px]">
            <Label>Bus</Label>
            <Select
              value={filters.busId || '__all__'}
              onValueChange={(value) => setFilters({ ...filters, busId: value === '__all__' ? '' : value })}
              disabled={loadingBuses}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Buses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Buses</SelectItem>
                {buses.map(bus => (
                  <SelectItem key={bus.id} value={String(bus.id)}>
                    {bus.busNumber} | {bus.busType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* From Date */}
          <div className="flex flex-col gap-1.5 w-full lg:flex-1 lg:min-w-[140px]">
            <Label>From Date</Label>
            <DatePicker
              value={filters.fromDate}
              onChange={(value) => setFilters({ ...filters, fromDate: value })}
              placeholder="Select from date"
              className="h-[42px] rounded-xl"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1.5 w-full lg:flex-1 lg:min-w-[140px]">
            <Label>To Date</Label>
            <DatePicker
              value={filters.toDate}
              onChange={(value) => setFilters({ ...filters, toDate: value })}
              placeholder="Select to date"
              className="h-[42px] rounded-xl"
            />
          </div>

          {/* Max Price */}
          <div className="flex flex-col gap-1.5 w-full lg:flex-1 lg:min-w-[120px]">
            <Input
              label="Max Price"
              name="maxPrice"
              type="number"
              step="0.01"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="Any price"
            />
          </div>

          {/* Clear Button — no label, aligned to bottom via items-end on parent */}
          <div className="flex items-center gap-2 shrink-0 sm:col-span-2 lg:col-span-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              disabled={loading}
            >
              Clear
            </Button>
          </div>

        </div>
      </Card>

      {/* Results Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="font-medium">ID</TableHead>
                <TableHead className="font-medium">Bus Number</TableHead>
                <TableHead className="font-medium">Route</TableHead>
                <TableHead className="font-medium">Departure</TableHead>
                <TableHead className="font-medium">Arrival</TableHead>
                <TableHead className="font-medium">Price</TableHead>
                <TableHead className="font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading schedules...
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No schedules found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">#{schedule.id}</TableCell>
                    <TableCell>{schedule.busNumber || 'N/A'}</TableCell>
                    <TableCell>
                      {schedule.route?.origin && schedule.route?.destination
                        ? `${schedule.route.origin} → ${schedule.route.destination}`
                        : 'Route not assigned'}
                    </TableCell>
                    <TableCell>
                      {schedule.departureDateTime ? new Date(schedule.departureDateTime).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {schedule.arrivalDateTime ? new Date(schedule.arrivalDateTime).toLocaleString() : schedule.arrivalTime || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">${schedule.price?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSchedule(schedule)}
                          title="Edit"
                        >
                          <Edit className="w-3 h-3 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(schedule.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 sm:mr-1" />
                          <span className="hidden sm:inline">Delete</span>
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

      <ConfirmDialog
        isOpen={deleteScheduleId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => { if (!deleting) setDeleteScheduleId(null); }}
        title="Delete Schedule"
        message={`Are you sure you want to delete schedule #${deleteScheduleId}?`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default SchedulesPage;

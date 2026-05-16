import axiosInstance from 'services/axiosConfig';

const scheduleService = {
  // Get all schedules with pagination
  getSchedules: async (pageNo = 1, pageSize = 10) => {
    const response = await axiosInstance.get('/schedules', {
      params: { pageNo, pageSize }
    });
    return response.data;
  },

  // Get schedule by ID
  getScheduleById: async (id) => {
    const response = await axiosInstance.get(`/schedules/${id}`);
    return response.data;
  },

  // Create new schedule
  createSchedule: async (scheduleData) => {
    const response = await axiosInstance.post('/schedules', scheduleData);
    return response.data;
  },

  // Update schedule
  updateSchedule: async (id, scheduleData) => {
    const response = await axiosInstance.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  // Delete schedule
  deleteSchedule: async (id) => {
    const response = await axiosInstance.delete(`/schedules/${id}`);
    return response.data;
  },

  // Get schedules with filters and pagination
  // All filter parameters are now optional
  filterSchedules: async (routeId = null, fromDate = null, toDate = null, maxPrice = null, pageNo = 1, pageSize = 10) => {
    const params = new URLSearchParams();
    
    // Only add parameters if they have values
    if (routeId) params.append('routeId', routeId);
    
    // Format dates to YYYY-MM-DD (LocalDate format expected by backend)
    if (fromDate) {
      const date = new Date(fromDate);
      const formattedDate = date.toISOString().split('T')[0]; // Extract YYYY-MM-DD
      params.append('fromDate', formattedDate);
    }
    if (toDate) {
      const date = new Date(toDate);
      const formattedDate = date.toISOString().split('T')[0]; // Extract YYYY-MM-DD
      params.append('toDate', formattedDate);
    }
    
    if (maxPrice) params.append('maxPrice', maxPrice);
    params.append('pageNo', pageNo);
    params.append('pageSize', pageSize);

    const response = await axiosInstance.get(`/schedules/filter/specification?${params.toString()}`);
    return response.data;
  },

  // Get schedule seats by schedule ID
  getScheduleSeats: async (scheduleId) => {
    const response = await axiosInstance.get(`/schedule-seats/schedule/${scheduleId}`);
    return response.data;
  },

  // Get bus details by schedule ID (legacy - if still needed)
  getBusBySchedule: async (scheduleId) => {
    const response = await axiosInstance.get(`/buses/schedule/${scheduleId}`);
    return response.data;
  },
};

export default scheduleService;

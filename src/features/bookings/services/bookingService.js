import axiosInstance from 'services/axiosConfig';

const bookingService = {
  // Get all bookings with filters and pagination
  filterBookings: async (filters = {}, page = 0, size = 10) => {
    const params = new URLSearchParams();
    
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.scheduleId) params.append('scheduleId', filters.scheduleId);
    if (filters.bookingStatus) params.append('bookingStatus', filters.bookingStatus);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters.minAmount) params.append('minAmount', filters.minAmount);
    if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
    if (filters.createdFrom) params.append('createdFrom', filters.createdFrom);
    if (filters.createdTo) params.append('createdTo', filters.createdTo);
    params.append('page', page);
    params.append('size', size);

    const response = await axiosInstance.get(`/api/bookings?${params.toString()}`);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await axiosInstance.get(`/api/bookings/${id}`);
    return response.data;
  },

  // Create booking
  createBooking: async (bookingData) => {
    const response = await axiosInstance.post('/api/bookings', bookingData);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id) => {
    const response = await axiosInstance.patch(`/api/bookings/${id}/cancel`);
    return response.data;
  },

  // Delete booking
  deleteBooking: async (id) => {
    const response = await axiosInstance.delete(`/api/bookings/${id}`);
    return response.data;
  },
};

export default bookingService;

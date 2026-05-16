import axiosInstance from 'services/axiosConfig';

const bookingService = {
  // Admin: Get all bookings with filters and pagination
  filterBookings: async (filters = {}, page = 0, size = 20) => {
    const params = new URLSearchParams();
    
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.scheduleId) params.append('scheduleId', filters.scheduleId);
    if (filters.bookingStatus) params.append('bookingStatus', filters.bookingStatus);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    params.append('page', page);
    params.append('size', size);

    const response = await axiosInstance.get(`/admin/bookings?${params.toString()}`);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response.data;
  },

  // Create booking
  createBooking: async (bookingData) => {
    const response = await axiosInstance.post('/bookings', bookingData);
    return response.data;
  },

  // Admin: Force mark as paid
  forceMarkPaid: async (id) => {
    const response = await axiosInstance.patch(`/admin/bookings/${id}/force-pay`);
    return response.data;
  },
};

export default bookingService;

import axiosInstance from 'services/axiosConfig';

const bookingService = {
  // Get all bookings
  getBookings: async (params = {}) => {
    const response = await axiosInstance.get('/api/bookings', { params });
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    const response = await axiosInstance.get(`/api/bookings/${bookingId}`);
    return response.data;
  },

  // Create booking
  createBooking: async (bookingData) => {
    const response = await axiosInstance.post('/api/bookings', bookingData);
    return response.data;
  },

  // Update booking
  updateBooking: async (bookingId, bookingData) => {
    const response = await axiosInstance.put(`/api/bookings/${bookingId}`, bookingData);
    return response.data;
  },

  // Delete booking
  deleteBooking: async (bookingId) => {
    const response = await axiosInstance.delete(`/api/bookings/${bookingId}`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    const response = await axiosInstance.post(`/api/bookings/${bookingId}/cancel`);
    return response.data;
  },

  // Confirm booking
  confirmBooking: async (bookingId) => {
    const response = await axiosInstance.post(`/api/bookings/${bookingId}/confirm`);
    return response.data;
  },
};

export default bookingService;

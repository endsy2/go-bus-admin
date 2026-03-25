import axiosInstance from 'services/axiosConfig';

const reportService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/api/reports/dashboard');
    return response.data;
  },

  // Get revenue report
  getRevenueReport: async (params = {}) => {
    const response = await axiosInstance.get('/api/reports/revenue', { params });
    return response.data;
  },

  // Get booking report
  getBookingReport: async (params = {}) => {
    const response = await axiosInstance.get('/api/reports/bookings', { params });
    return response.data;
  },

  // Get bus utilization report
  getBusUtilizationReport: async (params = {}) => {
    const response = await axiosInstance.get('/api/reports/bus-utilization', { params });
    return response.data;
  },

  // Export report
  exportReport: async (reportType, params = {}) => {
    const response = await axiosInstance.get(`/api/reports/export/${reportType}`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

export default reportService;

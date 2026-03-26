import axiosInstance from 'services/axiosConfig';

const scheduleService = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/schedules');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/api/schedules/${id}`);
    return response.data;
  },

  getByBus: async (busId) => {
    const response = await axiosInstance.get(`/api/schedules/bus/${busId}`);
    return response.data;
  },

  getByDateRange: async (params) => {
    const response = await axiosInstance.get('/api/schedules/date-range', { params });
    return response.data;
  },

  getByBusAndDateRange: async (busId, params) => {
    const response = await axiosInstance.get(`/api/schedules/bus/${busId}/date-range`, { params });
    return response.data;
  },

  getByPrice: async (params) => {
    const response = await axiosInstance.get('/api/schedules/price', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/api/schedules', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/api/schedules/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/api/schedules/${id}`);
    return response.data;
  },
};

export default scheduleService;

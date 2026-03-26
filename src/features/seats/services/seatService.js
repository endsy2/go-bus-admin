import axiosInstance from 'services/axiosConfig';

const seatService = {
  getById: async (id) => {
    const response = await axiosInstance.get(`/api/seats/${id}`);
    return response.data;
  },

  getByBus: async (busId) => {
    const response = await axiosInstance.get(`/api/seats/bus/${busId}`);
    return response.data;
  },

  getByStatus: async (busId, status) => {
    const response = await axiosInstance.get(`/api/seats/bus/${busId}/status/${status}`);
    return response.data;
  },

  getByType: async (busId, type) => {
    const response = await axiosInstance.get(`/api/seats/bus/${busId}/type/${type}`);
    return response.data;
  },

  getBySeatNumber: async (busId, seatNumber) => {
    const response = await axiosInstance.get(`/api/seats/bus/${busId}/number/${seatNumber}`);
    return response.data;
  },

  countByStatus: async (busId, status) => {
    const response = await axiosInstance.get(`/api/seats/bus/${busId}/count/${status}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/api/seats', data);
    return response.data;
  },

  bulkCreate: async (busId, data) => {
    const response = await axiosInstance.post(`/api/seats/bus/${busId}/bulk`, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/api/seats/${id}`, data);
    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await axiosInstance.patch(`/api/seats/${id}/status`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/api/seats/${id}`);
    return response.data;
  },
};

export default seatService;

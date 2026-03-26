import axiosInstance from 'services/axiosConfig';

const promoService = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/promos');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/api/promos/${id}`);
    return response.data;
  },

  getByCode: async (code) => {
    const response = await axiosInstance.get(`/api/promos/code/${code}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/api/promos', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/api/promos/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/api/promos/${id}`);
    return response.data;
  },
};

export default promoService;

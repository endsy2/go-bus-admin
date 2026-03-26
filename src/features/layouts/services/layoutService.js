import axiosInstance from 'services/axiosConfig';

const layoutService = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/layouts');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/api/layouts/${id}`);
    return response.data;
  },

  getByName: async (name) => {
    const response = await axiosInstance.get(`/api/layouts/name/${name}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/api/layouts', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/api/layouts/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/api/layouts/${id}`);
    return response.data;
  },
};

export default layoutService;

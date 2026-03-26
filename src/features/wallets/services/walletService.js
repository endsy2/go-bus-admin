import axiosInstance from 'services/axiosConfig';

const walletService = {
  getByUserId: async (userId) => {
    const response = await axiosInstance.get(`/api/wallets/user/${userId}`);
    return response.data;
  },

  getAll: async (params) => {
    const response = await axiosInstance.get('/api/wallets', { params });
    return response.data;
  },

  getTransactions: async (params) => {
    const response = await axiosInstance.get('/api/wallets/transactions', { params });
    return response.data;
  },

  create: async (userId) => {
    const response = await axiosInstance.post(`/api/wallets/user/${userId}`);
    return response.data;
  },
};

export default walletService;

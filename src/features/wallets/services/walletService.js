import axiosInstance from 'services/axiosConfig';

const walletService = {
  // Create wallet for user
  createWallet: async (userId) => {
    const response = await axiosInstance.post(`/admin/wallets/${userId}`);
    return response.data;
  },

  // Get wallet by user ID
  getWalletByUser: async (userId) => {
    const response = await axiosInstance.get(`/admin/wallets/${userId}`);
    return response.data;
  },

  // Get wallet by ID
  getWalletById: async (walletId) => {
    const response = await axiosInstance.get(`/wallets/${walletId}`);
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  // Get all wallets with filters and pagination
  getWallets: async (filters = {}, page = 0, size = 10) => {
    const params = new URLSearchParams();
    
    if (filters.name) params.append('name', filters.name);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.status) params.append('status', filters.status);
    if (filters.minBalance) params.append('minBalance', filters.minBalance);
    if (filters.maxBalance) params.append('maxBalance', filters.maxBalance);
    if (filters.currency) params.append('currency', filters.currency);
    params.append('page', page);
    params.append('size', size);

    const response = await axiosInstance.get(`/admin/wallets/specification?${params.toString()}`);
    return response.data;
  },

  // Get transactions with filters and pagination
  getTransactions: async (filters = {}, page = 0, size = 10) => {
    const params = new URLSearchParams();
    
    if (filters.walletId) params.append('walletId', filters.walletId);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.referenceId) params.append('referenceId', filters.referenceId);
    params.append('page', page);
    params.append('size', size);

    const response = await axiosInstance.get(`/wallets/transactions?${params.toString()}`);
    return response.data;
  },
};

export default walletService;

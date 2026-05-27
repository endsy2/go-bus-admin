import axiosInstance from 'services/axiosConfig';

// Wraps backend AdminUserController (/api/admin/users/**).
// axiosInstance already prefixes /api, so paths here start with /admin/users.
const customerService = {
  getCustomers: async (params = {}) => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },

  getCustomerById: async (customerId) => {
    const response = await axiosInstance.get(`/admin/users/${customerId}`);
    return response.data;
  },

  updateCustomer: async (customerId, customerData) => {
    const response = await axiosInstance.put(`/admin/users/${customerId}`, customerData);
    return response.data;
  },

  setCustomerStatus: async (customerId, active) => {
    const response = await axiosInstance.patch(`/admin/users/${customerId}/status`, { active });
    return response.data;
  },

  resetCustomerPassword: async (customerId, newPassword) => {
    const response = await axiosInstance.patch(`/admin/users/${customerId}/reset-password`, { newPassword });
    return response.data;
  },

  unlinkGoogle: async (customerId) => {
    const response = await axiosInstance.patch(`/admin/users/${customerId}/unlink-google`);
    return response.data;
  },

  assignRoles: async (customerId, roles) => {
    const response = await axiosInstance.put(`/admin/users/${customerId}/roles`, { roles });
    return response.data;
  },

  adjustWallet: async (customerId, adjustment) => {
    const response = await axiosInstance.patch(`/admin/users/${customerId}/wallet/adjust`, adjustment);
    return response.data;
  },

  setWalletStatus: async (customerId, status) => {
    const response = await axiosInstance.patch(`/admin/users/${customerId}/wallet/status`, null, {
      params: { status },
    });
    return response.data;
  },

  deleteCustomer: async (customerId) => {
    const response = await axiosInstance.delete(`/admin/users/${customerId}`);
    return response.data;
  },
};

export default customerService;

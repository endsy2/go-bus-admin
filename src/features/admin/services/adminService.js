import axiosInstance from 'services/axiosConfig';

const adminService = {
  users: {
    list: async (params) => {
      const response = await axiosInstance.get('/api/admin/users', { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await axiosInstance.get(`/api/admin/users/${id}`);
      return response.data;
    },

    setStatus: async (id, data) => {
      const response = await axiosInstance.patch(`/api/admin/users/${id}/status`, data);
      return response.data;
    },

    resetPassword: async (id, data) => {
      const response = await axiosInstance.patch(`/api/admin/users/${id}/reset-password`, data);
      return response.data;
    },

    unlinkGoogle: async (id) => {
      const response = await axiosInstance.patch(`/api/admin/users/${id}/unlink-google`);
      return response.data;
    },

    assignRoles: async (id, data) => {
      const response = await axiosInstance.put(`/api/admin/users/${id}/roles`, data);
      return response.data;
    },

    adjustWallet: async (id, data) => {
      const response = await axiosInstance.patch(`/api/admin/users/${id}/wallet/adjust`, data);
      return response.data;
    },

    setWalletStatus: async (id, data) => {
      const response = await axiosInstance.patch(`/api/admin/users/${id}/wallet/status`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/api/admin/users/${id}`);
      return response.data;
    },
  },

  roles: {
    getAll: async () => {
      const response = await axiosInstance.get('/api/admin/roles');
      return response.data;
    },

    getPaged: async (params) => {
      const response = await axiosInstance.get('/api/admin/roles/paged', { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await axiosInstance.get(`/api/admin/roles/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await axiosInstance.post('/api/admin/roles', data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await axiosInstance.put(`/api/admin/roles/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/api/admin/roles/${id}`);
      return response.data;
    },
  },

  permissions: {
    getAll: async () => {
      const response = await axiosInstance.get('/api/admin/permissions');
      return response.data;
    },

    getById: async (id) => {
      const response = await axiosInstance.get(`/api/admin/permissions/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await axiosInstance.post('/api/admin/permissions', data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await axiosInstance.put(`/api/admin/permissions/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/api/admin/permissions/${id}`);
      return response.data;
    },
  },

  bookings: {
    list: async (params) => {
      const response = await axiosInstance.get('/api/admin/bookings', { params });
      return response.data;
    },

    confirm: async (id) => {
      const response = await axiosInstance.patch(`/api/admin/bookings/${id}/confirm`);
      return response.data;
    },

    cancel: async (id) => {
      const response = await axiosInstance.patch(`/api/admin/bookings/${id}/cancel`);
      return response.data;
    },

    forcePay: async (id) => {
      const response = await axiosInstance.patch(`/api/admin/bookings/${id}/force-pay`);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/api/admin/bookings/${id}`);
      return response.data;
    },
  },
};

export default adminService;

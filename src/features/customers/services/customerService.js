import axiosInstance from 'services/axiosConfig';

const customerService = {
  // Get all customers
  getCustomers: async (params = {}) => {
    const response = await axiosInstance.get('/api/customers', { params });
    return response.data;
  },

  // Get customer by ID
  getCustomerById: async (customerId) => {
    const response = await axiosInstance.get(`/api/customers/${customerId}`);
    return response.data;
  },

  // Create customer
  createCustomer: async (customerData) => {
    const response = await axiosInstance.post('/api/customers', customerData);
    return response.data;
  },

  // Update customer
  updateCustomer: async (customerId, customerData) => {
    const response = await axiosInstance.put(`/api/customers/${customerId}`, customerData);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (customerId) => {
    const response = await axiosInstance.delete(`/api/customers/${customerId}`);
    return response.data;
  },

  // Search customers
  searchCustomers: async (searchTerm) => {
    const response = await axiosInstance.get('/api/customers/search', {
      params: { q: searchTerm }
    });
    return response.data;
  },
};

export default customerService;

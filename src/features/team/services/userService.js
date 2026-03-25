import axiosInstance from 'services/axiosConfig';

const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/api/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/api/users/profile', profileData);
    return response.data;
  },

  // Get all users (for team management)
  getAllUsers: async (params = {}) => {
    const response = await axiosInstance.get('/api/users', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/api/users/${userId}`);
    return response.data;
  },

  // Create user
  createUser: async (userData) => {
    const response = await axiosInstance.post('/api/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await axiosInstance.put(`/api/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/api/users/${userId}`);
    return response.data;
  },

  // Assign role
  assignRole: async (userId, roleData) => {
    const response = await axiosInstance.post(`/api/users/${userId}/role`, roleData);
    return response.data;
  },
};

export default userService;

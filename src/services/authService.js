import axiosInstance from './axiosConfig';

const authService = {
  // Login
  login: async (credentials) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axiosInstance.post('/api/auth/logout');
    return response.data;
  },
};

export default authService;

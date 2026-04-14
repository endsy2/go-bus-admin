import axiosInstance from 'services/axiosConfig';

const profileService = {
  // Get current user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/api/users/profile');
    return response.data;
  },

  // Update current user profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/api/users/profile', profileData);
    return response.data;
  },
};

export default profileService;

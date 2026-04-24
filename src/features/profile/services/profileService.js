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

  // Upload profile image
  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/api/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete profile image
  deleteProfileImage: async () => {
    const response = await axiosInstance.delete('/api/profile/image');
    return response.data;
  },

  // Get profile image URL
  getProfileImageUrl: async () => {
    const response = await axiosInstance.get('/api/profile/image/url');
    return response.data;
  },
};

export default profileService;

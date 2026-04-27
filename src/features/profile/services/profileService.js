import axiosInstance from 'services/axiosConfig';

const profileService = {
  // Get current user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/api/users/profile');
    return response.data;
  },

  // Update current user profile
  updateProfile: async (userId, profileData) => {
    // Only send fields that are allowed to be updated
    const updatePayload = {
      userName: profileData.userName,
      fullName: profileData.fullName,
      phone: profileData.phone,
      gender: profileData.gender,
    };
    
    const response = await axiosInstance.put(`/api/users/${userId}`, updatePayload);
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

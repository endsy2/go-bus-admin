import axiosInstance from 'services/axiosConfig';

const paymentService = {
  getById: async (id) => {
    const response = await axiosInstance.get(`/api/payments/${id}`);
    return response.data;
  },

  getByBooking: async (bookingId) => {
    const response = await axiosInstance.get(`/api/payments/booking/${bookingId}`);
    return response.data;
  },

  bakong: {
    generateKHQR: async (data) => {
      const response = await axiosInstance.post('/api/payments/bakong/generateKHQR', data);
      return response.data;
    },

    checkTransaction: async (data) => {
      const response = await axiosInstance.post('/api/payments/bakong/checking-transaction', data);
      return response.data;
    },
  },
};

export default paymentService;

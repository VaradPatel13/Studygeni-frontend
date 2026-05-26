import api from '@/lib/api';

export const paymentService = {
  async createOrder(plan: string) {
    const response = await api.post('/payments/create-order', { plan });
    return response.data?.data;
  },

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    const response = await api.post('/payments/verify', {
      orderId,
      paymentId,
      signature,
    });
    return response.data?.data;
  },

  async getCurrentSubscription() {
    const response = await api.get('/subscriptions/current');
    return response.data?.data;
  },
};

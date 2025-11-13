import api from './api';
import type { Order, CartItem } from '../types';

export const orderService = {
  async createOrder(
    cart: CartItem[],
    shippingAddress: any,
    user: any,
    totalPrice: number,
    paymentInfo: any
  ): Promise<Order[]> {
    const response = await api.post('/order/create-order', {
      cart,
      shippingAddress,
      user,
      totalPrice,
      paymentInfo,
    });
    return response.data.orders;
  },

  async getUserOrders(userId: number): Promise<Order[]> {
    const response = await api.get(`/order/get-all-orders/${userId}`);
    return response.data.orders || [];
  },

  async getShopOrders(shopId: number): Promise<Order[]> {
    const response = await api.get(`/order/get-seller-all-orders/${shopId}`);
    return response.data.orders || [];
  },

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const response = await api.put(`/order/update-order-status/${orderId}`, { status });
    return response.data.order;
  }
};



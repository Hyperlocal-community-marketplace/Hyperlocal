import api from './api';
import type { User } from '../types';
import { cartService } from './cart';

const STORAGE_KEY = 'user';

export const authService = {
  async register(formData: FormData): Promise<{ success: boolean; message?: string; error?: string; user?: User }> {
    try {
      const response = await api.post('/user/create-user', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const user = response.data.user;
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }
      return { success: true, message: response.data.message || 'Registration successful!', user };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      cartService.saveGuestCart();
      const response = await api.post('/user/login-user', { email, password });
      const user = response.data.user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      const guestCart = cartService.loadGuestCart();
      const userCart = cartService.loadCartForUser(user.id);
      const mergedCart = [...userCart];
      guestCart.forEach(guestItem => {
        const existingItem = mergedCart.find(item => item.productId === guestItem.productId);
        if (existingItem) {
          existingItem.quantity += guestItem.quantity;
        } else {
          mergedCart.push(guestItem);
        }
      });
      localStorage.setItem('cart', JSON.stringify(mergedCart));
      window.dispatchEvent(new Event('cartUpdated'));
      cartService.saveCartForUser(user.id);
      window.dispatchEvent(new Event('authStateChanged'));
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },

  async logout(): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        cartService.saveCartForUser(currentUser.id);
      }
      await api.get('/user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('cart');
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('authStateChanged'));
  },
 async updateUser(formData: any): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await api.put('/user/update-user-info', formData);
      const updatedUser = response.data.user;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
  },
  async validateSession(): Promise<User | null> {
    try {
      const expectedUser = this.getCurrentUser();
      if (!expectedUser) return null;
      const response = await api.get('/user/getuser', {
        headers: {
          Authorization: expectedUser.token ? `Bearer ${expectedUser.token}` : undefined,
        },
      });
      const user = response.data.user;
      if (user && user.id === expectedUser.id) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
      }
      if (expectedUser) {
        localStorage.removeItem(STORAGE_KEY);
      }
      return null;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      return null;
    }
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
};



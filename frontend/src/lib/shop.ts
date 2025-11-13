import api from "./api";
import type { Shop } from "../types";
import { cartService } from "./cart";

export const shopService = {
  async getAllShops(): Promise<Shop[]> {
    const response = await api.get("/shop/all-shops");
    return response.data.shops || [];
  },

  async getNearbyShops(userId: number, radiusKm: number = 20): Promise<Shop[]> {
    const response = await api.get(
      `/user/nearby-shops/${userId}?radius=${radiusKm}`
    );
    return response.data.shops || [];
  },

  async getShopInfo(shopId: number): Promise<Shop> {
    const response = await api.get(`/shop/get-shop-info/${shopId}`);
    return response.data.shop;
  },

  async register(formData: FormData) {
    try {
      const response = await api.post("/shop/create-shop", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const seller = response.data.user || response.data.seller;
      if (seller) localStorage.setItem("seller", JSON.stringify(seller));
      return { success: true, message: "Registration successful!", seller };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await api.post("/shop/login-shop", { email, password });
      const seller = response.data.user || response.data.seller;
      if (seller) {
        localStorage.setItem("seller", JSON.stringify(seller));
        window.dispatchEvent(new Event("authStateChanged"));
      }
      return { success: true, seller };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

  async logout() {
    try {
      await api.get("/shop/logout");
    } catch {}
    localStorage.removeItem("seller");
    cartService.clearCart();
    window.dispatchEvent(new Event("authStateChanged"));
  },

  async validateSession() {
    try {
      const expectedSeller = this.getCurrentSeller();
      if (!expectedSeller) return null;

      const response = await api.get("/shop/getSeller");
      const seller = response.data.seller;
      if (seller && seller.id === expectedSeller.id) {
        localStorage.setItem("seller", JSON.stringify(seller));
        return seller;
      }
      localStorage.removeItem("seller");
      return null;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("seller");
      }
      return null;
    }
  },

  getCurrentSeller(): Shop | null {
    const seller = localStorage.getItem("seller");
    return seller ? JSON.parse(seller) : null;
  },

  async updateSellerInfo(data: {
    name: string;
    description: string;
    address: string;
    phoneNumber: string;
    zipCode: string;
  }) {
    try {
      const response = await api.put("/shop/update-seller-info", data);
      const updated = response.data.shop;
      localStorage.setItem("seller", JSON.stringify(updated));
      return { success: true, seller: updated };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Update failed",
      };
    }
  },

  async updateAvatar(formData: FormData) {
    try {
      const response = await api.put("/shop/update-shop-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = response.data.seller;
      localStorage.setItem("seller", JSON.stringify(updated));
      return { success: true, seller: updated };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Avatar update failed",
      };
    }
  },
};

import api from "./api";
import type { Product } from "../types";

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const response = await api.get("/product/get-all-products");
    return response.data.products || [];
  },

  async getProductById(id: number): Promise<Product> {
    const response = await api.get(`/product/get-product/${id}`);
    return response.data.product;
  },

  async getProductsByShop(shopId: number): Promise<Product[]> {
    const response = await api.get(`/product/get-all-products-shop/${shopId}`);
    return response.data.products || [];
  },

  async getReviews(productId: number): Promise<any[]> {
    const response = await api.get(`/product/get-reviews/${productId}`);
    return response.data.reviews || [];
  },

  async createReview(
    productId: number,
    rating: number,
    comment: string,
    orderId?: number
  ): Promise<void> {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    await api.put("/product/create-new-review", {
      productId,
      rating,
      comment,
      userId: user.id,
      userName: user.name,
      orderId,
    });
  },

  async createProduct(formData: FormData): Promise<Product> {
    const response = await api.post("/product/create-product", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data.product;
  },

  async deleteProduct(productId: number): Promise<void> {
    await api.delete(`/product/delete-shop-product/${productId}`, {
      withCredentials: true,
    });
  },
  async updateProduct(
    productId: number,
    formData: FormData
  ): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      const response = await api.put(
        `/product/update-shop-product/${productId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      return { success: true, product: response.data.product };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Update failed",
      };
    }
  },
};

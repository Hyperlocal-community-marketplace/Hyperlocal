import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const publicEndpoints = [
    '/shop/all-shops',
    '/shop/get-shop-info',
    '/product/get-all-products',
    '/product/get-product',
  ];
  const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
  if (isPublicEndpoint) {
    delete config.headers.Authorization;
    return config;
  }
  if (config.headers.Authorization !== undefined) {
    return config;
  }
  if (config.url?.includes('/admin/')) {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      return config;
    }
  }
  const seller = JSON.parse(localStorage.getItem("seller") || "{}");
  if (seller?.token) {
    config.headers.Authorization = `Bearer ${seller.token}`;
  } else {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isPublicEndpoint = url.includes('/all-shops') || 
                             url.includes('/get-shop-info') ||
                             url.includes('/get-all-products') ||
                             url.includes('/get-product');
    if (isPublicEndpoint && (error.response?.status === 401 || error.response?.status === 403)) {
      console.warn('Auth error on public endpoint (likely cross-session):', url);
    }
    return Promise.reject(error);
  }
);

export default api;

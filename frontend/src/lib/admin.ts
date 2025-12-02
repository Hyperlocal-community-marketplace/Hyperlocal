const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const adminService = {
  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("admin", JSON.stringify(data.admin));
        localStorage.setItem("adminToken", data.token);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      return { success: false, error: "Server Error" };
    }
  },

  logout() {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
  },

  isAdmin() {
    return !!localStorage.getItem("admin");
  },

  getToken() {
    return localStorage.getItem("adminToken");
  }
};

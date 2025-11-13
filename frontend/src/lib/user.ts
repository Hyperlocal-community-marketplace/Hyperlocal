import api from "./api";
import type { User } from "../types";

export const userService = {
  async getUserInfo(userId: number): Promise<User | null> {
    try {
      const response = await api.get(`/user/user-info/${userId}`);
      if (response?.data?.user) {
        return response.data.user as User;
      }
      return null;
    } catch (err: any) {
      console.error("userService.getUserInfo -> error", err?.response ?? err);
      return null;
    }
  },
};

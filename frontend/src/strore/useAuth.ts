import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

interface AuthType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

export const useAuth = create(
  persist<AuthType>((set) => ({
    isLoggedIn: false,
    login: () => {
      const userCookie = Cookies.get("token");
      if (!userCookie) {
        set({ isLoggedIn: false });
      } else {
        set({ isLoggedIn: true });
      }
    },
    logout: () => {
      set({ isLoggedIn: false });
    },
  }),
{
  name :"user Auth status"
}
)
);

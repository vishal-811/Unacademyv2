import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum RoleType {
  student = "student",
  instructor = "instructor",
}

export interface userRoleType {
  role: RoleType;
  setRole: (value: RoleType) => void;
}

export const useRole = create(
  persist<userRoleType>(
    (set) => ({
      role: RoleType.student,
      setRole: (value: RoleType) => set({ role: value }),
    }),
    { name: "userRole" }
  )
);

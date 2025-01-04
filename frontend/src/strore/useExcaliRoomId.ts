import { create } from "zustand";

interface ExcaliRoomIdType {
  ExcaliRoomId: string | null;
  setExcaliRoomId: (value: string | null) => void; // Allowing both string and null
}

export const useExcaliRoomId = create<ExcaliRoomIdType>((set) => ({
  ExcaliRoomId: null,
  setExcaliRoomId: (value: string | null) => set({ ExcaliRoomId: value }), // Ensuring value can be string or null
}));

import { create } from "zustand";

interface socketType {
  socket: WebSocket | null;
  setSocket: (value: WebSocket) => void;
}

export const useSocket = create<socketType>((set) => ({
  socket: null,
  setSocket: (value: WebSocket) => set({ socket: value }),
}));

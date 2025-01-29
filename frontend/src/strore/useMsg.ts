import { create } from "zustand";


interface newMsgType {
  newMsg: null | string;
  setNewMsg: (val: string) => void;
}

export const useNewMsg = create<newMsgType>((set) => ({
  newMsg: null,
  setNewMsg: (val: string) => set({ newMsg: val }),
}));

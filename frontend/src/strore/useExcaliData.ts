import { create } from "zustand";

interface ExcalidrawDataType {
  excalidrawData: any;
  setExcalidrawData: (value: any) => void;
}

export const useExcaliData = create<ExcalidrawDataType>((set) => ({
  excalidrawData: null,
  setExcalidrawData: (value) => set({ excalidrawData: value }),
}));

import { create } from "zustand";

interface FileNameType {
    fileName : string | null,
     setFileName  : (val :  string ) => void
}

export const useFileName = create<FileNameType>((set) => ({
    fileName : null,
    setFileName : (val : string) => set({fileName : val})
}))
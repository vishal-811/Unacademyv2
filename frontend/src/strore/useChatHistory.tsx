import { create } from "zustand";

interface ChatHistoryType{
    chatHistory : null | string[],
    setChatHistory : (val : string[]) => void
}

export const useChatHistory = create<ChatHistoryType>((set) => ({
    chatHistory : null,
    setChatHistory : (val : string[]) => set({chatHistory : val}) 
}))
import {create} from "zustand"

interface LiveKitTokenType{
    liveKitToken : string | null,
    setLiveKitToken : (val : string | null) => void
}


export const useLiveKitToken = create<LiveKitTokenType>((set) => ({
    liveKitToken : null,
    setLiveKitToken : (val : string | null) => set({liveKitToken : val })
}))
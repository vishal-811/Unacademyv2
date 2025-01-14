import { create } from "zustand"

interface RoomJoined {
    isRoomJoined : boolean,
    setIsRoomJoined : (val : boolean) => void
}

interface RoomButtonClickedStatus {
    isJoinRoomClicked : boolean,
    setIsJoinRoomClicked : ( val : boolean ) => void 
}

export const useRoomJoin = create<RoomJoined>((set) => ({
    isRoomJoined : false,
    setIsRoomJoined : (val : boolean) => set({ isRoomJoined : val})
}))


export const useIsJoinRoomClicked = create<RoomButtonClickedStatus>((set) => ({
    isJoinRoomClicked : false,
    setIsJoinRoomClicked : (val : boolean) => set({isJoinRoomClicked : val})
}))
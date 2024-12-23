import { create } from "zustand";

interface useAuthType {
    isLoggedin : boolean,
    setIsLoggedin : (value : boolean) => void
}

export const useAuth = create<useAuthType>((set) =>({
    isLoggedin : false,
    setIsLoggedin : (value : boolean) => set( { isLoggedin : value } )
}))
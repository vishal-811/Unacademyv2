import { create } from "zustand";

interface userRoleType {
    role : string,
    setRole : (value : string) => void
}

export const useRole = create<userRoleType>((set) => ({
    role : 'student',
    setRole : (value : string ) => set( {role : value} )
}))
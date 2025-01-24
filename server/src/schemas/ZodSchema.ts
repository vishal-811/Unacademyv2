import { z } from 'zod';

export const SignupSchema = z.object({
    username : z.string(),
    email :z.string(),
    password : z.string().min(6),
    role : z.enum(['student','instructor'])
})

export const SigninSchema =z.object({
    email : z.string(),
    password : z.string().min(6),
    role :z.enum(['student','instructor'])
})

export const CreateRoomSchema = z.object({
    roomname : z.string(),
    description : z.string()
})


export const GenerateLiveKitTokenSchema = z.object({
    roomId : z.string()
})
import { z } from 'zod';

export const SignupSchema = z.object({
    username : z.string(),
    email :z.string(),
    password : z.string().min(6)
})

export const SigninSchema =z.object({
    username : z.string(),
    password : z.string().min(6)
})
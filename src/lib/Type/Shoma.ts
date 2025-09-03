import { z } from "zod";


export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string(),
  age: z.coerce.number().optional(),
  password: z.string(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});

export const ProductShoma = z.object({
    name: z.string(),
  price: z.coerce.number(),
  quantitiy: z.string().optional(),
})

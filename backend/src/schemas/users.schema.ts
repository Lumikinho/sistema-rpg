import {z} from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(3, "Nome muito curto."),
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(8, "A senha precisa ter no mínimo 8 caracteres."),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres.").optional(),
  email: z.string().trim().email("E-mail inválido.").optional(),
  avatar: z
    .string()
    .trim()
    .url("A URL do avatar deve ser válida.")
    .nullable()
    .optional()
    .or(z.literal("")),
  currentPassword: z.string().optional(),
  password: z
    .string()
    .min(8, "A nova senha precisa ter no mínimo 8 caracteres.")
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

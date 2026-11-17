import {z} from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Nome muito curto."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(8, "A senha precisa ter 8 caracteres."),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Informe pelo menos um campo para atualizar.",
  );

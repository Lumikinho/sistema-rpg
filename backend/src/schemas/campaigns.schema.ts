import {z} from "zod";

export const createCampaignSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome da campanha.")
    .max(120, "Nome muito longo."),
  description: z
    .string()
    .trim()
    .max(2000, "Descrição muito longa.")
    .optional(),
  image: z
    .string()
    .trim()
    .url("Informe uma URL de imagem válida.")
    .optional(),
  gameSystemId: z
    .string()
    .uuid("Sistema de jogo inválido.")
    .optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

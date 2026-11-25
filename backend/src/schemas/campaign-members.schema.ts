import {z} from "zod";

export const addCampaignMemberSchema = z
  .object({
    userId: z.string().uuid("ID de usuário inválido.").optional(),
    email: z.string().email("E-mail inválido.").optional(),
    role: z.enum(["MASTER", "PLAYER"]).default("PLAYER"),
  })
  .refine((data) => data.userId || data.email, {
    message: "Informe o ID ou o e-mail do jogador.",
    path: ["email"],
  });

export const updateCampaignMemberSchema = z.object({
  role: z.enum(["MASTER", "PLAYER"]),
});

export type AddCampaignMemberInput = z.infer<typeof addCampaignMemberSchema>;
export type UpdateCampaignMemberInput = z.infer<
  typeof updateCampaignMemberSchema
>;

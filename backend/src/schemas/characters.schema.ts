import {z} from "zod";

export const createCharacterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da ficha/personagem.")
    .max(120, "Nome muito longo."),
  type: z.enum(["PLAYER", "NPC", "MONSTER", "COMPANION"]).default("PLAYER"),
  ownerId: z.string().uuid("ID de jogador inválido.").nullable().optional(),
  templateId: z.string().uuid("Template inválido.").optional(),
  sheetData: z.record(z.string(), z.any()).optional().default({}),
});

export const updateCharacterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da ficha.")
    .max(120, "Nome muito longo.")
    .optional(),
  type: z.enum(["PLAYER", "NPC", "MONSTER", "COMPANION"]).optional(),
  ownerId: z.string().uuid("ID de jogador inválido.").nullable().optional(),
  isLocked: z.boolean().optional(),
  sheetData: z.record(z.string(), z.any()).optional(),
});

export const assignCharacterSchema = z.object({
  ownerId: z.string().uuid("ID de jogador inválido.").nullable(),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;
export type AssignCharacterInput = z.infer<typeof assignCharacterSchema>;

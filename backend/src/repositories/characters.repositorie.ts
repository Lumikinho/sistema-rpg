import {prisma} from "../config/prisma.js";
import type {
  CreateCharacterInput,
  UpdateCharacterInput,
} from "../schemas/characters.schema.js";

const characterListInclude = {
  owner: {
    select: {id: true, name: true, email: true, avatar: true},
  },
  createdBy: {
    select: {id: true, name: true},
  },
  template: {
    select: {id: true, name: true},
  },
} as const;

export const charactersRepository = {
  listarPorCampanha: async (campaignId: string) => {
    return prisma.characters.findMany({
      where: {campaignId},
      include: characterListInclude,
      orderBy: {createdAt: "asc"},
    });
  },

  buscarPorId: async (id: string, campaignId: string) => {
    return prisma.characters.findFirst({
      where: {id, campaignId},
      include: {
        owner: {
          select: {id: true, name: true, email: true, avatar: true},
        },
        createdBy: {
          select: {id: true, name: true},
        },
        template: {
          select: {id: true, name: true},
        },
        version: {
          include: {
            sections: {
              orderBy: {order: "asc" as const},
              include: {
                fields: {
                  orderBy: {order: "asc" as const},
                },
              },
            },
          },
        },
      },
    });
  },

  criar: async (
    campaignId: string,
    createdById: string,
    templateId: string,
    versionId: string,
    data: CreateCharacterInput,
  ) => {
    return prisma.$transaction(async (tx) => {
      const character = await tx.characters.create({
        data: {
          campaignId,
          createdById,
          templateId,
          versionId,
          name: data.name,
          type: data.type ?? "PLAYER",
          ownerId: data.ownerId ?? null,
          sheetData: data.sheetData ?? {},
        },
        include: characterListInclude,
      });

      await tx.campaignAuditLogs.create({
        data: {
          campaignId,
          actorId: createdById,
          characterId: character.id,
          action: "CREATE",
          entityType: "Character",
          entityId: character.id,
          description: `Ficha "${character.name}" (${character.type}) criada.`,
          afterData: data.sheetData ?? {},
        },
      });

      return character;
    });
  },

  atualizar: async (
    id: string,
    campaignId: string,
    actorId: string,
    data: UpdateCharacterInput,
  ) => {
    return prisma.$transaction(async (tx) => {
      const current = await tx.characters.findFirst({
        where: {id, campaignId},
      });

      if (!current) {
        return null;
      }

      let mergedSheetData = current.sheetData;
      if (data.sheetData !== undefined) {
        mergedSheetData = {
          ...(typeof current.sheetData === "object" && current.sheetData !== null
            ? current.sheetData
            : {}),
          ...data.sheetData,
        };
      }

      const updated = await tx.characters.update({
        where: {id},
        data: {
          ...(data.name !== undefined ? {name: data.name} : {}),
          ...(data.type !== undefined ? {type: data.type} : {}),
          ...(data.ownerId !== undefined ? {ownerId: data.ownerId} : {}),
          ...(data.isLocked !== undefined ? {isLocked: data.isLocked} : {}),
          ...(data.sheetData !== undefined ? {sheetData: mergedSheetData as any} : {}),
        },
        include: characterListInclude,
      });

      await tx.campaignAuditLogs.create({
        data: {
          campaignId,
          actorId,
          characterId: id,
          action: "UPDATE",
          entityType: "Character",
          entityId: id,
          description: `Ficha "${updated.name}" atualizada.`,
          beforeData: current.sheetData as any,
          afterData: updated.sheetData as any,
        },
      });

      return updated;
    });
  },

  excluir: async (id: string, campaignId: string, actorId: string) => {
    return prisma.$transaction(async (tx) => {
      const character = await tx.characters.findFirst({
        where: {id, campaignId},
      });

      if (!character) {
        return null;
      }

      await tx.characters.delete({
        where: {id},
      });

      await tx.campaignAuditLogs.create({
        data: {
          campaignId,
          actorId,
          characterId: null,
          action: "DELETE",
          entityType: "Character",
          entityId: id,
          description: `Ficha "${character.name}" foi excluída.`,
        },
      });

      return character;
    });
  },

  atribuirDono: async (
    id: string,
    campaignId: string,
    ownerId: string | null,
    actorId: string,
  ) => {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.characters.update({
        where: {id},
        data: {ownerId},
        include: characterListInclude,
      });

      await tx.campaignAuditLogs.create({
        data: {
          campaignId,
          actorId,
          characterId: id,
          action: "UPDATE",
          entityType: "Character",
          entityId: id,
          description: ownerId
            ? `Ficha "${updated.name}" atribuída a um jogador.`
            : `Ficha "${updated.name}" desatribuída (sem jogador).`,
        },
      });

      return updated;
    });
  },
};

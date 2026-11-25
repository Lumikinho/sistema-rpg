import {prisma} from "../config/prisma.js";
import type {CreateCampaignInput} from "../schemas/campaigns.schema.js";

const campaignInclude = {
  gameSystem: {
    select: {id: true, name: true, slug: true, logo: true, description: true},
  },
  owner: {
    select: {id: true, name: true, email: true, avatar: true},
  },
  members: {
    select: {
      role: true,
      joinedAt: true,
      user: {
        select: {id: true, name: true, email: true, avatar: true},
      },
    },
    orderBy: {joinedAt: "asc" as const},
  },
  _count: {
    select: {characters: true, sessions: true},
  },
} as const;

export const campaignsRepository = {
  listarDoUsuario: (userId: string) =>
    prisma.campanhas.findMany({
      where: {
        OR: [{ownerId: userId}, {members: {some: {userId}}}],
      },
      include: campaignInclude,
      orderBy: {updatedAt: "desc"},
    }),

  buscarDoUsuario: (id: string, userId: string) =>
    prisma.campanhas.findFirst({
      where: {
        id,
        OR: [{ownerId: userId}, {members: {some: {userId}}}],
      },
      include: campaignInclude,
    }),

  criar: async (data: CreateCampaignInput, ownerId: string) => {
    const created = await prisma.$transaction(async (tx) => {
      const campaign = await tx.campanhas.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          image: data.image ?? null,
          gameSystemId: data.gameSystemId ?? null,
          ownerId,
        },
      });

      // Quem cria a campanha entra automaticamente como MESTRE dela.
      await tx.campaignMembers.create({
        data: {campaignId: campaign.id, userId: ownerId, role: "MASTER"},
      });

      await tx.campaignAuditLogs.create({
        data: {
          campaignId: campaign.id,
          actorId: ownerId,
          action: "CREATE",
          entityType: "Campanha",
          entityId: campaign.id,
          description: `Campanha "${campaign.name}" criada.`,
        },
      });

      return tx.campanhas.findUniqueOrThrow({
        where: {id: campaign.id},
        include: campaignInclude,
      });
    });

    return created;
  },
};

export type CampaignComInclude = Awaited<
  ReturnType<typeof campaignsRepository.listarDoUsuario>
>[number];

import {prisma} from "../config/prisma.js";
import type {Role} from "../generated/enums.js";

export const campaignMembersRepository = {
  obterPermissao: async (campaignId: string, userId: string) => {
    const campaign = await prisma.campanhas.findUnique({
      where: {id: campaignId},
      select: {id: true, name: true, ownerId: true},
    });

    if (!campaign) {
      return {
        campaign: null,
        isOwner: false,
        isMaster: false,
        isMember: false,
        member: null,
      };
    }

    const member = await prisma.campaignMembers.findUnique({
      where: {
        campaignId_userId: {campaignId, userId},
      },
    });

    const isOwner = campaign.ownerId === userId;
    const isMaster = isOwner || member?.role === "MASTER";
    const isMember = isOwner || Boolean(member);

    return {campaign, isOwner, isMaster, isMember, member};
  },

  listarPorCampanha: async (campaignId: string) => {
    return prisma.campaignMembers.findMany({
      where: {campaignId},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            characters: {
              where: {campaignId},
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {joinedAt: "asc"},
    });
  },

  buscarPorId: async (id: string) => {
    return prisma.campaignMembers.findUnique({
      where: {id},
      include: {
        campaign: {
          select: {id: true, name: true, ownerId: true},
        },
        user: {
          select: {id: true, name: true, email: true, avatar: true},
        },
      },
    });
  },

  adicionar: async (
    campaignId: string,
    userId: string,
    role: Role,
    actorId: string,
  ) => {
    return prisma.$transaction(async (tx) => {
      const member = await tx.campaignMembers.create({
        data: {
          campaignId,
          userId,
          role,
        },
        include: {
          user: {
            select: {id: true, name: true, email: true, avatar: true},
          },
        },
      });

      await tx.campaignAuditLogs.create({
        data: {
          campaignId,
          actorId,
          action: "GRANT",
          entityType: "CampaignMember",
          entityId: member.id,
          description: `Jogador "${member.user.name}" adicionado à campanha como ${role}.`,
        },
      });

      return member;
    });
  },

  atualizarRole: async (
    id: string,
    role: Role,
    actorId: string,
    campaignId: string,
  ) => {
    return prisma.$transaction(async (tx) => {
      const member = await tx.campaignMembers.update({
        where: {id},
        data: {role},
        include: {
          user: {
            select: {id: true, name: true, email: true, avatar: true},
          },
        },
      });

      await tx.campaignAuditLogs.create({
        data: {
          campaignId,
          actorId,
          action: "UPDATE",
          entityType: "CampaignMember",
          entityId: id,
          description: `Papel de "${member.user.name}" alterado para ${role}.`,
        },
      });

      return member;
    });
  },

  remover: async (id: string, actorId: string, campaignId: string) => {
    return prisma.$transaction(async (tx) => {
      const member = await tx.campaignMembers.findUnique({
        where: {id},
        include: {
          user: {select: {id: true, name: true}},
        },
      });

      if (!member) {
        return null;
      }

      // Desvincula fichas atribuídas a este jogador nesta campanha
      await tx.characters.updateMany({
        where: {
          campaignId,
          ownerId: member.userId,
        },
        data: {
          ownerId: null,
        },
      });

      await tx.campaignMembers.delete({
        where: {id},
      });

      await tx.campaignAuditLogs.create({
        data: {
          campaignId,
          actorId,
          action: "REVOKE",
          entityType: "CampaignMember",
          entityId: id,
          description: `Jogador "${member.user.name}" foi removido da mesa.`,
        },
      });

      return member;
    });
  },
};

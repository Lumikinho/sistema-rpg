import {prisma} from "../config/prisma.js";

export const usersRepository = {
  listar: () =>
    prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

  buscarPorId: (id: string) =>
    prisma.users.findUnique({
      where: {id},
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

  buscarPorIdComSenha: (id: string) =>
    prisma.users.findUnique({
      where: {id},
    }),

  obterEstatisticas: async (userId: string) => {
    const [ownedCampaigns, memberships, characters] = await Promise.all([
      prisma.campanhas.count({where: {ownerId: userId}}),
      prisma.campaignMembers.count({where: {userId}}),
      prisma.characters.count({
        where: {OR: [{ownerId: userId}, {createdById: userId}]},
      }),
    ]);

    return {
      ownedCampaigns,
      memberships,
      characters,
    };
  },

  buscarPorEmail: (email: string) =>
    prisma.users.findUnique({
      where: {email},
    }),

  buscarPorTermo: (termo: string, excetoId?: string) =>
    prisma.users.findMany({
      where: {
        AND: [
          excetoId ? {id: {not: excetoId}} : {},
          {
            OR: [
              {name: {contains: termo, mode: "insensitive"}},
              {email: {contains: termo, mode: "insensitive"}},
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
      take: 20,
    }),

  criar: (data: {
    name: string;
    email: string;
    password: string;
    avatar?: string;
  }) =>
    prisma.users.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

  atualizar: (
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      avatar?: string | null;
    },
  ) =>
    prisma.users.update({
      where: {id},
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

  excluir: (id: string) =>
    prisma.users.delete({
      where: {id},
    }),
};

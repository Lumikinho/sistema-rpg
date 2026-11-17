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
    }),

  buscarPorEmail: (email: string) =>
    prisma.users.findUnique({
      where: {email},
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

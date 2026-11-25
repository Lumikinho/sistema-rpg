import {prisma} from "../config/prisma.js";

export const gameSystemsRepository = {
  listar: () =>
    prisma.gameSystems.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
      },
      orderBy: {name: "asc"},
    }),

  existePorId: (id: string) =>
    prisma.gameSystems.findUnique({
      where: {id},
      select: {id: true},
    }),
};

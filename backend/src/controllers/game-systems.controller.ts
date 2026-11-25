import type {Request, Response} from "express";

import {gameSystemsRepository} from "../repositories/game-systems.repositorie.js";

export const gameSystemsController = {
  listar: async (_req: Request, res: Response) => {
    const gameSystems = await gameSystemsRepository.listar();

    return res.status(200).json(gameSystems);
  },
};

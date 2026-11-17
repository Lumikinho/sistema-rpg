import bcrypt from "bcryptjs";
import type {Request, Response} from "express";

import {usersRepository} from "../repositories/users.repositorie.js";
import {createUserSchema, updateUserSchema} from "../schemas/users.schema.js";

export const usersController = {
  listar: async (_req: Request, res: Response) => {
    const users = await usersRepository.listar();

    return res.status(200).json(users);
  },

  buscarPorId: async (req: Request<{id: string}>, res: Response) => {
    const user = await usersRepository.buscarPorId(req.params.id);

    if (!user) {
      return res.status(404).json({message: "Usuário não encontrado."});
    }

    return res.status(200).json(user);
  },

  criar: async (req: Request, res: Response) => {
    const data = createUserSchema.parse(req.body);

    const existingUser = await usersRepository.buscarPorEmail(data.email);

    if (existingUser) {
      return res.status(409).json({message: "E-mail já cadastrado."});
    }

    const password = await bcrypt.hash(data.password, 12);

    const user = await usersRepository.criar({...data, password});

    return res.status(201).json(user);
  },

  atualizar: async (req: Request<{id: string}>, res: Response) => {
    const data = updateUserSchema.parse(req.body);

    const user = await usersRepository.buscarPorId(req.params.id);

    if (!user) {
      return res.status(404).json({message: "Usuário não encontrado."});
    }

    if (data.email) {
      const existingUser = await usersRepository.buscarPorEmail(data.email);

      if (existingUser && existingUser.id !== req.params.id) {
        return res.status(409).json({message: "E-mail já cadastrado."});
      }
    }

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;

    if (data.password !== undefined) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const updatedUser = await usersRepository.atualizar(
      req.params.id,
      updateData,
    );

    return res.status(200).json(updatedUser);
  },

  excluir: async (req: Request<{id: string}>, res: Response) => {
    const user = await usersRepository.buscarPorId(req.params.id);

    if (!user) {
      return res.status(404).json({message: "Usuário não encontrado."});
    }

    await usersRepository.excluir(req.params.id);

    return res.status(204).send();
  },
};

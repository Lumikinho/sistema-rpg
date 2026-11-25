import bcrypt from "bcryptjs";
import type {Request, Response} from "express";

import {usersRepository} from "../repositories/users.repositorie.js";
import {createUserSchema, updateUserSchema} from "../schemas/users.schema.js";

export const usersController = {
  buscar: async (req: Request, res: Response) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const users = await usersRepository.buscarPorTermo(q, req.user?.id);
    return res.status(200).json(users);
  },

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

  perfil: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const user = await usersRepository.buscarPorId(req.user.id);
    if (!user) {
      return res.status(404).json({message: "Usuário não encontrado."});
    }

    const stats = await usersRepository.obterEstatisticas(req.user.id);

    return res.status(200).json({
      user,
      stats,
    });
  },

  atualizar: async (req: Request<{id: string}>, res: Response) => {
    const targetId = req.params.id || req.user?.id;
    if (!targetId) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const data = updateUserSchema.parse(req.body);

    const user = await usersRepository.buscarPorIdComSenha(targetId);

    if (!user) {
      return res.status(404).json({message: "Usuário não encontrado."});
    }

    if (data.email) {
      const existingUser = await usersRepository.buscarPorEmail(data.email);

      if (existingUser && existingUser.id !== targetId) {
        return res
          .status(409)
          .json({message: "E-mail já cadastrado por outra conta."});
      }
    }

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      avatar?: string | null;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar ? data.avatar : null;
    }

    if (data.password !== undefined) {
      // Se for o próprio usuário alterando a senha, exige a senha atual
      if (req.user?.id === targetId) {
        if (!data.currentPassword) {
          return res.status(400).json({
            message: "Informe sua senha atual para definir uma nova senha.",
          });
        }

        const isCurrentValid = await bcrypt.compare(
          data.currentPassword,
          user.password,
        );

        if (!isCurrentValid) {
          return res
            .status(400)
            .json({message: "A senha atual informada está incorreta."});
        }
      }

      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const updatedUser = await usersRepository.atualizar(
      targetId,
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

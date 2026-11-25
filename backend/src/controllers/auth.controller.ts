import bcrypt from "bcryptjs";
import type {Request, Response} from "express";

import {REFRESH_COOKIE} from "../config/auth.js";
import {usersRepository} from "../repositories/users.repositorie.js";
import {loginSchema} from "../schemas/auth.schema.js";
import {
  definirCookiesDeAutenticacao,
  limparCookiesDeAutenticacao,
} from "../utils/auth-cookies.js";
import {verificarToken} from "../utils/jwt.js";

function removerSenha<T extends {password: string}>(user: T): Omit<T, "password"> {
  const {password: _password, ...publicUser} = user;

  return publicUser;
}

export const authController = {
  login: async (req: Request, res: Response) => {
    const data = loginSchema.parse(req.body);

    const user = await usersRepository.buscarPorEmail(data.email);

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return res.status(401).json({message: "E-mail ou senha inválidos."});
    }

    const publicUser = removerSenha(user);

    definirCookiesDeAutenticacao(res, {
      id: publicUser.id,
      role: publicUser.role,
    });

    return res.status(200).json({user: publicUser});
  },

  refresh: async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE];

    if (typeof token !== "string") {
      return res.status(401).json({message: "Sessão não encontrada."});
    }

    let userId: string;

    try {
      userId = verificarToken(token, "refresh").sub;
    } catch {
      limparCookiesDeAutenticacao(res);

      return res.status(401).json({message: "Sessão inválida ou expirada."});
    }

    const user = await usersRepository.buscarPorId(userId);

    if (!user) {
      limparCookiesDeAutenticacao(res);

      return res.status(401).json({message: "Usuário não encontrado."});
    }

    definirCookiesDeAutenticacao(res, {id: user.id, role: user.role});

    return res.status(200).json({user});
  },

  me: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    const user = await usersRepository.buscarPorId(req.user.id);

    if (!user) {
      return res.status(404).json({message: "Usuário não encontrado."});
    }

    return res.status(200).json({user});
  },

  logout: (_req: Request, res: Response) => {
    limparCookiesDeAutenticacao(res);

    return res.status(204).send();
  },
};

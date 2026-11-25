import type {NextFunction, Request, Response} from "express";

import {ACCESS_COOKIE} from "../config/auth.js";
import {verificarToken, type UserRole} from "../utils/jwt.js";

export function autenticar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const cookieToken = req.cookies?.[ACCESS_COOKIE];
  const authHeader = req.headers.authorization;
  const bearerToken =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

  const token = cookieToken || bearerToken;

  if (typeof token !== "string" || !token) {
    return res.status(401).json({message: "Não autenticado."});
  }

  try {
    const payload = verificarToken(token, "access");

    req.user = {id: payload.sub, role: payload.role};

    return next();
  } catch {
    return res.status(401).json({message: "Sessão inválida ou expirada."});
  }
}

export function exigirRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({message: "Acesso negado."});
    }

    return next();
  };
}

export function exigirProprioOuRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({message: "Não autenticado."});
    }

    if (req.params.id !== req.user.id && !roles.includes(req.user.role)) {
      return res.status(403).json({message: "Acesso negado."});
    }

    return next();
  };
}

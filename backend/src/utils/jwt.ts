import {randomUUID} from "node:crypto";
import jwt, {type JwtPayload} from "jsonwebtoken";

import {
  accessTokenExpiresIn,
  getJwtSecret,
  refreshTokenExpiresIn,
} from "../config/auth.js";

export type TokenType = "access" | "refresh";

export type UserRole = "MASTER" | "PLAYER";

export interface TokenUser {
  id: string;
  role: UserRole;
}

export interface TokenPayload extends JwtPayload {
  sub: string;
  role: UserRole;
  type: TokenType;
}

export function assinarToken(user: TokenUser, type: TokenType) {
  return jwt.sign({role: user.role, type}, getJwtSecret(), {
    subject: user.id,
    expiresIn:
      type === "access" ? accessTokenExpiresIn : refreshTokenExpiresIn,
    jwtid: randomUUID(),
  });
}

export function verificarToken(token: string, type: TokenType): TokenPayload {
  const payload = jwt.verify(token, getJwtSecret());

  if (
    typeof payload === "string" ||
    payload.type !== type ||
    typeof payload.sub !== "string" ||
    (payload.role !== "MASTER" && payload.role !== "PLAYER")
  ) {
    throw new Error("Token inválido.");
  }

  return payload as TokenPayload;
}

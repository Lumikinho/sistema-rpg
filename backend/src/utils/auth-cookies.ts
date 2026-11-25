import type {Response} from "express";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessTokenExpiresIn,
  cookieOptions,
  refreshTokenExpiresIn,
} from "../config/auth.js";
import {assinarToken, type TokenUser} from "./jwt.js";

export function definirCookiesDeAutenticacao(res: Response, user: TokenUser) {
  res.cookie(ACCESS_COOKIE, assinarToken(user, "access"), {
    ...cookieOptions,
    maxAge: accessTokenExpiresIn * 1000,
  });

  res.cookie(REFRESH_COOKIE, assinarToken(user, "refresh"), {
    ...cookieOptions,
    maxAge: refreshTokenExpiresIn * 1000,
  });
}

export function limparCookiesDeAutenticacao(res: Response) {
  res.clearCookie(ACCESS_COOKIE, cookieOptions);
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
}

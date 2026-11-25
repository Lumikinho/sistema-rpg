import type {CookieOptions} from "express";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

function lerInteiroPositivo(valor: string | undefined, fallback: number) {
  const numero = Number(valor);

  return Number.isInteger(numero) && numero > 0 ? numero : fallback;
}

export const accessTokenExpiresIn = lerInteiroPositivo(
  process.env.JWT_ACCESS_EXPIRES_IN,
  60 * 15,
);

export const refreshTokenExpiresIn = lerInteiroPositivo(
  process.env.JWT_REFRESH_EXPIRES_IN,
  60 * 60 * 24 * 7,
);

export const isProduction = process.env.NODE_ENV === "production";

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET deve estar definida e ter no mínimo 32 caracteres.",
    );
  }

  return secret;
}

export function assertAuthConfigured() {
  getJwtSecret();
}

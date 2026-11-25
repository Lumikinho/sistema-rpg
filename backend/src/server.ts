import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import {assertAuthConfigured} from "./config/auth.js";
import {connectDatabase} from "./config/prisma.js";
import {errorHandler} from "./middlewares/error.middleware.js";
import {routes} from "./routes/routes.js";

const app = express();
const port = process.env.SERVER_PORT;
const desenvolvimento = process.env.NODE_ENV;

const origensPermitidas = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origem) => origem.trim())
  .filter(Boolean);

const emDesenvolvimento = desenvolvimento !== "production";

const origemLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function resolverOrigem(
  origem: string | undefined,
  callback: (erro: Error | null, permitir?: boolean) => void,
) {
  if (!origem) {
    return callback(null, true);
  }

  if (origensPermitidas.includes(origem)) {
    return callback(null, true);
  }

  if (emDesenvolvimento && origemLocalhost.test(origem)) {
    return callback(null, true);
  }

  return callback(null, false);
}

app.use(
  cors({
    origin: resolverOrigem,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use("/", routes);
app.use(errorHandler);

await connectDatabase();

const server = app.listen(port, () => {
  console.log(
    `Servidor rodando em http://localhost:${port} (${desenvolvimento})`,
  );
});

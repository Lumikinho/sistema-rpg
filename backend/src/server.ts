import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const server = app.listen(env.port, () => {
  console.log(`Servidor rodando em http://localhost:${env.port} (${env.nodeEnv})`);
});

function shutdown(signal: string): void {
  console.log(`\n${signal} recebido, encerrando o servidor...`);

  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

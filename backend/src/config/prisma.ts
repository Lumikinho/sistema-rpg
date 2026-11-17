import "dotenv/config";
import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "../generated/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não definida.");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({connectionString}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Verifica a conexão com o banco de dados
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ [DATABASE] Conexão com PostgreSQL estabelecida!");
  } catch (error) {
    console.error("❌ [DATABASE] Falha ao conectar com PostgreSQL:", error);
    throw error;
  }
}

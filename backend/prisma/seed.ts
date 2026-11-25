import "dotenv/config";
import {prisma} from "../src/config/prisma.js";

const gameSystems = [
  {
    name: "Tormenta20",
    slug: "tormenta20",
    description: "Sistema nacional inspirado em D&D, no cenário de Arton.",
  },
  {
    name: "Dungeons & Dragons 5ª Edição",
    slug: "dnd-5e",
    description: "O clássico dungeon crawler da Wizards of the Coast.",
  },
  {
    name: "Ordem Paranormal RPG",
    slug: "ordem-paranormal",
    description: "RPG de horror investigativo no cenário Ordem Paranormal.",
  },
  {
    name: "GURPS",
    slug: "gurps",
    description: "Sistema universal de regras genéricas, de Steve Jackson.",
  },
  {
    name: "Vampiro: A Máscara",
    slug: "vampiro-a-mascara",
    description: "Storytelling de horror pessoal no World of Darkness.",
  },
  {
    name: "Call of Cthulhu",
    slug: "call-of-cthulhu",
    description: "Investigação de horror cósmico Lovecraftiano.",
  },
];

async function main() {
  for (const system of gameSystems) {
    await prisma.gameSystems.upsert({
      where: {slug: system.slug},
      update: {name: system.name, description: system.description},
      create: system,
    });
  }

  console.log(`Seed concluído: ${gameSystems.length} sistemas de jogo.`);
}

main()
  .catch((error) => {
    console.error("Erro no seed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

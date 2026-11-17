-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MASTER', 'PLAYER');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "origin" TEXT,
    "personalHistory" TEXT,
    "objective" TEXT,
    "fear" TEXT,
    "importantPerson" TEXT,
    "possessions" TEXT,
    "secret" TEXT,
    "occupationId" TEXT,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterAttributes" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "strength" INTEGER NOT NULL,
    "constitution" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "dexterity" INTEGER NOT NULL,
    "appearance" INTEGER NOT NULL,
    "intelligence" INTEGER NOT NULL,
    "power" INTEGER NOT NULL,
    "education" INTEGER NOT NULL,

    CONSTRAINT "CharacterAttributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterStatistics" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "hitPointsMax" INTEGER NOT NULL,
    "hitPoints" INTEGER NOT NULL,
    "sanityInitial" INTEGER NOT NULL,
    "sanity" INTEGER NOT NULL,
    "magicPointsMax" INTEGER NOT NULL,
    "magicPoints" INTEGER NOT NULL,
    "luck" INTEGER NOT NULL,
    "movement" INTEGER NOT NULL,

    CONSTRAINT "CharacterStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseValue" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSkills" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "CharacterSkills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Occupations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Occupations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupationSkills" (
    "id" TEXT NOT NULL,
    "occupationId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "OccupationSkills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campanhas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campanhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignMembers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignMembers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterAttributes_characterId_key" ON "CharacterAttributes"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterStatistics_characterId_key" ON "CharacterStatistics"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "Skills_name_key" ON "Skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSkills_characterId_skillId_key" ON "CharacterSkills"("characterId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "Occupations_name_key" ON "Occupations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OccupationSkills_occupationId_skillId_key" ON "OccupationSkills"("occupationId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "Campanhas_ownerId_nome_key" ON "Campanhas"("ownerId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMembers_userId_campaignId_key" ON "CampaignMembers"("userId", "campaignId");

-- AddForeignKey
ALTER TABLE "Characters" ADD CONSTRAINT "Characters_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Characters" ADD CONSTRAINT "Characters_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campanhas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAttributes" ADD CONSTRAINT "CharacterAttributes_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterStatistics" ADD CONSTRAINT "CharacterStatistics_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSkills" ADD CONSTRAINT "CharacterSkills_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSkills" ADD CONSTRAINT "CharacterSkills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationSkills" ADD CONSTRAINT "OccupationSkills_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupationSkills" ADD CONSTRAINT "OccupationSkills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campanhas" ADD CONSTRAINT "Campanhas_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMembers" ADD CONSTRAINT "CampaignMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMembers" ADD CONSTRAINT "CampaignMembers_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

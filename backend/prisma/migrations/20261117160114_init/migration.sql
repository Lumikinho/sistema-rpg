-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MASTER', 'PLAYER');

-- CreateEnum
CREATE TYPE "CharacterType" AS ENUM ('PLAYER', 'NPC', 'MONSTER', 'COMPANION');

-- CreateEnum
CREATE TYPE "TemplateVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN', 'DATE', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'URL');

-- CreateEnum
CREATE TYPE "FieldCategory" AS ENUM ('GENERAL', 'ATTRIBUTE', 'STATISTIC', 'COMBAT', 'SKILL', 'BACKGROUND', 'INVENTORY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CompendiumScope" AS ENUM ('MASTER', 'CAMPAIGN');

-- CreateEnum
CREATE TYPE "CompendiumType" AS ENUM ('ITEM', 'WEAPON', 'ARMOR', 'POWER', 'CLASS', 'RACE', 'SPELL', 'SKILL', 'PROFESSION', 'FEAT', 'OTHER');

-- CreateEnum
CREATE TYPE "AcquisitionType" AS ENUM ('PURCHASED', 'LEARNED', 'GRANTED', 'STARTING', 'REWARD', 'OTHER');

-- CreateEnum
CREATE TYPE "EffectApplication" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "EffectOperation" AS ENUM ('SET', 'ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE', 'APPEND', 'REMOVE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionEventType" AS ENUM ('STORY', 'COMBAT', 'DISCOVERY', 'NPC', 'LOCATION', 'REWARD', 'DEATH', 'DECISION', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ARCHIVE', 'MIGRATE', 'GRANT', 'REVOKE', 'LOGIN', 'OTHER');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSystems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSystems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campanhas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,
    "gameSystemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campanhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignMembers" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignMembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetTemplates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "publishedVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SheetTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetTemplateVersions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "TemplateVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SheetTemplateVersions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetSections" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SheetSections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldDefinitions" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "type" "FieldType" NOT NULL,
    "category" "FieldCategory" NOT NULL DEFAULT 'GENERAL',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "min" DOUBLE PRECISION,
    "max" DOUBLE PRECISION,
    "defaultValue" JSONB,
    "options" JSONB,
    "config" JSONB,
    "visibleToPlayer" BOOLEAN NOT NULL DEFAULT true,
    "editableByPlayer" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldDefinitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CharacterType" NOT NULL DEFAULT 'PLAYER',
    "campaignId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "ownerId" TEXT,
    "createdById" TEXT NOT NULL,
    "sheetData" JSONB NOT NULL DEFAULT '{}',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompendiumCategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "CompendiumScope" NOT NULL,
    "creatorId" TEXT NOT NULL,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompendiumCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompendiumEntries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CompendiumType" NOT NULL,
    "scope" "CompendiumScope" NOT NULL,
    "creatorId" TEXT NOT NULL,
    "campaignId" TEXT,
    "categoryId" TEXT,
    "gameSystemId" TEXT,
    "image" TEXT,
    "properties" JSONB,
    "requirements" JSONB,
    "cost" JSONB,
    "rarity" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompendiumEntries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompendiumEffects" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "targetFieldKey" TEXT NOT NULL,
    "application" "EffectApplication" NOT NULL DEFAULT 'MANUAL',
    "operation" "EffectOperation" NOT NULL,
    "value" JSONB NOT NULL,
    "conditions" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompendiumEffects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterItems" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "acquisition" "AcquisitionType" NOT NULL DEFAULT 'OTHER',
    "properties" JSONB,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterPowers" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "acquisition" "AcquisitionType" NOT NULL DEFAULT 'OTHER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "properties" JSONB,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterPowers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterClasses" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "properties" JSONB,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterClasses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterRaces" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "properties" JSONB,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterRaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSpells" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "prepared" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acquisition" "AcquisitionType" NOT NULL DEFAULT 'OTHER',
    "properties" JSONB,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterSpells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterNotes" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignSessions" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sessionNumber" INTEGER NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PLANNED',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "summary" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignSessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionParticipants" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionParticipants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionEvents" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventType" "SessionEventType" NOT NULL DEFAULT 'OTHER',
    "occurredAt" TIMESTAMP(3),
    "metadata" JSONB,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionEvents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignAuditLogs" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "characterId" TEXT,
    "sessionId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "beforeData" JSONB,
    "afterData" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignAuditLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GameSystems_slug_key" ON "GameSystems"("slug");

-- CreateIndex
CREATE INDEX "GameSystems_createdById_idx" ON "GameSystems"("createdById");

-- CreateIndex
CREATE INDEX "Campanhas_ownerId_idx" ON "Campanhas"("ownerId");

-- CreateIndex
CREATE INDEX "Campanhas_gameSystemId_idx" ON "Campanhas"("gameSystemId");

-- CreateIndex
CREATE INDEX "CampaignMembers_userId_idx" ON "CampaignMembers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMembers_campaignId_userId_key" ON "CampaignMembers"("campaignId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SheetTemplates_publishedVersionId_key" ON "SheetTemplates"("publishedVersionId");

-- CreateIndex
CREATE INDEX "SheetTemplates_campaignId_idx" ON "SheetTemplates"("campaignId");

-- CreateIndex
CREATE INDEX "SheetTemplates_createdById_idx" ON "SheetTemplates"("createdById");

-- CreateIndex
CREATE INDEX "SheetTemplateVersions_templateId_status_idx" ON "SheetTemplateVersions"("templateId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SheetTemplateVersions_templateId_version_key" ON "SheetTemplateVersions"("templateId", "version");

-- CreateIndex
CREATE INDEX "SheetSections_versionId_order_idx" ON "SheetSections"("versionId", "order");

-- CreateIndex
CREATE INDEX "FieldDefinitions_versionId_sectionId_idx" ON "FieldDefinitions"("versionId", "sectionId");

-- CreateIndex
CREATE INDEX "FieldDefinitions_sectionId_order_idx" ON "FieldDefinitions"("sectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "FieldDefinitions_versionId_key_key" ON "FieldDefinitions"("versionId", "key");

-- CreateIndex
CREATE INDEX "Characters_campaignId_idx" ON "Characters"("campaignId");

-- CreateIndex
CREATE INDEX "Characters_ownerId_idx" ON "Characters"("ownerId");

-- CreateIndex
CREATE INDEX "Characters_templateId_versionId_idx" ON "Characters"("templateId", "versionId");

-- CreateIndex
CREATE INDEX "CompendiumCategories_creatorId_scope_idx" ON "CompendiumCategories"("creatorId", "scope");

-- CreateIndex
CREATE INDEX "CompendiumCategories_campaignId_idx" ON "CompendiumCategories"("campaignId");

-- CreateIndex
CREATE INDEX "CompendiumEntries_creatorId_scope_idx" ON "CompendiumEntries"("creatorId", "scope");

-- CreateIndex
CREATE INDEX "CompendiumEntries_campaignId_type_idx" ON "CompendiumEntries"("campaignId", "type");

-- CreateIndex
CREATE INDEX "CompendiumEntries_categoryId_idx" ON "CompendiumEntries"("categoryId");

-- CreateIndex
CREATE INDEX "CompendiumEntries_gameSystemId_idx" ON "CompendiumEntries"("gameSystemId");

-- CreateIndex
CREATE INDEX "CompendiumEffects_entryId_isEnabled_idx" ON "CompendiumEffects"("entryId", "isEnabled");

-- CreateIndex
CREATE INDEX "CompendiumEffects_targetFieldKey_idx" ON "CompendiumEffects"("targetFieldKey");

-- CreateIndex
CREATE INDEX "CharacterItems_characterId_idx" ON "CharacterItems"("characterId");

-- CreateIndex
CREATE INDEX "CharacterItems_entryId_idx" ON "CharacterItems"("entryId");

-- CreateIndex
CREATE INDEX "CharacterPowers_characterId_idx" ON "CharacterPowers"("characterId");

-- CreateIndex
CREATE INDEX "CharacterPowers_entryId_idx" ON "CharacterPowers"("entryId");

-- CreateIndex
CREATE INDEX "CharacterClasses_characterId_idx" ON "CharacterClasses"("characterId");

-- CreateIndex
CREATE INDEX "CharacterClasses_entryId_idx" ON "CharacterClasses"("entryId");

-- CreateIndex
CREATE INDEX "CharacterRaces_characterId_idx" ON "CharacterRaces"("characterId");

-- CreateIndex
CREATE INDEX "CharacterRaces_entryId_idx" ON "CharacterRaces"("entryId");

-- CreateIndex
CREATE INDEX "CharacterSpells_characterId_idx" ON "CharacterSpells"("characterId");

-- CreateIndex
CREATE INDEX "CharacterSpells_entryId_idx" ON "CharacterSpells"("entryId");

-- CreateIndex
CREATE INDEX "CharacterNotes_characterId_idx" ON "CharacterNotes"("characterId");

-- CreateIndex
CREATE INDEX "CharacterNotes_authorId_idx" ON "CharacterNotes"("authorId");

-- CreateIndex
CREATE INDEX "CampaignSessions_campaignId_status_idx" ON "CampaignSessions"("campaignId", "status");

-- CreateIndex
CREATE INDEX "CampaignSessions_scheduledAt_idx" ON "CampaignSessions"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignSessions_campaignId_sessionNumber_key" ON "CampaignSessions"("campaignId", "sessionNumber");

-- CreateIndex
CREATE INDEX "SessionParticipants_characterId_idx" ON "SessionParticipants"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionParticipants_sessionId_userId_key" ON "SessionParticipants"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "SessionEvents_sessionId_eventType_idx" ON "SessionEvents"("sessionId", "eventType");

-- CreateIndex
CREATE INDEX "SessionEvents_occurredAt_idx" ON "SessionEvents"("occurredAt");

-- CreateIndex
CREATE INDEX "CampaignAuditLogs_campaignId_createdAt_idx" ON "CampaignAuditLogs"("campaignId", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignAuditLogs_actorId_createdAt_idx" ON "CampaignAuditLogs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignAuditLogs_characterId_createdAt_idx" ON "CampaignAuditLogs"("characterId", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignAuditLogs_sessionId_createdAt_idx" ON "CampaignAuditLogs"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignAuditLogs_entityType_entityId_idx" ON "CampaignAuditLogs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "GameSystems" ADD CONSTRAINT "GameSystems_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campanhas" ADD CONSTRAINT "Campanhas_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campanhas" ADD CONSTRAINT "Campanhas_gameSystemId_fkey" FOREIGN KEY ("gameSystemId") REFERENCES "GameSystems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMembers" ADD CONSTRAINT "CampaignMembers_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMembers" ADD CONSTRAINT "CampaignMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetTemplates" ADD CONSTRAINT "SheetTemplates_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetTemplates" ADD CONSTRAINT "SheetTemplates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetTemplates" ADD CONSTRAINT "SheetTemplates_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "SheetTemplateVersions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetTemplateVersions" ADD CONSTRAINT "SheetTemplateVersions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SheetTemplates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetSections" ADD CONSTRAINT "SheetSections_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "SheetTemplateVersions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldDefinitions" ADD CONSTRAINT "FieldDefinitions_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "SheetTemplateVersions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldDefinitions" ADD CONSTRAINT "FieldDefinitions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "SheetSections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Characters" ADD CONSTRAINT "Characters_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Characters" ADD CONSTRAINT "Characters_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SheetTemplates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Characters" ADD CONSTRAINT "Characters_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "SheetTemplateVersions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Characters" ADD CONSTRAINT "Characters_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Characters" ADD CONSTRAINT "Characters_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompendiumCategories" ADD CONSTRAINT "CompendiumCategories_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompendiumCategories" ADD CONSTRAINT "CompendiumCategories_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompendiumEntries" ADD CONSTRAINT "CompendiumEntries_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompendiumEntries" ADD CONSTRAINT "CompendiumEntries_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompendiumEntries" ADD CONSTRAINT "CompendiumEntries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CompendiumCategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompendiumEntries" ADD CONSTRAINT "CompendiumEntries_gameSystemId_fkey" FOREIGN KEY ("gameSystemId") REFERENCES "GameSystems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompendiumEffects" ADD CONSTRAINT "CompendiumEffects_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompendiumEntries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterItems" ADD CONSTRAINT "CharacterItems_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterItems" ADD CONSTRAINT "CharacterItems_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompendiumEntries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterPowers" ADD CONSTRAINT "CharacterPowers_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterPowers" ADD CONSTRAINT "CharacterPowers_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompendiumEntries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterClasses" ADD CONSTRAINT "CharacterClasses_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterClasses" ADD CONSTRAINT "CharacterClasses_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompendiumEntries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRaces" ADD CONSTRAINT "CharacterRaces_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRaces" ADD CONSTRAINT "CharacterRaces_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompendiumEntries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSpells" ADD CONSTRAINT "CharacterSpells_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSpells" ADD CONSTRAINT "CharacterSpells_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompendiumEntries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterNotes" ADD CONSTRAINT "CharacterNotes_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterNotes" ADD CONSTRAINT "CharacterNotes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSessions" ADD CONSTRAINT "CampaignSessions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSessions" ADD CONSTRAINT "CampaignSessions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipants" ADD CONSTRAINT "SessionParticipants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CampaignSessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipants" ADD CONSTRAINT "SessionParticipants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipants" ADD CONSTRAINT "SessionParticipants_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionEvents" ADD CONSTRAINT "SessionEvents_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CampaignSessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAuditLogs" ADD CONSTRAINT "CampaignAuditLogs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAuditLogs" ADD CONSTRAINT "CampaignAuditLogs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAuditLogs" ADD CONSTRAINT "CampaignAuditLogs_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAuditLogs" ADD CONSTRAINT "CampaignAuditLogs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CampaignSessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;


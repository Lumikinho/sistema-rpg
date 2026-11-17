-- Rename tables to English singular names
ALTER TABLE "Users" RENAME TO "User";
ALTER TABLE "Characters" RENAME TO "Character";
ALTER TABLE "CharacterAttributes" RENAME TO "CharacterAttribute";
ALTER TABLE "CharacterStatistics" RENAME TO "CharacterStatistic";
ALTER TABLE "Skills" RENAME TO "Skill";
ALTER TABLE "CharacterSkills" RENAME TO "CharacterSkill";
ALTER TABLE "Occupations" RENAME TO "Occupation";
ALTER TABLE "OccupationSkills" RENAME TO "OccupationSkill";
ALTER TABLE "Campanhas" RENAME TO "Campaign";
ALTER TABLE "CampaignMembers" RENAME TO "CampaignMember";

-- Rename localized column
ALTER TABLE "Campaign" RENAME COLUMN "nome" TO "name";

-- Rename primary keys
ALTER TABLE "User" RENAME CONSTRAINT "Users_pkey" TO "User_pkey";
ALTER TABLE "Character" RENAME CONSTRAINT "Characters_pkey" TO "Character_pkey";
ALTER TABLE "CharacterAttribute" RENAME CONSTRAINT "CharacterAttributes_pkey" TO "CharacterAttribute_pkey";
ALTER TABLE "CharacterStatistic" RENAME CONSTRAINT "CharacterStatistics_pkey" TO "CharacterStatistic_pkey";
ALTER TABLE "Skill" RENAME CONSTRAINT "Skills_pkey" TO "Skill_pkey";
ALTER TABLE "CharacterSkill" RENAME CONSTRAINT "CharacterSkills_pkey" TO "CharacterSkill_pkey";
ALTER TABLE "Occupation" RENAME CONSTRAINT "Occupations_pkey" TO "Occupation_pkey";
ALTER TABLE "OccupationSkill" RENAME CONSTRAINT "OccupationSkills_pkey" TO "OccupationSkill_pkey";
ALTER TABLE "Campaign" RENAME CONSTRAINT "Campanhas_pkey" TO "Campaign_pkey";
ALTER TABLE "CampaignMember" RENAME CONSTRAINT "CampaignMembers_pkey" TO "CampaignMember_pkey";

-- Rename unique indexes
ALTER INDEX "Users_email_key" RENAME TO "User_email_key";
ALTER INDEX "CharacterAttributes_characterId_key" RENAME TO "CharacterAttribute_characterId_key";
ALTER INDEX "CharacterStatistics_characterId_key" RENAME TO "CharacterStatistic_characterId_key";
ALTER INDEX "Skills_name_key" RENAME TO "Skill_name_key";
ALTER INDEX "CharacterSkills_characterId_skillId_key" RENAME TO "CharacterSkill_characterId_skillId_key";
ALTER INDEX "Occupations_name_key" RENAME TO "Occupation_name_key";
ALTER INDEX "OccupationSkills_occupationId_skillId_key" RENAME TO "OccupationSkill_occupationId_skillId_key";
ALTER INDEX "Campanhas_ownerId_nome_key" RENAME TO "Campaign_ownerId_name_key";
ALTER INDEX "CampaignMembers_userId_campaignId_key" RENAME TO "CampaignMember_userId_campaignId_key";

-- Rename foreign keys
ALTER TABLE "Character" RENAME CONSTRAINT "Characters_occupationId_fkey" TO "Character_occupationId_fkey";
ALTER TABLE "Character" RENAME CONSTRAINT "Characters_campaignId_fkey" TO "Character_campaignId_fkey";
ALTER TABLE "CharacterAttribute" RENAME CONSTRAINT "CharacterAttributes_characterId_fkey" TO "CharacterAttribute_characterId_fkey";
ALTER TABLE "CharacterStatistic" RENAME CONSTRAINT "CharacterStatistics_characterId_fkey" TO "CharacterStatistic_characterId_fkey";
ALTER TABLE "CharacterSkill" RENAME CONSTRAINT "CharacterSkills_characterId_fkey" TO "CharacterSkill_characterId_fkey";
ALTER TABLE "CharacterSkill" RENAME CONSTRAINT "CharacterSkills_skillId_fkey" TO "CharacterSkill_skillId_fkey";
ALTER TABLE "OccupationSkill" RENAME CONSTRAINT "OccupationSkills_occupationId_fkey" TO "OccupationSkill_occupationId_fkey";
ALTER TABLE "OccupationSkill" RENAME CONSTRAINT "OccupationSkills_skillId_fkey" TO "OccupationSkill_skillId_fkey";
ALTER TABLE "Campaign" RENAME CONSTRAINT "Campanhas_ownerId_fkey" TO "Campaign_ownerId_fkey";
ALTER TABLE "CampaignMember" RENAME CONSTRAINT "CampaignMembers_userId_fkey" TO "CampaignMember_userId_fkey";
ALTER TABLE "CampaignMember" RENAME CONSTRAINT "CampaignMembers_campaignId_fkey" TO "CampaignMember_campaignId_fkey";

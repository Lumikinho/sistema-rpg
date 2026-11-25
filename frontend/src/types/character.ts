import type { SheetTemplateVersion } from "./template"

export type CharacterType = "PLAYER" | "NPC" | "MONSTER" | "COMPANION"

export interface CharacterUser {
  id: string
  name: string
  email: string
  avatar: string | null
}

export interface Character {
  id: string
  name: string
  type: CharacterType
  campaignId: string
  templateId: string
  versionId: string
  ownerId: string | null
  createdById: string
  sheetData: Record<string, any>
  isLocked: boolean
  createdAt: string
  updatedAt: string
  owner: CharacterUser | null
  createdBy: { id: string; name: string }
  template: { id: string; name: string }
  version?: SheetTemplateVersion
  canEdit?: boolean
  isMine?: boolean
}

export interface CreateCharacterInput {
  name: string
  type?: CharacterType
  ownerId?: string | null
  templateId?: string
  sheetData?: Record<string, any>
}

export interface UpdateCharacterInput {
  name?: string
  type?: CharacterType
  ownerId?: string | null
  isLocked?: boolean
  sheetData?: Record<string, any>
}

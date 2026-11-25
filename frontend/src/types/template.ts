export type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "SELECT"
  | "MULTISELECT"
  | "CHECKBOX"
  | "URL"

export type FieldCategory =
  | "GENERAL"
  | "ATTRIBUTE"
  | "STATISTIC"
  | "COMBAT"
  | "SKILL"
  | "BACKGROUND"
  | "INVENTORY"
  | "CUSTOM"

export interface FieldDefinition {
  id: string
  versionId: string
  sectionId: string
  key: string
  label: string
  description: string | null
  type: FieldType
  category: FieldCategory
  required: boolean
  min: number | null
  max: number | null
  defaultValue: any
  options: string[] | null
  config: any
  visibleToPlayer: boolean
  editableByPlayer: boolean
  order: number
}

export interface SheetSection {
  id: string
  versionId: string
  name: string
  description: string | null
  order: number
  fields: FieldDefinition[]
}

export interface SheetTemplateVersion {
  id: string
  templateId: string
  version: number
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  description: string | null
  publishedAt: string | null
  sections: SheetSection[]
  fields?: FieldDefinition[]
}

export interface SheetTemplate {
  id: string
  name: string
  description: string | null
  campaignId: string
  createdById: string
  publishedVersionId: string | null
  publishedVersion?: SheetTemplateVersion | null
  versions: SheetTemplateVersion[]
}

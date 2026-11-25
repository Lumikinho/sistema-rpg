export type CampaignMemberRole = "MASTER" | "PLAYER"

export interface CampaignPlayerCharacter {
  id: string
  name: string
  type: string
}

export interface DetailedCampaignMember {
  id: string
  campaignId: string
  userId: string
  role: CampaignMemberRole
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
    characters?: CampaignPlayerCharacter[]
  }
}

export interface AddCampaignMemberInput {
  userId?: string
  email?: string
  role?: CampaignMemberRole
}

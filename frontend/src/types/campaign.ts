export type CampaignRole = "MASTER" | "PLAYER"

export interface GameSystem {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
}

export interface CampaignMember {
  role: CampaignRole
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
}

export interface Campaign {
  id: string
  name: string
  description: string | null
  image: string | null
  isActive: boolean
  ownerId: string
  gameSystemId: string | null
  createdAt: string
  updatedAt: string
  gameSystem: Pick<
    GameSystem,
    "id" | "name" | "slug" | "logo" | "description"
  > | null
  owner: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
  myRole: CampaignRole
  memberCount: number
  characterCount: number
  sessionCount: number
  members: CampaignMember[]
}

export interface CreateCampaignInput {
  name: string
  description?: string
  image?: string
  gameSystemId?: string
}

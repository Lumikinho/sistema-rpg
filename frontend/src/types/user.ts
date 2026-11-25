export type UserRole = "MASTER" | "PLAYER"

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  ownedCampaigns: number
  memberships: number
  characters: number
}

export interface ProfileResponse {
  user: UserProfile
  stats: UserStats
}

export interface UpdateProfileInput {
  name?: string
  email?: string
  avatar?: string | null
}

export interface ChangePasswordInput {
  currentPassword: string
  password: string
}

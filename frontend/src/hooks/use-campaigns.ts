import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { Campaign, CreateCampaignInput, GameSystem } from "@/types/campaign"

const campaignKeys = {
  all: ["campaigns"] as const,
  detail: (id: string) => ["campaigns", id] as const,
}

export function useCampaigns() {
  return useQuery({
    queryKey: campaignKeys.all,
    queryFn: () => apiFetch<Campaign[]>("/campaigns"),
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => apiFetch<Campaign>(`/campaigns/${id}`),
    enabled: Boolean(id),
  })
}

export function useGameSystems() {
  return useQuery({
    queryKey: ["game-systems"],
    queryFn: () => apiFetch<GameSystem[]>("/game-systems"),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCampaignInput) =>
      apiFetch<Campaign>("/campaigns", { method: "POST", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all })
    },
  })
}

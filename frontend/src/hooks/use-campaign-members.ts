import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type {
  AddCampaignMemberInput,
  CampaignMemberRole,
  DetailedCampaignMember,
} from "@/types/campaign-member"

export function useCampaignMembers(campaignId: string) {
  return useQuery({
    queryKey: ["campaign-members", campaignId],
    queryFn: () =>
      apiFetch<DetailedCampaignMember[]>(`/campaigns/${campaignId}/members`),
    enabled: Boolean(campaignId),
  })
}

export function useAddCampaignMember(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddCampaignMemberInput) =>
      apiFetch<DetailedCampaignMember>(`/campaigns/${campaignId}/members`, {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["campaign-members", campaignId],
      })
      void queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] })
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
  })
}

export function useUpdateCampaignMemberRole(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string
      role: CampaignMemberRole
    }) =>
      apiFetch<DetailedCampaignMember>(
        `/campaigns/${campaignId}/members/${memberId}`,
        {
          method: "PATCH",
          body: { role },
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["campaign-members", campaignId],
      })
      void queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] })
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
  })
}

export function useRemoveCampaignMember(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: string) =>
      apiFetch<void>(`/campaigns/${campaignId}/members/${memberId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["campaign-members", campaignId],
      })
      void queryClient.invalidateQueries({
        queryKey: ["campaign-characters", campaignId],
      })
      void queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] })
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
  })
}

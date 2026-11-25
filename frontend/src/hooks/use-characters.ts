import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "@/types/character"

export function useCharacters(campaignId: string) {
  return useQuery({
    queryKey: ["campaign-characters", campaignId],
    queryFn: () =>
      apiFetch<Character[]>(`/campaigns/${campaignId}/characters`),
    enabled: Boolean(campaignId),
  })
}

export function useCharacter(campaignId: string, characterId: string) {
  return useQuery({
    queryKey: ["character", campaignId, characterId],
    queryFn: () =>
      apiFetch<Character>(`/campaigns/${campaignId}/characters/${characterId}`),
    enabled: Boolean(campaignId) && Boolean(characterId),
  })
}

export function useCreateCharacter(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCharacterInput) =>
      apiFetch<Character>(`/campaigns/${campaignId}/characters`, {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["campaign-characters", campaignId],
      })
      void queryClient.invalidateQueries({
        queryKey: ["campaign-members", campaignId],
      })
      void queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] })
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
  })
}

export function useUpdateCharacter(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      characterId,
      data,
    }: {
      characterId: string
      data: UpdateCharacterInput
    }) =>
      apiFetch<Character>(
        `/campaigns/${campaignId}/characters/${characterId}`,
        {
          method: "PATCH",
          body: data,
        },
      ),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({
        queryKey: ["campaign-characters", campaignId],
      })
      void queryClient.invalidateQueries({
        queryKey: ["character", campaignId, updated.id],
      })
      void queryClient.invalidateQueries({
        queryKey: ["campaign-members", campaignId],
      })
      void queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] })
    },
  })
}

export function useDeleteCharacter(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (characterId: string) =>
      apiFetch<void>(`/campaigns/${campaignId}/characters/${characterId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["campaign-characters", campaignId],
      })
      void queryClient.invalidateQueries({
        queryKey: ["campaign-members", campaignId],
      })
      void queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] })
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
  })
}

export function useAssignCharacter(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      characterId,
      ownerId,
    }: {
      characterId: string
      ownerId: string | null
    }) =>
      apiFetch<Character>(
        `/campaigns/${campaignId}/characters/${characterId}/assign`,
        {
          method: "POST",
          body: { ownerId },
        },
      ),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({
        queryKey: ["campaign-characters", campaignId],
      })
      void queryClient.invalidateQueries({
        queryKey: ["character", campaignId, updated.id],
      })
      void queryClient.invalidateQueries({
        queryKey: ["campaign-members", campaignId],
      })
    },
  })
}

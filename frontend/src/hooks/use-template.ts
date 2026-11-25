import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { SheetTemplate } from "@/types/template"

export function useCampaignTemplate(campaignId: string) {
  return useQuery({
    queryKey: ["campaign-template", campaignId],
    queryFn: () =>
      apiFetch<SheetTemplate>(`/campaigns/${campaignId}/templates`),
    enabled: Boolean(campaignId),
  })
}

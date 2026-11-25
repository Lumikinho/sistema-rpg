import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"

export interface SearchUserResult {
  id: string
  name: string
  email: string
  avatar: string | null
}

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ["users-search", query],
    queryFn: () =>
      apiFetch<SearchUserResult[]>(
        `/users/search?q=${encodeURIComponent(query.trim())}`,
      ),
    enabled: query.trim().length >= 1,
  })
}

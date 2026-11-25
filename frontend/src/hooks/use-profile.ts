import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/store/auth"
import type {
  ChangePasswordInput,
  ProfileResponse,
  UpdateProfileInput,
  UserProfile,
} from "@/types/user"

export function useProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: () => apiFetch<ProfileResponse>("/users/profile"),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const updateUser = useAuth((s) => s.updateUser)

  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      apiFetch<UserProfile>("/users/profile", {
        method: "PATCH",
        body: data,
      }),
    onSuccess: (updatedUser) => {
      updateUser({
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      })
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] })
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ChangePasswordInput) =>
      apiFetch<UserProfile>("/users/profile", {
        method: "PATCH",
        body: data,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] })
    },
  })
}

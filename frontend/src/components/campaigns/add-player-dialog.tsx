import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserPlus, Search, Check, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAddCampaignMember } from "@/hooks/use-campaign-members"
import { useUserSearch, type SearchUserResult } from "@/hooks/use-user-search"
import { initials } from "@/lib/format"
import { ApiError } from "@/lib/api"

const addPlayerSchema = z.object({
  email: z.string().trim().email("Digite um e-mail válido."),
  role: z.enum(["PLAYER", "MASTER"]),
})

type AddPlayerFormValues = z.infer<typeof addPlayerSchema>

interface AddPlayerDialogProps {
  campaignId: string
  existingMemberUserIds: string[]
}

export function AddPlayerDialog({
  campaignId,
  existingMemberUserIds,
}: AddPlayerDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<SearchUserResult | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const addMember = useAddCampaignMember(campaignId)
  const { data: searchResults, isFetching } = useUserSearch(searchQuery)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddPlayerFormValues>({
    resolver: zodResolver(addPlayerSchema),
    defaultValues: {
      email: "",
      role: "PLAYER",
    },
  })

  const currentRole = watch("role")

  const handleSelectUser = (user: SearchUserResult) => {
    setSelectedUser(user)
    setValue("email", user.email, { shouldValidate: true })
    setServerError(null)
  }

  const onSubmit = async (values: AddPlayerFormValues) => {
    setServerError(null)
    try {
      await addMember.mutateAsync({
        userId: selectedUser?.id,
        email: values.email,
        role: values.role,
      })
      reset()
      setSelectedUser(null)
      setSearchQuery("")
      setOpen(false)
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError("Ocorreu um erro ao adicionar o jogador.")
      }
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          setServerError(null)
          setOpen(true)
        }}
      >
        <UserPlus className="size-4" aria-hidden />
        Adicionar Jogador
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar Jogador para a Mesa</DialogTitle>
            <DialogDescription>
              Adicione um jogador existente na plataforma para participar da sua
              campanha e receber fichas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="search-user">Buscar jogador cadastrado</Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="search-user"
                  placeholder="Nome ou e-mail do jogador..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {searchQuery.trim().length >= 1 && (
                <div className="mt-1 max-h-36 overflow-y-auto rounded-md border border-white/10 bg-neutral-900/90 p-1 text-sm">
                  {isFetching ? (
                    <p className="p-2 text-xs text-muted-foreground">Buscando...</p>
                  ) : searchResults && searchResults.length > 0 ? (
                    <ul className="space-y-0.5">
                      {searchResults.map((user) => {
                        const isAlreadyMember = existingMemberUserIds.includes(user.id)
                        const isSelected = selectedUser?.id === user.id

                        return (
                          <li key={user.id}>
                            <button
                              type="button"
                              disabled={isAlreadyMember}
                              onClick={() => handleSelectUser(user)}
                              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors ${
                                isAlreadyMember
                                  ? "cursor-not-allowed opacity-40"
                                  : isSelected
                                    ? "bg-white/15 text-white"
                                    : "hover:bg-white/10 text-neutral-200"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold">
                                  {initials(user.name)}
                                </span>
                                <div className="truncate">
                                  <p className="font-medium truncate">{user.name}</p>
                                  <p className="text-muted-foreground text-[11px] truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                              {isAlreadyMember ? (
                                <span className="text-[10px] text-muted-foreground">
                                  Já na mesa
                                </span>
                              ) : isSelected ? (
                                <Check className="size-3.5 text-emerald-400" />
                              ) : null}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="p-2 text-xs text-muted-foreground">
                      Nenhum usuário encontrado.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="player-email">E-mail do jogador</Label>
              <Input
                id="player-email"
                type="email"
                placeholder="jogador@exemplo.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="player-role">Papel na campanha</Label>
              <Select
                value={currentRole}
                onValueChange={(val) =>
                  setValue("role", val as "PLAYER" | "MASTER")
                }
              >
                <SelectTrigger id="player-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLAYER">Jogador (Participante)</SelectItem>
                  <SelectItem value="MASTER">Co-Mestre (Acesso total)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={addMember.isPending}>
                {addMember.isPending ? "Adicionando..." : "Adicionar à Mesa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

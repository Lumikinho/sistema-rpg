import { useState } from "react"
import { Crown, Shield, Trash2, UserCheck, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AddPlayerDialog } from "@/components/campaigns/add-player-dialog"
import {
  useCampaignMembers,
  useRemoveCampaignMember,
  useUpdateCampaignMemberRole,
} from "@/hooks/use-campaign-members"
import { formatDate, initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { CampaignRole } from "@/types/campaign"
import type { DetailedCampaignMember } from "@/types/campaign-member"

interface PlayersTabProps {
  campaignId: string
  ownerId: string
  myRole: CampaignRole
  currentUserId: string
  onOpenCharacterSheet?: (characterId: string) => void
}

export function PlayersTab({
  campaignId,
  ownerId,
  myRole,
  currentUserId,
  onOpenCharacterSheet,
}: PlayersTabProps) {
  const { data: members, isLoading, isError, refetch } = useCampaignMembers(campaignId)
  const updateRole = useUpdateCampaignMemberRole(campaignId)
  const removeMember = useRemoveCampaignMember(campaignId)

  const [confirmDeleteMember, setConfirmDeleteMember] =
    useState<DetailedCampaignMember | null>(null)

  const isMaster = myRole === "MASTER"

  const handleRoleToggle = (member: DetailedCampaignMember) => {
    const newRole = member.role === "MASTER" ? "PLAYER" : "MASTER"
    updateRole.mutate({ memberId: member.id, role: newRole })
  }

  const handleRemove = async () => {
    if (!confirmDeleteMember) return
    await removeMember.mutateAsync(confirmDeleteMember.id)
    setConfirmDeleteMember(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !members) {
    return (
      <div className="rounded-lg border border-white/10 p-8 text-center">
        <p className="text-sm font-medium">Erro ao carregar os membros da mesa.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  const existingUserIds = members.map((m) => m.userId)

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Jogadores e Mestres ({members.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie quem participa desta mesa e veja os personagens atribuídos a cada um.
          </p>
        </div>

        {isMaster && (
          <AddPlayerDialog
            campaignId={campaignId}
            existingMemberUserIds={existingUserIds}
          />
        )}
      </div>

      <div className="divide-y divide-white/10 rounded-lg border border-white/10 bg-neutral-950/40">
        {members.map((member) => {
          const isTableOwner = member.userId === ownerId
          const isSelf = member.userId === currentUserId
          const memberIsMaster = member.role === "MASTER"
          const assignedCharacters = member.user.characters ?? []

          return (
            <div
              key={member.id}
              className="flex flex-col gap-4 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-semibold"
                  aria-hidden
                >
                  {initials(member.user.name)}
                </span>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-white">
                      {member.user.name}
                    </p>
                    {isSelf && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Você
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                        isTableOwner
                          ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                          : memberIsMaster
                            ? "bg-white text-black"
                            : "border border-white/20 text-neutral-300",
                      )}
                    >
                      {isTableOwner ? (
                        <>
                          <Crown className="size-3 text-amber-400" aria-hidden />
                          Criador & Mestre
                        </>
                      ) : memberIsMaster ? (
                        <>
                          <Shield className="size-3" aria-hidden />
                          Mestre
                        </>
                      ) : (
                        "Jogador"
                      )}
                    </span>
                  </div>

                  <p className="truncate text-xs text-muted-foreground">
                    {member.user.email} · Entrou em {formatDate(member.joinedAt)}
                  </p>

                  {assignedCharacters.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-muted-foreground">Fichas:</span>
                      {assignedCharacters.map((char) => (
                        <button
                          key={char.id}
                          type="button"
                          onClick={() => onOpenCharacterSheet?.(char.id)}
                          className="inline-flex items-center gap-1 rounded border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-neutral-200 transition-colors hover:border-white/40 hover:bg-white/10"
                        >
                          <UserCheck className="size-3 text-emerald-400" />
                          <span>{char.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-neutral-500 italic">
                      Nenhuma ficha atribuída a este jogador.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {isMaster && !isTableOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={updateRole.isPending}
                    onClick={() => handleRoleToggle(member)}
                  >
                    {memberIsMaster ? "Tornar Jogador" : "Promover a Mestre"}
                  </Button>
                )}

                {/* Pode remover se for o mestre (e não for o criador) ou se for o próprio jogador saindo */}
                {((isMaster && !isTableOwner) || (isSelf && !isTableOwner)) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => setConfirmDeleteMember(member)}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    <span className="hidden sm:inline">
                      {isSelf ? "Sair da mesa" : "Remover"}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {confirmDeleteMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-lg border border-white/15 bg-neutral-900 p-6 shadow-xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="size-6 shrink-0" />
              <h3 className="text-base font-semibold text-white">
                {confirmDeleteMember.userId === currentUserId
                  ? "Sair da campanha?"
                  : `Remover ${confirmDeleteMember.user.name}?`}
              </h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {confirmDeleteMember.userId === currentUserId
                ? "Você perderá o acesso a esta mesa e suas fichas não estarão mais sob seu controle."
                : "O jogador perderá o acesso à campanha. As fichas vinculadas a ele ficarão sem dono."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteMember(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={removeMember.isPending}
                onClick={handleRemove}
              >
                {removeMember.isPending ? "Removendo..." : "Confirmar Remoção"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from "react"
import {
  User,
  Bot,
  Skull,
  PawPrint,
  Heart,
  Zap,
  Brain,
  Lock,
  UserCheck,
  Trash2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateCharacterDialog } from "./create-character-dialog"
import { AssignCharacterDialog } from "./assign-character-dialog"
import { CharacterSheetModal } from "@/components/characters/character-sheet-modal"
import { useCharacters, useDeleteCharacter } from "@/hooks/use-characters"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Character, CharacterType } from "@/types/character"
import type { CampaignRole } from "@/types/campaign"

interface CharactersTabProps {
  campaignId: string
  myRole: CampaignRole
  currentUserId: string
  selectedCharacterId?: string | null
  onClearSelectedCharacter?: () => void
}

type CharacterFilter = "all" | "mine" | "PLAYER" | "NPC" | "MONSTER"

export function CharactersTab({
  campaignId,
  myRole,
  currentUserId,
  selectedCharacterId,
  onClearSelectedCharacter,
}: CharactersTabProps) {
  const { data: characters, isLoading, isError, refetch } = useCharacters(campaignId)
  const deleteCharacter = useDeleteCharacter(campaignId)

  const [filter, setFilter] = useState<CharacterFilter>("all")
  const [activeSheetId, setActiveSheetId] = useState<string | null>(
    selectedCharacterId ?? null,
  )
  const [assigningCharacter, setAssigningCharacter] = useState<Character | null>(
    null,
  )
  const [confirmDeleteCharacter, setConfirmDeleteCharacter] =
    useState<Character | null>(null)

  const isMaster = myRole === "MASTER"

  const filteredCharacters = useMemo(() => {
    if (!characters) return []
    if (filter === "all") return characters
    if (filter === "mine") {
      return characters.filter((c) => c.ownerId === currentUserId)
    }
    return characters.filter((c) => c.type === filter)
  }, [characters, filter, currentUserId])

  const handleDelete = async () => {
    if (!confirmDeleteCharacter) return
    await deleteCharacter.mutateAsync(confirmDeleteCharacter.id)
    setConfirmDeleteCharacter(null)
  }

  const handleOpenSheet = (charId: string) => {
    setActiveSheetId(charId)
  }

  const handleCloseSheet = (open: boolean) => {
    if (!open) {
      setActiveSheetId(null)
      onClearSelectedCharacter?.()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !characters) {
    return (
      <div className="rounded-lg border border-white/10 p-8 text-center">
        <p className="text-sm font-medium">Erro ao carregar fichas da campanha.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-2">
      {/* Header com botões de filtro e criar ficha */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Fichas de Personagem ({characters.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Personagens de jogadores, aliados e criaturas da sua mesa.
          </p>
        </div>

        <CreateCharacterDialog
          campaignId={campaignId}
          isMaster={isMaster}
          currentUserId={currentUserId}
          onCharacterCreated={(id) => setActiveSheetId(id)}
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 pb-3">
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`Todas (${characters.length})`}
        />
        <FilterButton
          active={filter === "mine"}
          onClick={() => setFilter("mine")}
          label="Minhas Fichas"
        />
        <FilterButton
          active={filter === "PLAYER"}
          onClick={() => setFilter("PLAYER")}
          label="Jogadores (PJs)"
        />
        {isMaster && (
          <>
            <FilterButton
              active={filter === "NPC"}
              onClick={() => setFilter("NPC")}
              label="NPCs"
            />
            <FilterButton
              active={filter === "MONSTER"}
              onClick={() => setFilter("MONSTER")}
              label="Monstros / Ameaças"
            />
          </>
        )}
      </div>

      {/* Lista de Fichas */}
      {filteredCharacters.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 p-12 text-center">
          <p className="text-sm font-medium text-neutral-300">
            Nenhuma ficha encontrada nesta categoria.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Clique no botão "Nova Ficha" acima para criar um personagem para a mesa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCharacters.map((char) => {
            const data = char.sheetData ?? {}
            const pvAtual = Number(data["pv_atual"] ?? 20)
            const pvMax = Number(data["pv_max"] ?? 20)
            const peAtual = Number(data["pe_atual"] ?? data["pm_atual"] ?? 4)
            const peMax = Number(data["pe_max"] ?? data["pm_max"] ?? 4)
            const sanAtual = data["san_atual"] !== undefined ? Number(data["san_atual"]) : null
            const sanMax = data["san_max"] !== undefined ? Number(data["san_max"]) : null
            const classe = data["classe"] ?? ""
            const nex = data["nex"] ?? data["nivel"] ?? null
            const isOwner = char.ownerId === currentUserId

            return (
              <div
                key={char.id}
                className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-neutral-900/50 p-5 transition-all hover:border-white/25 hover:bg-neutral-900"
              >
                <div>
                  {/* Card Header: Ícone, Tipo, Nome e Lock */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5">
                        <CharacterTypeIcon type={char.type} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-white tracking-tight">
                          {char.name}
                        </h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {classe ? `${classe}` : char.template?.name}
                          {nex !== null ? ` · NEX ${nex}%` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {char.isLocked && (
                        <span
                          className="rounded p-1 text-amber-400"
                          title="Ficha bloqueada para edição de jogadores"
                        >
                          <Lock className="size-3.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Jogador Atribuído */}
                  <div className="mt-3.5 flex items-center gap-2 rounded-md bg-white/[0.03] px-2.5 py-1.5 text-xs">
                    {char.owner ? (
                      <>
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold">
                          {initials(char.owner.name)}
                        </span>
                        <span className="truncate text-neutral-300">
                          {char.owner.name}
                          {isOwner ? " (Você)" : ""}
                        </span>
                      </>
                    ) : (
                      <span className="text-neutral-500 italic">
                        Sem jogador atribuído (Mestre)
                      </span>
                    )}
                  </div>

                  {/* Vitals Preview */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between rounded bg-red-950/30 border border-red-500/20 px-2 py-1 text-red-300">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Heart className="size-3 text-red-400" /> PV
                      </span>
                      <span className="font-mono font-bold">
                        {pvAtual}/{pvMax}
                      </span>
                    </div>

                    {sanAtual !== null ? (
                      <div className="flex items-center justify-between rounded bg-purple-950/30 border border-purple-500/20 px-2 py-1 text-purple-300">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Brain className="size-3 text-purple-400" /> SAN
                        </span>
                        <span className="font-mono font-bold">
                          {sanAtual}/{sanMax}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded bg-amber-950/30 border border-amber-500/20 px-2 py-1 text-amber-300">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Zap className="size-3 text-amber-400" /> PE
                        </span>
                        <span className="font-mono font-bold">
                          {peAtual}/{peMax}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => handleOpenSheet(char.id)}
                  >
                    <ExternalLink className="size-3 mr-1" />
                    Abrir Ficha
                  </Button>

                  {isMaster && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-2 text-xs text-muted-foreground hover:text-white"
                      onClick={() => setAssigningCharacter(char)}
                      title="Atribuir a um jogador"
                    >
                      <UserCheck className="size-3.5" />
                    </Button>
                  )}

                  {(isMaster || isOwner) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => setConfirmDeleteCharacter(char)}
                      title="Excluir ficha"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Ficha Completa */}
      <CharacterSheetModal
        campaignId={campaignId}
        characterId={activeSheetId}
        open={Boolean(activeSheetId)}
        onOpenChange={handleCloseSheet}
        isMaster={isMaster}
      />

      {/* Dialog Atribuir Jogador */}
      {assigningCharacter && (
        <AssignCharacterDialog
          campaignId={campaignId}
          character={assigningCharacter}
          open={Boolean(assigningCharacter)}
          onOpenChange={(open) => {
            if (!open) setAssigningCharacter(null)
          }}
        />
      )}

      {/* Confirmação de exclusão */}
      {confirmDeleteCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-lg border border-white/15 bg-neutral-900 p-6 shadow-xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="size-6 shrink-0" />
              <h3 className="text-base font-semibold text-white">
                Excluir ficha de {confirmDeleteCharacter.name}?
              </h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta ação é permanente e apagará todos os dados, atributos e anotações desta ficha.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteCharacter(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteCharacter.isPending}
                onClick={handleDelete}
              >
                {deleteCharacter.isPending ? "Excluindo..." : "Excluir Definitivamente"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-white text-black"
          : "text-muted-foreground hover:bg-white/10 hover:text-white",
      )}
    >
      {label}
    </button>
  )
}

function CharacterTypeIcon({ type }: { type: CharacterType }) {
  switch (type) {
    case "PLAYER":
      return <User className="size-4 text-blue-400" />
    case "NPC":
      return <Bot className="size-4 text-amber-400" />
    case "MONSTER":
      return <Skull className="size-4 text-red-400" />
    case "COMPANION":
      return <PawPrint className="size-4 text-emerald-400" />
    default:
      return <User className="size-4 text-neutral-400" />
  }
}

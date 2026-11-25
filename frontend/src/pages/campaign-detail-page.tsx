import { useState } from "react"
import { Link, useParams } from "react-router"
import {
  ArrowLeft,
  ScrollText,
  Users,
  CalendarDays,
  Crown,
  Info,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CharactersTab } from "@/components/campaigns/characters-tab"
import { PlayersTab } from "@/components/campaigns/players-tab"
import { useCampaign } from "@/hooks/use-campaigns"
import { useAuth } from "@/store/auth"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

type MainTab = "fichas" | "jogadores" | "visao-geral"

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: campaign, isLoading, isError, refetch, isRefetching } = useCampaign(
    id ?? "",
  )

  const [activeTab, setActiveTab] = useState<MainTab>("fichas")
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null,
  )

  if (isLoading) {
    return <DetailSkeleton />
  }

  if (isError || !campaign) {
    return (
      <div className="py-16 text-center">
        <p className="font-medium">Campanha não encontrada.</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Ela pode não existir, ou você não faz parte dela. Verifique o endereço ou
          volte para as campanhas.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            {isRefetching ? "Tentando..." : "Tentar novamente"}
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link to="/" />}
          >
            Voltar para campanhas
          </Button>
        </div>
      </div>
    )
  }

  const isMaster = campaign.myRole === "MASTER"
  const currentUserId = user?.id ?? ""

  const handleOpenCharacterFromPlayer = (characterId: string) => {
    setSelectedCharacterId(characterId)
    setActiveTab("fichas")
  }

  return (
    <div className="py-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        className="mb-4 -ml-2 text-muted-foreground"
        render={<Link to="/" />}
      >
        <ArrowLeft aria-hidden />
        Campanhas
      </Button>

      {campaign.image && (
        <div className="mb-6 h-44 overflow-hidden rounded-lg border border-white/10 sm:h-56">
          <img
            src={campaign.image}
            alt={`Capa de ${campaign.name}`}
            className="size-full object-cover opacity-90"
          />
        </div>
      )}

      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {campaign.name}
            </h1>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                isMaster
                  ? "bg-white text-black"
                  : "border border-white/25 text-neutral-200",
              )}
            >
              {isMaster && <Crown className="size-3" aria-hidden />}
              {isMaster ? "Mestre" : "Jogador"}
            </span>
          </div>
          <p className="mt-1.5 text-muted-foreground">
            {campaign.gameSystem?.name ?? "Sem sistema de jogo"}
            <span aria-hidden> · </span>
            criada em {formatDate(campaign.createdAt)}
          </p>
        </div>
      </header>

      {/* Estatísticas clicáveis que atuam como atalhos para as abas */}
      <section
        aria-label="Resumo da campanha"
        className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10"
      >
        <button
          type="button"
          onClick={() => setActiveTab("fichas")}
          className="text-left transition-colors hover:bg-white/[0.02]"
        >
          <StatCell
            icon={<ScrollText className="size-4" aria-hidden />}
            value={campaign.characterCount}
            label="Personagens / Fichas"
          />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("jogadores")}
          className="text-left transition-colors hover:bg-white/[0.02]"
        >
          <StatCell
            icon={<Users className="size-4" aria-hidden />}
            value={campaign.memberCount}
            label="Membros na Mesa"
          />
        </button>

        <div>
          <StatCell
            icon={<CalendarDays className="size-4" aria-hidden />}
            value={campaign.sessionCount}
            label="Sessões"
          />
        </div>
      </section>

      {/* Abas Principais de Navegação */}
      <nav
        aria-label="Navegação da campanha"
        className="flex items-center gap-2 border-b border-white/10 py-3"
      >
        <TabButton
          active={activeTab === "fichas"}
          onClick={() => setActiveTab("fichas")}
          icon={<ScrollText className="size-4" />}
          label="Fichas de Personagens"
          count={campaign.characterCount}
        />
        <TabButton
          active={activeTab === "jogadores"}
          onClick={() => setActiveTab("jogadores")}
          icon={<Users className="size-4" />}
          label="Jogadores & Mestres"
          count={campaign.memberCount}
        />
        <TabButton
          active={activeTab === "visao-geral"}
          onClick={() => setActiveTab("visao-geral")}
          icon={<Info className="size-4" />}
          label="Sobre a Mesa"
        />
      </nav>

      {/* Conteúdo das Abas */}
      <div className="py-4">
        {activeTab === "fichas" && (
          <CharactersTab
            campaignId={campaign.id}
            myRole={campaign.myRole}
            currentUserId={currentUserId}
            selectedCharacterId={selectedCharacterId}
            onClearSelectedCharacter={() => setSelectedCharacterId(null)}
          />
        )}

        {activeTab === "jogadores" && (
          <PlayersTab
            campaignId={campaign.id}
            ownerId={campaign.ownerId}
            myRole={campaign.myRole}
            currentUserId={currentUserId}
            onOpenCharacterSheet={handleOpenCharacterFromPlayer}
          />
        )}

        {activeTab === "visao-geral" && (
          <div className="grid gap-8 py-4 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section aria-labelledby="sobre-heading">
                <h2
                  id="sobre-heading"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Sobre a campanha
                </h2>
                <p className="mt-2 leading-relaxed text-neutral-200">
                  {campaign.description ??
                    "O mestre ainda não escreveu uma descrição para esta campanha."}
                </p>
              </section>

              <section aria-labelledby="sistema-heading">
                <h2
                  id="sistema-heading"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Sistema de Regras
                </h2>
                <div className="mt-2 rounded-lg border border-white/10 p-4">
                  <h3 className="font-semibold text-white">
                    {campaign.gameSystem?.name ?? "Sistema Padrão / Genérico"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {campaign.gameSystem?.description ??
                      "Regras gerais de RPG adaptadas para a mesa."}
                  </p>
                </div>
              </section>
            </div>

            <aside aria-labelledby="detalhes-heading">
              <h2
                id="detalhes-heading"
                className="text-sm font-semibold text-muted-foreground"
              >
                Detalhes
              </h2>
              <dl className="mt-3 space-y-4 rounded-lg border border-white/10 p-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Sistema de jogo
                  </dt>
                  <dd className="mt-0.5">
                    {campaign.gameSystem?.name ?? "Sem sistema"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Mestre</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5">
                    <Crown className="size-3.5 text-neutral-300" aria-hidden />
                    {campaign.owner.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Criada em</dt>
                  <dd className="mt-0.5">{formatDate(campaign.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Atualizada em</dt>
                  <dd className="mt-0.5">{formatDate(campaign.updatedAt)}</dd>
                </div>
              </dl>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white text-black"
          : "text-muted-foreground hover:bg-white/10 hover:text-white",
      )}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.2 text-xs font-semibold tabular-nums",
            active ? "bg-black/15 text-black" : "bg-white/10 text-neutral-300",
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function StatCell({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="flex flex-col gap-1 px-2 py-4 first:pl-0 sm:px-4">
      <span className="flex items-center gap-2 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
        <span className="text-muted-foreground">{icon}</span>
        {value}
      </span>
      <span className="text-xs text-muted-foreground sm:text-sm">{label}</span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="py-6" aria-label="Carregando campanha">
      <Skeleton className="mb-4 h-8 w-28" />
      <Skeleton className="h-44 w-full rounded-lg sm:h-56" />
      <div className="mt-6 space-y-3 border-b border-white/10 pb-6">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-56" />
      </div>
      <div className="grid gap-8 py-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}

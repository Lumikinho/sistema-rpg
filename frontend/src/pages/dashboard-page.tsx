import { useMemo, useState } from "react"
import { Link } from "react-router"
import { Dices, Users, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CampaignCard } from "@/components/campaigns/campaign-card"
import { CreateCampaignDialog } from "@/components/campaigns/create-campaign-dialog"
import { useCampaigns } from "@/hooks/use-campaigns"
import { useAuth } from "@/store/auth"
import { cn } from "@/lib/utils"

type RoleFilter = "all" | "MASTER" | "PLAYER"

const filterOptions: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "MASTER", label: "Como mestre" },
  { value: "PLAYER", label: "Como jogador" },
]

export function DashboardPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<RoleFilter>("all")
  const { data: campaigns, isLoading, isError, refetch, isRefetching } = useCampaigns()

  const stats = useMemo(() => {
    const list = campaigns ?? []
    return {
      total: list.length,
      master: list.filter((campaign) => campaign.myRole === "MASTER").length,
      player: list.filter((campaign) => campaign.myRole === "PLAYER").length,
      members: list.reduce((sum, campaign) => sum + campaign.memberCount, 0),
    }
  }, [campaigns])

  const filtered = useMemo(() => {
    if (!campaigns) return []
    if (filter === "all") return campaigns
    return campaigns.filter((campaign) => campaign.myRole === filter)
  }, [campaigns, filter])

  const firstName = user?.name.trim().split(/\s+/)[0] ?? ""

  return (
    <div className="py-8">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Olá, {firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Suas campanhas e mesas em um só lugar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            className="text-xs"
            render={<Link to="/profile" />}
          >
            <User className="size-3.5 mr-1 text-muted-foreground" />
            Meu Perfil
          </Button>
          <CreateCampaignDialog />
        </div>
      </section>

      <section aria-label="Resumo" className="grid grid-cols-2 gap-3 border-b border-white/10 py-5 sm:grid-cols-4">
        <StatCell value={stats.total} label="Campanhas" />
        <StatCell value={stats.master} label="Como mestre" />
        <StatCell value={stats.player} label="Como jogador" />
        <StatCell value={stats.members} label="Membros nas suas mesas" />
      </section>

      <section className="py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Minhas campanhas</h2>
          <div
            role="group"
            aria-label="Filtrar campanhas"
            className="flex rounded-md border border-white/10 p-0.5"
          >
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
                className={cn(
                  "whitespace-nowrap rounded-[5px] px-2 py-1.5 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-white/60 sm:px-3 sm:text-sm",
                  filter === option.value && "bg-white text-black hover:text-black",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <CampaignGridSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-white/10 px-6 py-16 text-center">
            <p className="font-medium">Não deu para carregar suas campanhas.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Verifique sua conexão e se o servidor está no ar, depois tente de novo.
            </p>
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              {isRefetching ? "Tentando..." : "Tentar novamente"}
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState isFiltered={filter !== "all"} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 px-4 py-4 sm:px-5">
      <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</p>
    </div>
  )
}

function CampaignGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Carregando campanhas">
      {[0, 1, 2].map((index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-white/10">
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/15 px-6 py-16 text-center">
      {isFiltered ? (
        <>
          <Users className="size-8 text-white/30" strokeWidth={1.5} aria-hidden />
          <p className="font-medium">Nenhuma campanha nesse papel ainda.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Troque o filtro para ver o restante das suas campanhas.
          </p>
        </>
      ) : (
        <>
          <Dices className="size-8 text-white/30" strokeWidth={1.5} aria-hidden />
          <p className="font-medium">Nenhuma campanha por aqui</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Crie sua primeira campanha e reúna a mesa. Você entra como mestre dela.
          </p>
          <CreateCampaignDialog />
        </>
      )}
    </div>
  )
}

import { Link } from "react-router"
import { Dices, ScrollText, Users, CalendarDays } from "lucide-react"
import type { Campaign } from "@/types/campaign"
import { cn } from "@/lib/utils"

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const isMaster = campaign.myRole === "MASTER"

  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] outline-none transition-colors hover:border-white/25 focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <div className="relative h-36 overflow-hidden border-b border-white/10">
        {campaign.image ? (
          <img
            src={campaign.image}
            alt={`Capa de ${campaign.name}`}
            className="size-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-white/[0.02]">
            <Dices className="size-10 text-white/20" strokeWidth={1.5} aria-hidden />
          </div>
        )}
        <span
          className={cn(
            "absolute top-3 right-3 rounded-md px-2 py-0.5 text-xs font-medium",
            isMaster
              ? "bg-white text-black"
              : "border border-white/25 bg-black/60 text-neutral-200 backdrop-blur-[2px]",
          )}
        >
          {isMaster ? "Mestre" : "Jogador"}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div>
          <h3 className="line-clamp-1 font-semibold tracking-tight">{campaign.name}</h3>
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {campaign.gameSystem?.name ?? "Sem sistema de jogo"}
          </p>
        </div>

        {campaign.description && (
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {campaign.description}
          </p>
        )}

        <div className="mt-1 flex items-center gap-4 border-t border-white/5 pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5" title="Membros na campanha">
            <Users className="size-3.5" aria-hidden />
            {campaign.memberCount}
          </span>
          <span className="inline-flex items-center gap-1.5" title="Personagens criados">
            <ScrollText className="size-3.5" aria-hidden />
            {campaign.characterCount}
          </span>
          <span className="inline-flex items-center gap-1.5" title="Sessões registradas">
            <CalendarDays className="size-3.5" aria-hidden />
            {campaign.sessionCount}
          </span>
        </div>
      </div>
    </Link>
  )
}

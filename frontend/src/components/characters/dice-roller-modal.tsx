import { useState } from "react"
import { Dices, RotateCcw, Sparkles, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface RollRequest {
  title: string
  diceCount: number
  dieType: number
  modifier: number
  keepHighest?: boolean
}

export interface RollResult {
  id: string
  title: string
  diceCount: number
  dieType: number
  modifier: number
  rolls: number[]
  chosenRoll: number
  total: number
  isCritical: boolean
  isFumble: boolean
  timestamp: string
}

interface DiceRollerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialRoll?: RollRequest | null
}

const standardDice = [4, 6, 8, 10, 12, 20, 100]

export function DiceRollerModal({
  open,
  onOpenChange,
  initialRoll,
}: DiceRollerModalProps) {
  const [diceCount, setDiceCount] = useState<number>(initialRoll?.diceCount ?? 1)
  const [dieType, setDieType] = useState<number>(initialRoll?.dieType ?? 20)
  const [modifier, setModifier] = useState<number>(initialRoll?.modifier ?? 0)
  const [keepHighest, setKeepHighest] = useState<boolean>(
    initialRoll?.keepHighest ?? true,
  )
  const rollTitle = initialRoll?.title ?? "Rolagem de Teste"
  const [history, setHistory] = useState<RollResult[]>([])

  // Quando abre com initialRoll, atualiza estado e já rola
  const performRoll = (
    title: string = rollTitle,
    count: number = diceCount,
    type: number = dieType,
    mod: number = modifier,
    takeBest: boolean = keepHighest,
  ) => {
    const rolls: number[] = []
    for (let i = 0; i < Math.max(1, count); i++) {
      rolls.push(Math.floor(Math.random() * type) + 1)
    }

    const chosen = takeBest && rolls.length > 1 ? Math.max(...rolls) : rolls[0]
    const total =
      takeBest && rolls.length > 1
        ? chosen + mod
        : rolls.reduce((a, b) => a + b, 0) + mod

    const isCritical = rolls.some((r) => r === type)
    const isFumble = rolls.every((r) => r === 1)

    const result: RollResult = {
      id: Math.random().toString(36).slice(2),
      title: title || `Rolagem ${count}d${type}`,
      diceCount: count,
      dieType: type,
      modifier: mod,
      rolls,
      chosenRoll: chosen,
      total,
      isCritical,
      isFumble,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }

    setHistory((prev) => [result, ...prev.slice(0, 19)])
  }

  const latestResult = history[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dices className="size-5 text-indigo-400" />
            Rolador de Dados RPG
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Quick Dice Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Escolha o dado</Label>
            <div className="flex flex-wrap gap-1.5">
              {standardDice.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDieType(d)
                    if (d !== 20) setKeepHighest(false)
                  }}
                  className={`flex h-9 w-12 items-center justify-center rounded-md border text-xs font-semibold transition-colors ${
                    dieType === d
                      ? "border-white bg-white text-black font-bold"
                      : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  d{d}
                </button>
              ))}
            </div>
          </div>

          {/* Controls: Quantidade, Modificador, Pool Mode */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="dice-count" className="text-xs">
                Quantidade (Dados)
              </Label>
              <Input
                id="dice-count"
                type="number"
                min={1}
                max={30}
                value={diceCount}
                onChange={(e) => setDiceCount(Math.max(1, Number(e.target.value)))}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dice-mod" className="text-xs">
                Bônus / Modificador
              </Label>
              <Input
                id="dice-mod"
                type="number"
                value={modifier}
                onChange={(e) => setModifier(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col justify-end space-y-1">
              <button
                type="button"
                onClick={() => setKeepHighest(!keepHighest)}
                className={`flex h-9 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors ${
                  keepHighest
                    ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
                title="Pega o maior dado (padrão de Ordem Paranormal e Vantagem no D&D)"
              >
                {keepHighest ? "Maior Dado ✓" : "Somar Dados"}
              </button>
            </div>
          </div>

          {/* Action button */}
          <Button
            size="lg"
            className="w-full text-base font-semibold"
            onClick={() => performRoll()}
          >
            <Dices className="size-5 mr-1" />
            Rolar {diceCount}d{dieType}
            {modifier > 0 ? ` + ${modifier}` : modifier < 0 ? ` - ${Math.abs(modifier)}` : ""}
          </Button>

          {/* Latest Result Display */}
          {latestResult && (
            <div
              className={`relative overflow-hidden rounded-lg border p-4 text-center transition-all ${
                latestResult.isCritical
                  ? "border-emerald-500/40 bg-emerald-950/30"
                  : latestResult.isFumble
                    ? "border-red-500/40 bg-red-950/30"
                    : "border-white/15 bg-white/5"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {latestResult.title}
              </p>

              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-white tabular-nums">
                  {latestResult.total}
                </span>

                {latestResult.isCritical && (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                    <Sparkles className="size-3.5" />
                    Crítico!
                  </span>
                )}
                {latestResult.isFumble && (
                  <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">
                    <AlertCircle className="size-3.5" />
                    Desastre!
                  </span>
                )}
              </div>

              {/* Individual dice results */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <span>Dados rolados:</span>
                {latestResult.rolls.map((r, idx) => (
                  <span
                    key={idx}
                    className={`inline-block rounded px-1.5 py-0.5 font-mono text-xs ${
                      r === latestResult.chosenRoll && latestResult.rolls.length > 1
                        ? "bg-white text-black font-bold"
                        : "bg-white/10 text-neutral-300"
                    }`}
                  >
                    {r}
                  </span>
                ))}
                {latestResult.modifier !== 0 && (
                  <span className="font-mono">
                    {latestResult.modifier > 0
                      ? `+ ${latestResult.modifier}`
                      : `- ${Math.abs(latestResult.modifier)}`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 1 && (
            <div className="space-y-2 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Histórico recente</span>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="flex items-center gap-1 hover:text-white"
                >
                  <RotateCcw className="size-3" />
                  Limpar
                </button>
              </div>

              <div className="max-h-32 space-y-1.5 overflow-y-auto pr-1">
                {history.slice(1).map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between rounded bg-white/[0.03] px-2.5 py-1 text-xs"
                  >
                    <span className="truncate text-neutral-300 font-medium">
                      {h.title} ({h.diceCount}d{h.dieType}
                      {h.modifier !== 0 ? (h.modifier > 0 ? `+${h.modifier}` : `${h.modifier}`) : ""})
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {h.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

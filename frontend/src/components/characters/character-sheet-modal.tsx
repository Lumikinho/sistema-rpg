import { useState, useEffect, useMemo } from "react"
import {
  Heart,
  Brain,
  Zap,
  Shield,
  Dices,
  Lock,
  Unlock,
  Save,
  Check,
  Search,
  Plus,
  Minus,
  Sparkles,
  Sword,
  Backpack,
  FileText,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { DiceRollerModal, type RollRequest } from "./dice-roller-modal"
import { useCharacter, useUpdateCharacter } from "@/hooks/use-characters"
import { cn } from "@/lib/utils"
import type { FieldCategory, FieldDefinition } from "@/types/template"

interface CharacterSheetModalProps {
  campaignId: string
  characterId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isMaster: boolean
}

type TabKey =
  | "atributos"
  | "pericias"
  | "combate"
  | "habilidades"
  | "inventario"
  | "geral"
  | "notas"

export function CharacterSheetModal({
  campaignId,
  characterId,
  open,
  onOpenChange,
  isMaster,
}: CharacterSheetModalProps) {
  const { data: character, isLoading, isError, refetch } = useCharacter(
    campaignId,
    characterId ?? "",
  )
  const updateCharacter = useUpdateCharacter(campaignId)

  const [activeTab, setActiveTab] = useState<TabKey>("atributos")
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [charName, setCharName] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [skillSearch, setSkillSearch] = useState("")

  // Rolador de dados
  const [diceOpen, setDiceOpen] = useState(false)
  const [activeRoll, setActiveRoll] = useState<RollRequest | null>(null)

  useEffect(() => {
    if (character) {
      setFormData(character.sheetData ?? {})
      setCharName(character.name)
    }
  }, [character])

  const canEdit = isMaster || (character?.canEdit && !character?.isLocked)

  const handleFieldChange = (key: string, value: any) => {
    if (!canEdit) return
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
    setSaveSuccess(false)
  }

  const handleNumberAdjust = (key: string, delta: number, min = 0, max?: number) => {
    if (!canEdit) return
    const current = Number(formData[key] ?? 0)
    let next = current + delta
    if (min !== undefined && next < min) next = min
    if (max !== undefined && next > max) next = max
    handleFieldChange(key, next)
  }

  const handleSave = async () => {
    if (!characterId) return
    await updateCharacter.mutateAsync({
      characterId,
      data: {
        name: charName,
        sheetData: formData,
      },
    })
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleToggleLock = async () => {
    if (!characterId || !isMaster) return
    await updateCharacter.mutateAsync({
      characterId,
      data: {
        isLocked: !character?.isLocked,
      },
    })
  }

  // Prepara rolagem de atributo
  const handleRollAttribute = (attrLabel: string, score: number) => {
    const diceCount = Math.max(1, score)
    setActiveRoll({
      title: `Teste de ${attrLabel}`,
      diceCount,
      dieType: 20,
      modifier: 0,
      keepHighest: true,
    })
    setDiceOpen(true)
  }

  // Prepara rolagem de perícia
  const handleRollSkill = (skillLabel: string, bonus: number) => {
    setActiveRoll({
      title: `Teste de ${skillLabel}`,
      diceCount: 1,
      dieType: 20,
      modifier: bonus,
      keepHighest: false,
    })
    setDiceOpen(true)
  }

  // Extrai campos agrupados por categoria
  const {
    attributeFields,
    vitalFields,
    skillFields,
    generalFields,
    combatFields,
    customFields,
    inventoryFields,
    backgroundFields,
  } = useMemo(() => {
    const fields: FieldDefinition[] = []
    if (character?.version?.sections) {
      for (const s of character.version.sections) {
        if (s.fields) fields.push(...s.fields)
      }
    }

    const byCategory = (cat: FieldCategory) =>
      fields.filter((f) => f.category === cat)

    return {
      attributeFields: byCategory("ATTRIBUTE"),
      vitalFields: byCategory("STATISTIC"),
      skillFields: byCategory("SKILL"),
      generalFields: byCategory("GENERAL"),
      combatFields: byCategory("COMBAT"),
      customFields: byCategory("CUSTOM"),
      inventoryFields: byCategory("INVENTORY"),
      backgroundFields: byCategory("BACKGROUND"),
    }
  }, [character])

  const filteredSkills = useMemo(() => {
    if (!skillSearch.trim()) return skillFields
    return skillFields.filter((s) =>
      s.label.toLowerCase().includes(skillSearch.toLowerCase()),
    )
  }, [skillFields, skillSearch])

  // Identifica vitais principais
  const pvAtual = Number(formData["pv_atual"] ?? 20)
  const pvMax = Number(formData["pv_max"] ?? 20)
  const peAtual = Number(formData["pe_atual"] ?? formData["pm_atual"] ?? 4)
  const peMax = Number(formData["pe_max"] ?? formData["pm_max"] ?? 4)
  const sanAtual = Number(formData["san_atual"] ?? 20)
  const sanMax = Number(formData["san_max"] ?? 20)
  const hasSanidade = "san_atual" in formData || vitalFields.some((f) => f.key === "san_atual")

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl h-[92vh] max-h-[92vh] overflow-hidden p-0 flex flex-col rounded-xl border border-white/15 bg-neutral-950 shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{charName || "Ficha de Personagem"}</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : isError || !character ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-medium">Erro ao carregar a ficha.</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              {/* Header com padding right reservado para o botão X de fechar */}
              <div className="border-b border-white/10 bg-neutral-900/90 px-4 py-3 sm:px-6 sm:py-4 pr-14 relative flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={charName}
                      onChange={(e) => setCharName(e.target.value)}
                      disabled={!canEdit}
                      className="bg-transparent text-lg sm:text-2xl font-bold tracking-tight text-white focus:outline-none focus:ring-1 focus:ring-white/40 rounded px-1 -ml-1 truncate max-w-[200px] sm:max-w-sm md:max-w-md"
                      placeholder="Nome do Personagem"
                    />
                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold text-neutral-300 shrink-0">
                      {character.type}
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {character.owner
                      ? `Jogador: ${character.owner.name}`
                      : "Sem jogador (Mestre)"}
                    {" · "}
                    {character.template?.name}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveRoll(null)
                      setDiceOpen(true)
                    }}
                    className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 text-xs sm:text-sm"
                  >
                    <Dices className="size-4 mr-1 text-indigo-400" />
                    Rolar Dados
                  </Button>

                  {isMaster && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleLock}
                      title={character.isLocked ? "Desbloquear ficha" : "Bloquear ficha"}
                      className={character.isLocked ? "text-amber-400 text-xs sm:text-sm" : "text-muted-foreground text-xs sm:text-sm"}
                    >
                      {character.isLocked ? (
                        <Lock className="size-4 mr-1" />
                      ) : (
                        <Unlock className="size-4 mr-1" />
                      )}
                      <span className="hidden sm:inline">
                        {character.isLocked ? "Bloqueada" : "Livre"}
                      </span>
                    </Button>
                  )}

                  {canEdit && (
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateCharacter.isPending}
                      className={cn(
                        "text-xs sm:text-sm",
                        saveSuccess ? "bg-emerald-600 hover:bg-emerald-700" : ""
                      )}
                    >
                      {saveSuccess ? (
                        <>
                          <Check className="size-4 mr-1" /> Salvo!
                        </>
                      ) : (
                        <>
                          <Save className="size-4 mr-1" /> Salvar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Vitais Rápidos (PV, SAN/PE, Defesa) - 2x2 no mobile, 4 colunas em telas maiores */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 border-b border-white/10 bg-neutral-950/70 p-3 sm:p-4">
                {/* Pontos de Vida */}
                <div className="rounded-lg border border-red-500/25 bg-red-950/20 p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-semibold text-red-400">
                    <span className="flex items-center gap-1.5 truncate">
                      <Heart className="size-3.5 shrink-0" /> Vida (PV)
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-red-300/80">
                      {pvAtual} / {pvMax}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleNumberAdjust("pv_atual", -1, 0, pvMax)}
                      className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-40 transition-colors"
                      title="Diminuir PV"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <input
                      type="number"
                      value={pvAtual}
                      disabled={!canEdit}
                      onChange={(e) => handleFieldChange("pv_atual", Number(e.target.value))}
                      className="w-14 sm:w-16 h-7 sm:h-8 rounded bg-black/50 text-center font-mono text-base font-bold text-white focus:outline-none focus:ring-1 focus:ring-white/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleNumberAdjust("pv_atual", 1, 0, pvMax)}
                      className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-40 transition-colors"
                      title="Aumentar PV"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sanidade (se houver) */}
                {hasSanidade && (
                  <div className="rounded-lg border border-purple-500/25 bg-purple-950/20 p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-semibold text-purple-400">
                      <span className="flex items-center gap-1.5 truncate">
                        <Brain className="size-3.5 shrink-0" /> Sanidade (SAN)
                      </span>
                      <span className="font-mono tabular-nums text-[11px] text-purple-300/80">
                        {sanAtual} / {sanMax}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() => handleNumberAdjust("san_atual", -1, 0, sanMax)}
                        className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 disabled:opacity-40 transition-colors"
                        title="Diminuir Sanidade"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <input
                        type="number"
                        value={sanAtual}
                        disabled={!canEdit}
                        onChange={(e) => handleFieldChange("san_atual", Number(e.target.value))}
                        className="w-14 sm:w-16 h-7 sm:h-8 rounded bg-black/50 text-center font-mono text-base font-bold text-white focus:outline-none focus:ring-1 focus:ring-white/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() => handleNumberAdjust("san_atual", 1, 0, sanMax)}
                        className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 disabled:opacity-40 transition-colors"
                        title="Aumentar Sanidade"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Pontos de Esforço / Mana */}
                <div className="rounded-lg border border-amber-500/25 bg-amber-950/20 p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                    <span className="flex items-center gap-1.5 truncate">
                      <Zap className="size-3.5 shrink-0" /> {hasSanidade ? "Esforço (PE)" : "Mana (PM)"}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-amber-300/80">
                      {peAtual} / {peMax}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleNumberAdjust("pe_atual", -1, 0, peMax)}
                      className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 disabled:opacity-40 transition-colors"
                      title="Diminuir Esforço"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <input
                      type="number"
                      value={peAtual}
                      disabled={!canEdit}
                      onChange={(e) => handleFieldChange("pe_atual", Number(e.target.value))}
                      className="w-14 sm:w-16 h-7 sm:h-8 rounded bg-black/50 text-center font-mono text-base font-bold text-white focus:outline-none focus:ring-1 focus:ring-white/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleNumberAdjust("pe_atual", 1, 0, peMax)}
                      className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 disabled:opacity-40 transition-colors"
                      title="Aumentar Esforço"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Defesa */}
                <div className="rounded-lg border border-blue-500/25 bg-blue-950/20 p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                    <span className="flex items-center gap-1.5 truncate">
                      <Shield className="size-3.5 shrink-0" /> Defesa
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <input
                      type="number"
                      value={formData["defesa"] ?? formData["ca_defesa"] ?? 11}
                      disabled={!canEdit}
                      onChange={(e) =>
                        handleFieldChange(
                          "defesa" in formData ? "defesa" : "ca_defesa",
                          Number(e.target.value),
                        )
                      }
                      className="w-20 h-7 sm:h-8 rounded bg-black/50 text-center font-mono text-lg font-black text-white focus:outline-none focus:ring-1 focus:ring-white/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Tabs - com rolagem horizontal suave no mobile */}
              <div className="flex border-b border-white/10 bg-neutral-900/50 px-2 sm:px-4 text-xs font-medium overflow-x-auto no-scrollbar scroll-smooth gap-0.5">
                <TabButton
                  active={activeTab === "atributos"}
                  onClick={() => setActiveTab("atributos")}
                  icon={<Sparkles className="size-3.5" />}
                  label="Atributos"
                />
                <TabButton
                  active={activeTab === "pericias"}
                  onClick={() => setActiveTab("pericias")}
                  icon={<Shield className="size-3.5" />}
                  label="Perícias"
                />
                <TabButton
                  active={activeTab === "combate"}
                  onClick={() => setActiveTab("combate")}
                  icon={<Sword className="size-3.5" />}
                  label="Combate & Armas"
                />
                <TabButton
                  active={activeTab === "habilidades"}
                  onClick={() => setActiveTab("habilidades")}
                  icon={<Zap className="size-3.5" />}
                  label="Habilidades & Rituais"
                />
                <TabButton
                  active={activeTab === "inventario"}
                  onClick={() => setActiveTab("inventario")}
                  icon={<Backpack className="size-3.5" />}
                  label="Inventário"
                />
                <TabButton
                  active={activeTab === "geral"}
                  onClick={() => setActiveTab("geral")}
                  icon={<User className="size-3.5" />}
                  label="Dados Gerais"
                />
                <TabButton
                  active={activeTab === "notas"}
                  onClick={() => setActiveTab("notas")}
                  icon={<FileText className="size-3.5" />}
                  label="História & Notas"
                />
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* ABA ATRIBUTOS */}
                {activeTab === "atributos" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-200">
                        Atributos do Personagem
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Clique em qualquer atributo para rolar o teste automaticamente com dados de RPG.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                      {attributeFields.map((attr) => {
                        const score = Number(formData[attr.key] ?? attr.defaultValue ?? 1)
                        return (
                          <div
                            key={attr.key}
                            className="group relative flex flex-col items-center justify-between rounded-xl border border-white/10 bg-neutral-900/60 p-3 sm:p-4 transition-all hover:border-white/30 hover:bg-neutral-900"
                          >
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                              {attr.label}
                            </span>

                            <div className="my-2 sm:my-3 flex items-center justify-center gap-1.5">
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => handleNumberAdjust(attr.key, -1, attr.min ?? 0, attr.max ?? undefined)}
                                  className="size-7 rounded text-muted-foreground hover:bg-white/10 flex items-center justify-center text-sm font-bold transition-colors"
                                  title="Diminuir"
                                >
                                  -
                                </button>
                              )}
                              <span className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums px-2">
                                {score}
                              </span>
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => handleNumberAdjust(attr.key, 1, attr.min ?? 0, attr.max ?? undefined)}
                                  className="size-7 rounded text-muted-foreground hover:bg-white/10 flex items-center justify-center text-sm font-bold transition-colors"
                                  title="Aumentar"
                                >
                                  +
                                </button>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs font-medium border-white/15 group-hover:border-white/40 h-8"
                              onClick={() => handleRollAttribute(attr.label, score)}
                            >
                              <Dices className="size-3.5 mr-1 text-indigo-400" />
                              Rolar ({score}d20)
                            </Button>
                          </div>
                        )
                      })}
                    </div>

                    {/* Outras estatísticas vitais detalhadas */}
                    {vitalFields.filter(
                      (f) =>
                        ![
                          "pv_atual",
                          "pv_max",
                          "pe_atual",
                          "pe_max",
                          "pm_atual",
                          "pm_max",
                          "san_atual",
                          "san_max",
                          "defesa",
                          "ca_defesa",
                        ].includes(f.key),
                    ).length > 0 && (
                      <div className="rounded-lg border border-white/10 bg-neutral-900/40 p-4 space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Defesas e Estatísticas Adicionais
                        </h4>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {vitalFields
                            .filter(
                              (f) =>
                                ![
                                  "pv_atual",
                                  "pv_max",
                                  "pe_atual",
                                  "pe_max",
                                  "pm_atual",
                                  "pm_max",
                                  "san_atual",
                                  "san_max",
                                  "defesa",
                                  "ca_defesa",
                                ].includes(f.key),
                            )
                            .map((f) => (
                              <div key={f.key} className="space-y-1">
                                <Label className="text-xs">{f.label}</Label>
                                <Input
                                  type="number"
                                  value={formData[f.key] ?? f.defaultValue ?? 0}
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    handleFieldChange(f.key, Number(e.target.value))
                                  }
                                  className="h-8 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ABA PERÍCIAS */}
                {activeTab === "pericias" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-200">
                          Perícias e Treinamentos
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Valores somados como bônus nos testes da perícia (+0, +5, +10...).
                        </p>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Filtrar perícia..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          className="h-8 pl-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                      {filteredSkills.map((skill) => {
                        const bonus = Number(formData[skill.key] ?? skill.defaultValue ?? 0)
                        return (
                          <div
                            key={skill.key}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2 text-xs hover:border-white/20 transition-colors"
                          >
                            <span className="font-medium text-neutral-200 truncate pr-2">
                              {skill.label}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                              {canEdit ? (
                                <input
                                  type="number"
                                  value={bonus}
                                  onChange={(e) =>
                                    handleFieldChange(skill.key, Number(e.target.value))
                                  }
                                  className="w-12 h-7 rounded bg-black/50 px-1 py-0.5 text-center font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-white/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              ) : (
                                <span className="font-mono font-bold text-white text-xs w-12 text-center">
                                  {bonus >= 0 ? `+${bonus}` : bonus}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRollSkill(skill.label, bonus)}
                                className="flex size-7 items-center justify-center rounded border border-white/15 bg-white/5 text-neutral-300 hover:border-white/40 hover:bg-white/15 hover:text-white transition-colors"
                                title={`Rolar teste de ${skill.label}`}
                              >
                                <Dices className="size-3.5 text-indigo-400" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ABA COMBATE & ARMAS */}
                {activeTab === "combate" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-200">
                        Ataques, Armas e Combate
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Armas equipadas, rolagens de dano, alcance e efeitos críticos.
                      </p>
                    </div>

                    {combatFields.map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <Label htmlFor={`field-${f.key}`}>{f.label}</Label>
                        <Textarea
                          id={`field-${f.key}`}
                          rows={6}
                          disabled={!canEdit}
                          value={formData[f.key] ?? f.defaultValue ?? ""}
                          onChange={(e) => handleFieldChange(f.key, e.target.value)}
                          placeholder="Descreva suas armas, dano e bônus de ataque..."
                          className="font-mono text-xs sm:text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* ABA HABILIDADES & RITUAIS */}
                {activeTab === "habilidades" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-200">
                        Habilidades, Poderes e Rituais / Magias
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Poderes de classe, habilidades concedidas pela origem e rituais aprendidos.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customFields.map((f) => (
                        <div key={f.key} className="space-y-1.5">
                          <Label htmlFor={`field-${f.key}`}>{f.label}</Label>
                          <Textarea
                            id={`field-${f.key}`}
                            rows={8}
                            disabled={!canEdit}
                            value={formData[f.key] ?? f.defaultValue ?? ""}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            placeholder={`Descreva ${f.label.toLowerCase()}...`}
                            className="font-mono text-xs sm:text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ABA INVENTÁRIO */}
                {activeTab === "inventario" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-200">
                        Inventário e Carga
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Equipamentos, ferramentas, munições e pertences pessoais.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 max-w-md">
                      {inventoryFields
                        .filter((f) => f.type === "NUMBER")
                        .map((f) => (
                          <div key={f.key} className="space-y-1">
                            <Label className="text-xs">{f.label}</Label>
                            <Input
                              type="number"
                              value={formData[f.key] ?? f.defaultValue ?? 0}
                              disabled={!canEdit}
                              onChange={(e) =>
                                handleFieldChange(f.key, Number(e.target.value))
                              }
                              className="h-8 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        ))}
                    </div>

                    {inventoryFields
                      .filter((f) => f.type === "TEXTAREA" || f.type === "TEXT")
                      .map((f) => (
                        <div key={f.key} className="space-y-1.5">
                          <Label htmlFor={`field-${f.key}`}>{f.label}</Label>
                          <Textarea
                            id={`field-${f.key}`}
                            rows={8}
                            disabled={!canEdit}
                            value={formData[f.key] ?? f.defaultValue ?? ""}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            placeholder="Liste seus itens aqui..."
                            className="font-mono text-xs sm:text-sm"
                          />
                        </div>
                      ))}
                  </div>
                )}

                {/* ABA DADOS GERAIS */}
                {activeTab === "geral" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-200">
                        Dados Gerais e Conceito
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Classe, trilha, patente, origem e outras características básicas.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {generalFields.map((f) => {
                        const val = formData[f.key] ?? f.defaultValue ?? ""
                        if (f.options && Array.isArray(f.options)) {
                          return (
                            <div key={f.key} className="space-y-1.5">
                              <Label className="text-xs">{f.label}</Label>
                              <select
                                value={val}
                                disabled={!canEdit}
                                onChange={(e) => handleFieldChange(f.key, e.target.value)}
                                className="w-full h-9 rounded-md border border-white/10 bg-neutral-900 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/40"
                              >
                                {f.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )
                        }

                        return (
                          <div key={f.key} className="space-y-1.5">
                            <Label className="text-xs">{f.label}</Label>
                            <Input
                              type={f.type === "NUMBER" ? "number" : "text"}
                              value={val}
                              disabled={!canEdit}
                              onChange={(e) =>
                                handleFieldChange(
                                  f.key,
                                  f.type === "NUMBER" ? Number(e.target.value) : e.target.value,
                                )
                              }
                              className="h-9 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ABA NOTAS */}
                {activeTab === "notas" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-200">
                        Histórico e Anotações
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Passado, personalidade, pistas investigadas e segredos do personagem.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {backgroundFields.map((f) => (
                        <div key={f.key} className="space-y-1.5">
                          <Label htmlFor={`field-${f.key}`}>{f.label}</Label>
                          <Textarea
                            id={`field-${f.key}`}
                            rows={8}
                            disabled={!canEdit}
                            value={formData[f.key] ?? f.defaultValue ?? ""}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            placeholder={`Escreva ${f.label.toLowerCase()}...`}
                            className="font-mono text-xs sm:text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Rolador de Dados */}
      <DiceRollerModal
        open={diceOpen}
        onOpenChange={setDiceOpen}
        initialRoll={activeRoll}
      />
    </>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 border-b-2 px-3 py-2.5 transition-colors whitespace-nowrap text-xs sm:text-sm shrink-0",
        active
          ? "border-white text-white font-medium bg-white/[0.04]"
          : "border-transparent text-muted-foreground hover:text-neutral-200 hover:bg-white/[0.02]",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, User, Bot, Skull, PawPrint } from "lucide-react"

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
import { useCreateCharacter } from "@/hooks/use-characters"
import { useCampaignMembers } from "@/hooks/use-campaign-members"
import type { CharacterType } from "@/types/character"

const createCharacterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome do personagem é obrigatório.")
    .max(120, "Nome muito longo."),
  type: z.enum(["PLAYER", "NPC", "MONSTER", "COMPANION"]),
  ownerId: z.string().optional(),
})

type CreateCharacterFormValues = z.infer<typeof createCharacterSchema>

interface CreateCharacterDialogProps {
  campaignId: string
  isMaster: boolean
  currentUserId: string
  onCharacterCreated?: (characterId: string) => void
}

const UNASSIGNED = "none"

export function CreateCharacterDialog({
  campaignId,
  isMaster,
  currentUserId,
  onCharacterCreated,
}: CreateCharacterDialogProps) {
  const [open, setOpen] = useState(false)
  const createCharacter = useCreateCharacter(campaignId)
  const { data: members } = useCampaignMembers(campaignId)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateCharacterFormValues>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: {
      name: "",
      type: "PLAYER",
      ownerId: isMaster ? UNASSIGNED : currentUserId,
    },
  })

  const currentType = watch("type")
  const currentOwner = watch("ownerId")

  const onSubmit = async (values: CreateCharacterFormValues) => {
    const ownerId =
      values.ownerId && values.ownerId !== UNASSIGNED
        ? values.ownerId
        : isMaster
          ? null
          : currentUserId

    const character = await createCharacter.mutateAsync({
      name: values.name,
      type: values.type as CharacterType,
      ownerId,
    })

    reset()
    setOpen(false)
    if (onCharacterCreated && character?.id) {
      onCharacterCreated(character.id)
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          reset({
            name: "",
            type: "PLAYER",
            ownerId: isMaster ? UNASSIGNED : currentUserId,
          })
          setOpen(true)
        }}
      >
        <Plus className="size-4" aria-hidden />
        Nova Ficha
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Ficha de Personagem</DialogTitle>
            <DialogDescription>
              Crie uma ficha integrada com o sistema de regras desta mesa.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="char-name">Nome do Personagem</Label>
              <Input
                id="char-name"
                placeholder="Ex: Arthur Cervero, Thiago Fritz..."
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="char-type">Tipo de Ficha</Label>
              <Select
                value={currentType}
                onValueChange={(val) =>
                  setValue("type", val as CharacterType)
                }
              >
                <SelectTrigger id="char-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLAYER">
                    <span className="flex items-center gap-2">
                      <User className="size-3.5 text-blue-400" />
                      Personagem de Jogador (PJ)
                    </span>
                  </SelectItem>
                  {isMaster && (
                    <>
                      <SelectItem value="NPC">
                        <span className="flex items-center gap-2">
                          <Bot className="size-3.5 text-amber-400" />
                          NPC (Personagem Não Jogável)
                        </span>
                      </SelectItem>
                      <SelectItem value="MONSTER">
                        <span className="flex items-center gap-2">
                          <Skull className="size-3.5 text-red-400" />
                          Criatura / Monstro
                        </span>
                      </SelectItem>
                      <SelectItem value="COMPANION">
                        <span className="flex items-center gap-2">
                          <PawPrint className="size-3.5 text-emerald-400" />
                          Aliado / Ajudante
                        </span>
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {isMaster && (
              <div className="space-y-1.5">
                <Label htmlFor="char-owner">Jogador Responsável</Label>
                <Select
                  value={currentOwner ?? UNASSIGNED}
                  onValueChange={(val) => setValue("ownerId", val ?? UNASSIGNED)}
                >
                  <SelectTrigger id="char-owner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>
                      Sem jogador (Controlado pelo Mestre)
                    </SelectItem>
                    {members?.map((m) => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.user.name} ({m.role === "MASTER" ? "Mestre" : "Jogador"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createCharacter.isPending}>
                {createCharacter.isPending ? "Criando..." : "Criar Ficha"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

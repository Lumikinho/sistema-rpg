import { useState } from "react"
import { UserCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAssignCharacter } from "@/hooks/use-characters"
import { useCampaignMembers } from "@/hooks/use-campaign-members"
import type { Character } from "@/types/character"

interface AssignCharacterDialogProps {
  campaignId: string
  character: Character
  open: boolean
  onOpenChange: (open: boolean) => void
}

const UNASSIGNED = "none"

export function AssignCharacterDialog({
  campaignId,
  character,
  open,
  onOpenChange,
}: AssignCharacterDialogProps) {
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(
    character.ownerId ?? UNASSIGNED,
  )

  const assign = useAssignCharacter(campaignId)
  const { data: members } = useCampaignMembers(campaignId)

  const handleSave = async () => {
    const ownerId = selectedOwnerId === UNASSIGNED ? null : selectedOwnerId
    await assign.mutateAsync({
      characterId: character.id,
      ownerId,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="size-5 text-emerald-400" />
            Atribuir Jogador a {character.name}
          </DialogTitle>
          <DialogDescription>
            Escolha qual jogador terá permissão para visualizar e editar esta ficha.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="assign-owner">Jogador na mesa</Label>
            <Select
              value={selectedOwnerId}
              onValueChange={(val) => setSelectedOwnerId(val ?? UNASSIGNED)}
            >
              <SelectTrigger id="assign-owner">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>
                  Nenhum jogador (Apenas Mestre)
                </SelectItem>
                {members?.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.user.name} ({m.user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={assign.isPending}>
            {assign.isPending ? "Salvando..." : "Salvar Atribuição"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

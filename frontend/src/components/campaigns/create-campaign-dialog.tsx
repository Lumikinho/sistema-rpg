import { useState } from "react"
import { useNavigate } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dices, Plus } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateCampaign, useGameSystems } from "@/hooks/use-campaigns"

const createCampaignFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome da campanha")
    .max(120, "Nome muito longo"),
  description: z
    .string()
    .trim()
    .max(2000, "Descrição muito longa")
    .optional(),
  image: z
    .string()
    .trim()
    .url("Informe uma URL válida, começando com http:// ou https://")
    .optional()
    .or(z.literal("")),
  gameSystemId: z.string().optional(),
})

type CreateCampaignFormValues = z.infer<typeof createCampaignFormSchema>

const NO_SYSTEM = "none"

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const createCampaign = useCreateCampaign()
  const { data: gameSystems, isLoading: loadingSystems } = useGameSystems()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateCampaignFormValues>({
    resolver: zodResolver(createCampaignFormSchema),
    defaultValues: { name: "", description: "", image: "", gameSystemId: NO_SYSTEM },
  })

  const onSubmit = async (values: CreateCampaignFormValues) => {
    try {
      const campaign = await createCampaign.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        image: values.image || undefined,
        gameSystemId:
          values.gameSystemId && values.gameSystemId !== NO_SYSTEM
            ? values.gameSystemId
            : undefined,
      })
      setOpen(false)
      reset()
      navigate(`/campaigns/${campaign.id}`)
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error ? error.message : "Não foi possível criar a campanha",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        Nova campanha
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar campanha</DialogTitle>
          <DialogDescription>
            Você entra como mestre da campanha assim que ela for criada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="campaign-name">Nome</Label>
            <Input
              id="campaign-name"
              autoFocus
              placeholder="A Queda de Arton"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="campaign-description">Descrição (opcional)</Label>
            <Textarea
              id="campaign-description"
              placeholder="O que está rolando nessa mesa?"
              rows={3}
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="campaign-system">Sistema de jogo</Label>
            <Controller
              control={control}
              name="gameSystemId"
              render={({ field }) => {
                const items = [
                  { value: NO_SYSTEM, label: "Sem sistema" },
                  ...(gameSystems?.map((system) => ({
                    value: system.id,
                    label: system.name,
                  })) ?? []),
                ]
                return (
                  <Select items={items} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="campaign-system" className="w-full">
                      <SelectValue placeholder="Sem sistema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SYSTEM}>Sem sistema</SelectItem>
                      {gameSystems?.map((system) => (
                        <SelectItem key={system.id} value={system.id}>
                          {system.name}
                        </SelectItem>
                      ))}
                      {loadingSystems && (
                        <SelectItem value="loading" disabled>
                          Carregando sistemas...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )
              }}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="campaign-image">Imagem de capa (URL, opcional)</Label>
            <Input
              id="campaign-image"
              type="url"
              placeholder="https://exemplo.com/capa.png"
              aria-invalid={Boolean(errors.image)}
              {...register("image")}
            />
            {errors.image ? (
              <p className="text-sm text-destructive">{errors.image.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Cole o endereço de uma imagem. Sem ela, usamos um marcador padrão.
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-destructive" role="alert">
              {errors.root.message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                reset()
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || createCampaign.isPending}>
              <Dices aria-hidden />
              {isSubmitting || createCampaign.isPending ? "Criando..." : "Criar campanha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

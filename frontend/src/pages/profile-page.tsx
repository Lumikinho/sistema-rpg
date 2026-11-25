import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  User,
  Mail,
  Image as ImageIcon,
  Shield,
  KeyRound,
  Check,
  AlertCircle,
  Dices,
  Crown,
  ScrollText,
  LogOut,
  Calendar,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { PasswordField } from "@/components/auth/password-field"
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/use-profile"
import { useAuth } from "@/store/auth"
import { formatDate, initials } from "@/lib/format"
import { ApiError } from "@/lib/api"
import { cn } from "@/lib/utils"

const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter no mínimo 2 caracteres.")
    .max(100, "Nome muito longo."),
  email: z.string().trim().email("Digite um e-mail válido."),
  avatar: z
    .string()
    .trim()
    .url("Informe uma URL de imagem válida.")
    .optional()
    .or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const avatarPresets = [
  {
    name: "Detetive",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Guerreiro",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Ocultista",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Especialista",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
]

export function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { data, isLoading, isError, refetch } = useProfile()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  // Estados de feedback de perfil
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Estados de senha
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      avatar: "",
    },
  })

  const currentAvatar = watch("avatar")

  useEffect(() => {
    if (data?.user) {
      reset({
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar ?? "",
      })
    }
  }, [data, reset])

  const onSubmitProfile = async (values: ProfileFormValues) => {
    setProfileError(null)
    setProfileSuccess(false)
    try {
      await updateProfile.mutateAsync({
        name: values.name,
        email: values.email,
        avatar: values.avatar || null,
      })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 4000)
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileError(err.message)
      } else {
        setProfileError("Não foi possível atualizar seus dados.")
      }
    }
  }

  const onSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!currentPassword) {
      setPasswordError("Informe sua senha atual.")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("A nova senha deve ter no mínimo 8 caracteres.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("A confirmação da senha não coincide com a nova senha.")
      return
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        password: newPassword,
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 4000)
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordError(err.message)
      } else {
        setPasswordError("Não foi possível alterar a senha.")
      }
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (isError || !data?.user) {
    return (
      <div className="py-16 text-center">
        <p className="font-medium text-white">Não foi possível carregar seu perfil.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Verifique sua conexão e tente novamente.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  const { user, stats } = data
  const isMaster = user.role === "MASTER"

  return (
    <div className="py-6 space-y-8">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        className="-ml-2 text-muted-foreground hover:text-white"
        render={<Link to="/" />}
      >
        <ArrowLeft className="size-4 mr-1" />
        Voltar para Campanhas
      </Button>

      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Gerenciamento de Conta
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie suas informações de perfil, avatar de jogo e segurança de acesso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Coluna Principal: Formulários de Dados Pessoais e Senha */}
        <div className="space-y-8 lg:col-span-2">
          {/* Card: Dados do Perfil */}
          <section
            aria-labelledby="dados-perfil-heading"
            className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <User className="size-5 text-indigo-400" />
              <div>
                <h2
                  id="dados-perfil-heading"
                  className="text-base font-semibold text-white"
                >
                  Informações Pessoais
                </h2>
                <p className="text-xs text-muted-foreground">
                  Estes dados serão visíveis para outros jogadores nas mesas em que você participa.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmitProfile)} className="mt-6 space-y-6">
              {profileSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-3.5 text-sm text-emerald-400">
                  <Check className="size-4 shrink-0" />
                  <span>Seus dados foram atualizados com sucesso!</span>
                </div>
              )}

              {profileError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/30 p-3.5 text-sm text-red-400">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Avatar Preview & Custom URL */}
              <div className="space-y-3">
                <Label>Foto / Avatar de Perfil</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Visualizador de Avatar */}
                  <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-white/5 shadow-inner">
                    {currentAvatar ? (
                      <img
                        src={currentAvatar}
                        alt="Preview do avatar"
                        className="size-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ) : (
                      <span className="text-xl font-bold text-white">
                        {initials(user.name)}
                      </span>
                    )}
                  </div>

                  {/* Input de URL e presets */}
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <ImageIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="https://exemplo.com/sua-foto.jpg"
                        className="pl-9 text-xs sm:text-sm"
                        {...register("avatar")}
                      />
                    </div>

                    {/* Presets rápidos de avatar */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-muted-foreground">Sugestões:</span>
                      {avatarPresets.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            setValue("avatar", preset.url, { shouldValidate: true })
                          }
                          className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-neutral-300 hover:border-white/30 hover:bg-white/10 transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                      {currentAvatar && (
                        <button
                          type="button"
                          onClick={() => setValue("avatar", "", { shouldValidate: true })}
                          className="rounded border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          Remover foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {errors.avatar && (
                  <p className="text-xs text-red-400">{errors.avatar.message}</p>
                )}
              </div>

              {/* Nome */}
              <div className="space-y-1.5">
                <Label htmlFor="user-name">Nome Completo</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="user-name"
                    placeholder="Seu nome ou apelido"
                    className="pl-9"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* E-mail */}
              <div className="space-y-1.5">
                <Label htmlFor="user-email">Endereço de E-mail</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    className="pl-9"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </section>

          {/* Card: Segurança & Alteração de Senha */}
          <section
            aria-labelledby="seguranca-heading"
            className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <KeyRound className="size-5 text-amber-400" />
              <div>
                <h2
                  id="seguranca-heading"
                  className="text-base font-semibold text-white"
                >
                  Segurança & Senha de Acesso
                </h2>
                <p className="text-xs text-muted-foreground">
                  Para alterar sua senha, informe sua senha atual para confirmação.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmitPassword} className="mt-6 space-y-4">
              {passwordSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-3.5 text-sm text-emerald-400">
                  <Check className="size-4 shrink-0" />
                  <span>Sua senha foi alterada com sucesso!</span>
                </div>
              )}

              {passwordError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/30 p-3.5 text-sm text-red-400">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="current-password">Senha Atual</Label>
                <PasswordField
                  name="currentPassword"
                  placeholder="Sua senha atual"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <PasswordField
                    name="newPassword"
                    placeholder="Mínimo de 8 caracteres"
                    value={newPassword}
                    onChange={setNewPassword}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <PasswordField
                    name="confirmPassword"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending ? "Alterando..." : "Atualizar Senha"}
                </Button>
              </div>
            </form>
          </section>
        </div>

        {/* Coluna Lateral: Resumo da Conta, Estatísticas e Sessão */}
        <div className="space-y-6">
          {/* Card: Visão Geral da Conta */}
          <section
            aria-labelledby="resumo-conta-heading"
            className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 shadow-sm"
          >
            <h2
              id="resumo-conta-heading"
              className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Visão Geral
            </h2>

            <div className="mt-4 flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm font-bold text-white">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  initials(user.name)
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <span
                  className={cn(
                    "mt-1 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium",
                    isMaster
                      ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                      : "bg-white/10 text-neutral-300",
                  )}
                >
                  {isMaster ? <Crown className="size-3" /> : <Shield className="size-3" />}
                  {isMaster ? "Mestre do Sistema" : "Jogador"}
                </span>
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> Membro desde
                </span>
                <span className="text-neutral-200 font-medium">
                  {formatDate(user.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> ID do Jogador
                </span>
                <span className="font-mono text-[10px] text-neutral-400 truncate max-w-36">
                  {user.id}
                </span>
              </div>
            </dl>
          </section>

          {/* Card: Estatísticas de RPG */}
          <section
            aria-labelledby="estatisticas-heading"
            className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 shadow-sm"
          >
            <h2
              id="estatisticas-heading"
              className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Suas Mesas & Fichas
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-xs">
                  <Crown className="size-4 text-amber-400" />
                  <span className="text-neutral-300 font-medium">
                    Campanhas Mestrando
                  </span>
                </div>
                <span className="font-mono text-lg font-bold text-white tabular-nums">
                  {stats.ownedCampaigns}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-xs">
                  <Dices className="size-4 text-indigo-400" />
                  <span className="text-neutral-300 font-medium">
                    Mesas Participando
                  </span>
                </div>
                <span className="font-mono text-lg font-bold text-white tabular-nums">
                  {stats.memberships}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-xs">
                  <ScrollText className="size-4 text-emerald-400" />
                  <span className="text-neutral-300 font-medium">
                    Fichas Atribuídas
                  </span>
                </div>
                <span className="font-mono text-lg font-bold text-white tabular-nums">
                  {stats.characters}
                </span>
              </div>
            </div>
          </section>

          {/* Card: Sessão */}
          <section className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Sessão Ativa
            </h2>
            <p className="text-xs text-muted-foreground">
              Você está conectado como <strong className="text-white">{user.name}</strong>.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300"
              onClick={handleLogout}
            >
              <LogOut className="size-3.5 mr-1.5" />
              Sair desta Conta
            </Button>
          </section>
        </div>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="py-6 space-y-8">
      <Skeleton className="h-8 w-36" />
      <div className="space-y-2 border-b border-white/10 pb-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

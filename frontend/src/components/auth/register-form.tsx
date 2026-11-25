"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/store/auth"
import { type RegisterValues, registerSchema } from "@/lib/validators"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

export function RegisterForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })

  const { register: registerAction } = useAuth()

  const onSubmit = async (data: RegisterValues) => {
    const ok = await registerAction(data)
    if (ok) {
      // User is set in the store; AuthScreen will show the logged-in view
    }
  }

  const inputClassName = "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          {...register("name")}
          type="text"
          placeholder="seu nome"
          className={cn(inputClassName, errors.name && "border-destructive")}
        />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          {...register("email")}
          type="email"
          placeholder="example@tudo.com"
          className={cn(inputClassName, errors.email && "border-destructive")}
        />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          {...register("password")}
          type="password"
          placeholder="mínimo de 8 caracteres"
          className={cn(inputClassName, errors.password && "border-destructive")}
        />
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirme a senha</Label>
        <Input
          id="confirmPassword"
          {...register("confirmPassword")}
          type="password"
          placeholder="confirme a senha"
          className={cn(inputClassName, errors.confirmPassword && "border-destructive")}
        />
        {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  )
}

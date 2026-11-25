import { useState } from "react"
import { Crown, Dices, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login")

  return (
    <div className="grid min-h-dvh bg-background text-foreground lg:grid-cols-2">
      <aside className="relative hidden border-r border-white/10 bg-black lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <Dices className="size-5" aria-hidden />
          <span className="text-lg">Xangai</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight">
            Sua mesa de RPG, toda reunida.
          </h1>
          <p className="mt-4 leading-relaxed text-neutral-400">
            Crie campanhas, escolha um sistema de jogo e reúna seus jogadores.
            A organização da mesa fica com o Xangai.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-neutral-300">
            <li className="flex items-start gap-3">
              <Crown className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>Criou a campanha, vira o mestre dela na mesma hora.</span>
            </li>
            <li className="flex items-start gap-3">
              <Dices className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>Tormenta20, D&amp;D 5e, Ordem Paranormal e outros sistemas prontos para uso.</span>
            </li>
            <li className="flex items-start gap-3">
              <Users className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>Mestre e jogadores no mesmo lugar, acompanhando cada campanha.</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-neutral-600">Feito para quem joga e para quem mestra.</p>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-sm border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2 font-semibold tracking-tight lg:hidden">
            <Dices className="size-5" aria-hidden />
            <span className="text-lg">Xangai</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Entrar na sua mesa" : "Criar sua conta"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Acesse suas campanhas e continue o jogo."
              : "Crie a conta para começar sua primeira campanha."}
          </p>

          <div className="mt-6">
            {mode === "login" ? <LoginForm /> : <RegisterForm />}
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Ainda não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  Faça login
                </button>
              </>
            )}
          </p>
        </Card>
      </main>
    </div>
  )
}

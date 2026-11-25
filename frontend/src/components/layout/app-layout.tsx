import { Link, Outlet, useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { Dices, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/store/auth"
import { initials } from "@/lib/format"

export function AppLayout() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    queryClient.clear()
    navigate("/")
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/95">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Dices className="size-5" aria-hidden />
            <span className="text-lg">Xangai</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              campanhas de RPG
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg p-1.5 sm:px-2.5 transition-colors hover:bg-white/10"
                title="Gerenciar perfil e dados da conta"
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 text-[11px] font-semibold"
                  aria-hidden
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    initials(user.name)
                  )}
                </span>
                <div className="hidden flex-col md:flex text-left">
                  <span className="max-w-36 truncate text-xs font-medium text-white leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    Meu Perfil
                  </span>
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Sair da conta">
                <LogOut aria-hidden />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}

import { useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Dices } from "lucide-react"

import { AppLayout } from "@/components/layout/app-layout"
import { AuthScreen } from "@/components/auth/auth-screen"
import { DashboardPage } from "@/pages/dashboard-page"
import { CampaignDetailPage } from "@/pages/campaign-detail-page"
import { ProfilePage } from "@/pages/profile-page"
import { useAuth } from "@/store/auth"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const { user, initialized, initialize } = useAuth()

  useEffect(() => {
    void initialize()
  }, [initialize])

  if (!initialized) {
    return <FullScreenLoading />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {user ? (
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        ) : (
          <AuthScreen />
        )}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

function FullScreenLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background" role="status" aria-label="Carregando">
      <Dices className="size-8 animate-pulse text-white/40" aria-hidden />
    </div>
  )
}

export default App

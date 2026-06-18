import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function RequireAuth() {
  useAuth()
  const { usuario, isLoading, isInitialized } = useAuthStore()

  // Mientras se carga la sesión inicial, mostrar spinner
  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    )
  }

  // Sin sesión, redirigir al login
  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

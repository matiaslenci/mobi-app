import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function RequireOnboarding() {
  const inmobiliaria = useAuthStore((s) => s.inmobiliaria)

  // Si ya tiene inmobiliaria, no necesita onboarding
  if (inmobiliaria) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

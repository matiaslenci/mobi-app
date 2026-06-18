import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function RequireAdmin() {
  const esAdmin = useAuthStore((s) => s.esAdmin)

  if (!esAdmin()) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

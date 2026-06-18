import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface RequireSectionProps {
  seccion: string
}

export default function RequireSection({ seccion }: RequireSectionProps) {
  const tienePermiso = useAuthStore((s) => s.tienePermiso)

  if (!tienePermiso(seccion)) {
    return (
      <Navigate
        to="/"
        replace
        state={{ sinPermiso: seccion }}
      />
    )
  }

  return <Outlet />
}

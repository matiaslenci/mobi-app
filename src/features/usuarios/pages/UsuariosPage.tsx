import { Users } from 'lucide-react'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function UsuariosPage() {
  return (
    <PagePlaceholder
      title="Usuarios"
      subtitle="Invitá colaboradores y gestioná los permisos por sección."
      icon={Users}
    />
  )
}

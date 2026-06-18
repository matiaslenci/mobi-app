import { Megaphone } from 'lucide-react'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function PublicacionesPage() {
  return (
    <PagePlaceholder
      title="Publicaciones"
      subtitle="Propiedades publicadas en Zonaprop, MercadoLibre, Argenprop y tu web."
      icon={Megaphone}
    />
  )
}

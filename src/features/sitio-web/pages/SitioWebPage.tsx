import { Globe2 } from 'lucide-react'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function SitioWebPage() {
  return (
    <PagePlaceholder
      title="Sitio Web"
      subtitle="Gestioná tu catálogo público en mobi.com/[slug]."
      icon={Globe2}
    />
  )
}

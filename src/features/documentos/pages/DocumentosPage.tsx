import { FileText } from 'lucide-react'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function DocumentosPage() {
  return (
    <PagePlaceholder
      title="Documentos"
      subtitle="Carga y firma de documentación de locadores y locatarios."
      icon={FileText}
    />
  )
}

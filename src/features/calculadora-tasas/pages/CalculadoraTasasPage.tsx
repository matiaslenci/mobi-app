import { Calculator } from 'lucide-react'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function CalculadoraTasasPage() {
  return (
    <PagePlaceholder
      title="Calculadora de tasas"
      subtitle="Calculá tasas e intereses para operaciones de tu inmobiliaria."
      icon={Calculator}
    />
  )
}

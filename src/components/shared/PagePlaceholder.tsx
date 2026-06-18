import { Construction, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader } from './PageHeader'

interface PagePlaceholderProps {
  title: string
  subtitle: string
  icon?: LucideIcon
  emptyTitle?: string
  emptyDescription?: string
}

export function PagePlaceholder({
  title,
  subtitle,
  icon: Icon = Construction,
  emptyTitle = 'En construcción',
  emptyDescription = 'Próximamente. Estamos trabajando en esta sección.',
}: PagePlaceholderProps) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />

      <Card>
        <div className="flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="grid h-12 w-12 place-items-center rounded-xl border border-line bg-surface text-ink-secondary">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h2 className="mt-5 text-h-xs font-semibold tracking-tight text-ink">{emptyTitle}</h2>
          <p className="mt-1.5 max-w-sm text-body-sm text-ink-muted">{emptyDescription}</p>
        </div>
      </Card>
    </>
  )
}

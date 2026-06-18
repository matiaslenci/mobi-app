import { type ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-10">
      <div>
        <h1 className="text-h-sm font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 text-body-sm text-ink-secondary max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}

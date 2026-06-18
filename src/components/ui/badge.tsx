import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'muted' | 'ink' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

const toneStyles: Record<Tone, string> = {
  muted: 'bg-surface text-ink-muted',
  ink: 'bg-primary text-primary-foreground',
  outline: 'bg-canvas text-ink-secondary border border-line',
}

export function Badge({ tone = 'muted', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-2 py-[2px] text-label-sm font-medium',
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  )
}

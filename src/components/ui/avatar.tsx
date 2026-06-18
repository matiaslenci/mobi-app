import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials: string
  size?: 'sm' | 'md'
}

export function Avatar({ initials, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-surface text-ink-secondary border border-line font-medium uppercase tracking-tight select-none',
        size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-[12px]',
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  )
}

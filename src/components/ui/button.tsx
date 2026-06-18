import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'link'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-[#222] active:bg-[#0c0c09] disabled:opacity-50',
  secondary:
    'bg-canvas text-ink border border-line hover:bg-surface disabled:opacity-50',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-surface hover:text-ink',
  link: 'bg-transparent text-ink-secondary hover:text-ink underline-offset-4 hover:underline px-0 h-auto',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-10 px-4 text-label',
  lg: 'h-12 px-6 text-label',
  icon: 'h-9 w-9 p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'whitespace-nowrap select-none disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

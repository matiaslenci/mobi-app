import { forwardRef, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, ...props }, ref) => (
    <label
      className={cn(
        'relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-line bg-canvas transition-colors',
        checked && 'bg-primary border-primary',
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        {...props}
      />
      {checked && (
        <Check className="pointer-events-none h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
      )}
    </label>
  ),
)
Checkbox.displayName = 'Checkbox'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronsUpDown, CircleHelp, PanelLeft, Search } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TopbarProps {
  onToggleSidebar: () => void
}

interface Inmobiliaria {
  id: string
  nombre: string
  plan: 'Mobi' | 'Free'
}

const INMOBILIARIAS: Inmobiliaria[] = [
  { id: 'i1', nombre: 'Bravo Propiedades', plan: 'Mobi' },
  { id: 'i2', nombre: 'Sur Inmobiliaria', plan: 'Free' },
  { id: 'i3', nombre: 'Plaza Real Estate', plan: 'Mobi' },
]

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<Inmobiliaria>(INMOBILIARIAS[0])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="grid h-9 w-9 place-items-center rounded-md text-ink-secondary hover:bg-surface"
          aria-label="Alternar menú"
        >
          <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              'flex items-center gap-2 rounded-md border border-line bg-canvas pl-3 pr-2 py-1.5 text-[13px]',
              'hover:bg-surface transition-colors',
            )}
          >
            <span className="font-medium text-ink">{active.nombre}</span>
            <Badge tone={active.plan === 'Mobi' ? 'ink' : 'outline'}>{active.plan}</Badge>
            <ChevronsUpDown className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
          </button>

          {open && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-72 rounded-lg border border-line bg-canvas shadow-float">
              <div className="px-3 py-2 text-label-sm text-ink-muted">Inmobiliarias</div>
              <ul className="px-1 pb-1">
                {INMOBILIARIAS.map((i) => {
                  const selected = i.id === active.id
                  return (
                    <li key={i.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActive(i)
                          setOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-[13px] transition-colors',
                          selected ? 'bg-surface text-ink' : 'text-ink-secondary hover:bg-surface/70 hover:text-ink',
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{i.nombre}</span>
                          <Badge tone={i.plan === 'Mobi' ? 'ink' : 'outline'}>{i.plan}</Badge>
                        </span>
                        {selected && <Check className="h-3.5 w-3.5 text-ink" strokeWidth={2} />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-line bg-canvas pl-3 pr-2 h-9 w-72 text-[13px] text-ink-muted">
            <Search className="h-4 w-4" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Buscar…"
              className="flex-1 bg-transparent text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <kbd className="rounded-sm border border-line bg-surface px-1.5 py-[1px] text-[10px] font-medium text-ink-muted">
              Ctrl K
            </kbd>
          </div>

          <Button variant="ghost" size="sm" className="gap-1.5">
            <CircleHelp className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Ayuda</span>
          </Button>

          <Avatar initials="MR" />
        </div>
      </div>
    </header>
  )
}

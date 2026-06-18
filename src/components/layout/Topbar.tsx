import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleHelp, LogOut, PanelLeft, Search } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface TopbarProps {
  onToggleSidebar: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const navigate = useNavigate()
  const { usuario, inmobiliaria } = useAuthStore()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const initials = usuario
    ? `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase()
    : '?'

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

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

        {/* Inmobiliaria actual (estático, sin switcher) */}
        <div className="flex items-center gap-2 rounded-md border border-line bg-canvas pl-3 pr-2 py-1.5 text-[13px]">
          <span className="font-medium text-ink">
            {inmobiliaria?.nombre ?? 'Sin inmobiliaria'}
          </span>
          {inmobiliaria && (
            <Badge tone={inmobiliaria.plan === 'mobi' ? 'ink' : 'outline'}>
              {inmobiliaria.plan === 'mobi' ? 'Mobi' : 'Free'}
            </Badge>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Barra de búsqueda */}
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

          {/* Ayuda */}
          <Button variant="ghost" size="sm" className="gap-1.5">
            <CircleHelp className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Ayuda</span>
          </Button>

          {/* Avatar con dropdown de usuario */}
          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="focus:outline-none"
            >
              <Avatar initials={initials} />
            </button>

            {open && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-64 rounded-lg border border-line bg-canvas shadow-float">
                <div className="px-4 py-3">
                  <p className="text-body-sm font-medium text-ink">
                    {usuario ? `${usuario.nombre} ${usuario.apellido}` : '—'}
                  </p>
                  <p className="text-label-sm text-ink-muted mt-0.5">
                    {usuario?.email ?? '—'}
                  </p>
                </div>
                <div className="border-t border-line px-1 py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-ink-secondary hover:bg-surface hover:text-ink transition-colors"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

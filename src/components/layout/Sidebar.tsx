import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Plus, Settings, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sections } from '@/lib/sections'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const { tienePermiso, esAdmin } = useAuthStore()

  // Filtrar secciones según permisos del usuario
  const visibleSections = sections.filter((section) => {
    // Secciones no restringidas (ej: dashboard) siempre visibles
    if (!section.gated) return true
    // Secciones solo para admin
    if (section.adminOnly) return esAdmin()
    // Secciones con permiso específico
    if (section.permisoKey) return tienePermiso(section.permisoKey)
    return false
  })

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-canvas',
          'transition-transform duration-200 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-[13px] font-semibold">
              m
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              Mobi
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-ink-secondary hover:bg-surface lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pb-3">
          <Button variant="primary" className="w-full justify-center gap-2">
            <Plus className="h-4 w-4 text-white" strokeWidth={2} />
            <p className="text-white"> Nueva propiedad</p>
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          <ul className="space-y-0.5">
            {visibleSections.map((section) => {
              const Icon = section.icon
              return (
                <li key={section.slug}>
                  <NavLink
                    to={section.path}
                    end={section.path === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-md px-3 py-2 text-nav transition-colors',
                        isActive
                          ? 'bg-surface text-ink font-medium'
                          : 'text-ink-secondary hover:bg-surface/60 hover:text-ink',
                      )
                    }
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    <span>{section.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-line p-3 space-y-2">
          <div className="rounded-md border border-line bg-surface/70 p-3">
            <div className="flex items-center gap-2 text-ink">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              <span className="text-[13px] font-medium">10 días restantes</span>
            </div>
            <p className="mt-1 text-label-sm text-ink-muted leading-snug">
              Prueba gratuita del plan Mobi.
            </p>
            <Button size="sm" variant="primary" className="mt-3 w-full">
              Suscribirme
            </Button>
          </div>

          <NavLink
            to="/configuracion"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-nav transition-colors',
                isActive
                  ? 'bg-surface text-ink font-medium'
                  : 'text-ink-secondary hover:bg-surface/60 hover:text-ink',
              )
            }
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} />
            <span>Configuración</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-nav text-ink-secondary hover:bg-surface/60 hover:text-ink transition-colors w-full"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}

import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { PageHeader } from '@/components/shared/PageHeader'
import { cn } from '@/lib/utils'

interface ChecklistItem {
  id: string
  titulo: string
  ayuda: string
  accion: string
}

interface ChecklistGroup {
  id: string
  titulo: string
  descripcion: string
  items: ChecklistItem[]
}

const GROUPS: ChecklistGroup[] = [
  {
    id: 'configurar',
    titulo: 'Configurá tu inmobiliaria',
    descripcion: 'Dejá lista la cuenta antes de empezar a operar.',
    items: [
      {
        id: 'datos',
        titulo: 'Completar datos de la inmobiliaria',
        ayuda: 'Razón social, CUIT, domicilio comercial y logo.',
        accion: 'Completar',
      },
      {
        id: 'sucursales',
        titulo: 'Agregar sucursales o ubicaciones',
        ayuda: 'Sumá las oficinas donde opera tu equipo.',
        accion: 'Agregar',
      },
      {
        id: 'cobros',
        titulo: 'Configurar medios de cobro',
        ayuda: 'Cuentas bancarias o billeteras para acreditar pagos.',
        accion: 'Configurar',
      },
      {
        id: 'invitar',
        titulo: 'Invitar colaboradores',
        ayuda: 'Sumá a tu equipo y definí permisos por sección.',
        accion: 'Invitar',
      },
      {
        id: 'integraciones',
        titulo: 'Configurar integraciones',
        ayuda: 'Conectá Zonaprop, MercadoLibre y Argenprop.',
        accion: 'Conectar',
      },
    ],
  },
  {
    id: 'empezar',
    titulo: 'Empezá a usar Mobi',
    descripcion: 'Cargá tu primera propiedad y publicala en los portales.',
    items: [
      {
        id: 'primera-prop',
        titulo: 'Cargar primera propiedad',
        ayuda: 'Datos del inmueble, fotos y características.',
        accion: 'Cargar',
      },
      {
        id: 'publicar',
        titulo: 'Publicar en portales',
        ayuda: 'Elegí dónde publicar la propiedad cargada.',
        accion: 'Publicar',
      },
      {
        id: 'web',
        titulo: 'Activar tu sitio web',
        ayuda: 'Personalizá tu catálogo público en mobi.com/[slug].',
        accion: 'Activar',
      },
      {
        id: 'alquiler',
        titulo: 'Cargar un contrato de alquiler',
        ayuda: 'Sumá locador, locatario y documentación.',
        accion: 'Cargar',
      },
    ],
  },
]

export function DashboardPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    configurar: true,
    empezar: true,
  })

  const toggleItem = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))

  const allChecked = useMemo(
    () => GROUPS.every((g) => g.items.every((it) => checked[it.id])),
    [checked],
  )

  const markAll = () => {
    if (allChecked) return
    const next: Record<string, boolean> = {}
    GROUPS.forEach((g) => g.items.forEach((it) => (next[it.id] = true)))
    setChecked(next)
  }

  return (
    <>
      <PageHeader
        title="Bienvenido a Mobi"
        subtitle="Seguí estos pasos para dejar tu inmobiliaria lista y empezar a operar."
        actions={
          <Button variant="secondary" onClick={markAll} disabled={allChecked}>
            {allChecked ? 'Todo completo' : 'Marcar todo completo'}
          </Button>
        }
      />

      <div className="space-y-5">
        {GROUPS.map((group) => {
          const done = group.items.filter((it) => checked[it.id]).length
          const total = group.items.length
          const open = openGroups[group.id]

          return (
            <Card key={group.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-surface/40"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-h-xs font-semibold tracking-tight text-ink">
                      {group.titulo}
                    </h2>
                    <Badge>{`${done}/${total}`}</Badge>
                  </div>
                  <p className="mt-1 text-body-sm text-ink-secondary">{group.descripcion}</p>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-ink-muted transition-transform duration-150',
                    open && 'rotate-180',
                  )}
                  strokeWidth={1.75}
                />
              </button>

              {open && (
                <div className="border-t border-line">
                  <ul className="divide-y divide-line">
                    {group.items.map((item) => {
                      const isChecked = !!checked[item.id]
                      return (
                        <li
                          key={item.id}
                          className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-surface/30"
                        >
                          <div className="pt-[3px]">
                            <Checkbox
                              checked={isChecked}
                              onChange={() => toggleItem(item.id)}
                              aria-label={item.titulo}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                'text-[15px] font-medium text-ink',
                                isChecked && 'text-ink-muted line-through',
                              )}
                            >
                              {item.titulo}
                            </div>
                            <p className="mt-0.5 text-body-sm text-ink-secondary">
                              {item.ayuda}
                            </p>
                          </div>
                          <Button
                            variant={isChecked ? 'ghost' : 'primary'}
                            size="sm"
                            onClick={() => toggleItem(item.id)}
                            className="shrink-0"
                          >
                            {isChecked ? 'Hecho' : item.accion}
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
}

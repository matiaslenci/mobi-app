import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Plus, UserX } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Membresia, PermisosSecciones } from '@/types/database'

// Membresía con permisos incluidos desde el join
type MembresiaConPermisos = Membresia & {
  permisos_secciones: PermisosSecciones[] | null
}

// Mapeo de claves de permisos a etiquetas legibles
const PERMISO_LABELS: Record<string, string> = {
  calculadora_tasas: 'Tasas',
  calculadora_ipc_icl: 'IPC/ICL',
  alquileres: 'Alquileres',
  sitio_web: 'Sitio Web',
  publicaciones: 'Publicaciones',
  documentos: 'Documentos',
}

const PERMISO_KEYS = Object.keys(PERMISO_LABELS) as (keyof PermisosSecciones)[]

export function UsuariosPage() {
  const navigate = useNavigate()
  const { inmobiliaria } = useAuthStore()

  const [miembros, setMiembros] = useState<MembresiaConPermisos[]>([])
  const [loading, setLoading] = useState(true)
  const [desactivando, setDesactivando] = useState<string | null>(null)

  useEffect(() => {
    if (inmobiliaria) fetchMiembros()
  }, [inmobiliaria]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchMiembros() {
    if (!inmobiliaria) return
    setLoading(true)

    const { data, error } = await supabase
      .from('membresias')
      .select('*, permisos_secciones(*)')
      .eq('inmobiliaria_id', inmobiliaria.id)
      .is('borrado_en', null)
      .order('creado_en', { ascending: true })

    if (error) {
      console.error('Error al cargar miembros:', error)
    } else {
      setMiembros((data as MembresiaConPermisos[]) ?? [])
    }

    setLoading(false)
  }

  async function handleDesactivar(membresiaId: string) {
    setDesactivando(membresiaId)

    const { error } = await supabase
      .from('membresias')
      .update({ borrado_en: new Date().toISOString() })
      .eq('id', membresiaId)

    if (error) {
      console.error('Error al desactivar miembro:', error)
    } else {
      setMiembros((prev) => prev.filter((m) => m.id !== membresiaId))
    }

    setDesactivando(null)
  }

  // Obtener las secciones habilitadas de un miembro
  function getPermisosActivos(permisos: PermisosSecciones[] | null): string[] {
    if (!permisos || permisos.length === 0) return []
    const p = permisos[0]
    return PERMISO_KEYS.filter((key) => p[key] === true).map(
      (key) => PERMISO_LABELS[key as string],
    )
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        subtitle="Gestioná los miembros de tu inmobiliaria y sus permisos."
        actions={
          <Button variant="primary" size="sm" onClick={() => navigate('/usuarios/invitar')}>
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span>Invitar usuario</span>
          </Button>
        }
      />

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-muted" />
          </div>
        ) : miembros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UserX className="h-10 w-10 text-ink-muted mb-3" strokeWidth={1.5} />
            <p className="text-body-sm text-ink-secondary">
              No hay miembros en tu inmobiliaria todavía.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => navigate('/usuarios/invitar')}
            >
              Invitar al primer usuario
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-6 py-3 text-left text-label-sm font-medium text-ink-muted">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-label-sm font-medium text-ink-muted">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-label-sm font-medium text-ink-muted">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-label-sm font-medium text-ink-muted">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-label-sm font-medium text-ink-muted">
                    Permisos
                  </th>
                  <th className="px-6 py-3 text-right text-label-sm font-medium text-ink-muted">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {miembros.map((miembro) => {
                  const permisosActivos = getPermisosActivos(miembro.permisos_secciones)
                  return (
                    <tr key={miembro.id} className="border-b border-line last:border-b-0">
                      <td className="px-6 py-4 text-body-sm text-ink font-medium">
                        {miembro.nombre_invitado}
                      </td>
                      <td className="px-6 py-4 text-body-sm text-ink-secondary">
                        {miembro.email_invitado}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={miembro.rol === 'admin' ? 'ink' : 'muted'}>
                          {miembro.rol === 'admin' ? 'Admin' : 'Miembro'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={miembro.estado === 'activa' ? 'ink' : 'outline'}>
                          {miembro.estado === 'activa' ? 'Activa' : 'Pendiente'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {miembro.rol === 'admin' ? (
                            <Badge tone="muted">Todas</Badge>
                          ) : permisosActivos.length > 0 ? (
                            permisosActivos.map((label) => (
                              <Badge key={label} tone="muted">
                                {label}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-label-sm text-ink-muted">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDesactivar(miembro.id)}
                          disabled={desactivando === miembro.id}
                        >
                          {desactivando === miembro.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          Desactivar
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

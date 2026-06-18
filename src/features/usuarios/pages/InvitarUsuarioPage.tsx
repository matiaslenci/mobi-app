import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import type { RolMembresia } from '@/types/database'

// Esquema de validación
const invitarSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
})

type InvitarFormData = z.infer<typeof invitarSchema>

// Secciones disponibles para asignar permisos
const SECCIONES_PERMISOS = [
  { key: 'calculadora_tasas', label: 'Calculadora de tasas' },
  { key: 'calculadora_ipc_icl', label: 'Calculadora IPC/ICL' },
  { key: 'alquileres', label: 'Alquileres' },
  { key: 'sitio_web', label: 'Sitio Web' },
  { key: 'publicaciones', label: 'Publicaciones' },
  { key: 'documentos', label: 'Documentos' },
] as const

type PermisoKey = (typeof SECCIONES_PERMISOS)[number]['key']

// TODO: Migrar a Edge Function con supabase.auth.admin.inviteUserByEmail()
// para enviar invitación real por email. Actualmente se crea la membresía
// con estado 'pendiente' directamente.

export default function InvitarUsuarioPage() {
  const navigate = useNavigate()
  const { inmobiliaria, usuario } = useAuthStore()

  const [rol, setRol] = useState<RolMembresia>('miembro')
  const [permisos, setPermisos] = useState<Record<PermisoKey, boolean>>({
    calculadora_tasas: false,
    calculadora_ipc_icl: false,
    alquileres: false,
    sitio_web: false,
    publicaciones: false,
    documentos: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InvitarFormData>({
    resolver: zodResolver(invitarSchema),
  })

  function togglePermiso(key: PermisoKey) {
    setPermisos((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function onSubmit(data: InvitarFormData) {
    if (!inmobiliaria || !usuario) return

    setSubmitting(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      // 1. Insertar membresía con estado pendiente
      const { data: membresia, error: membresiaError } = await supabase
        .from('membresias')
        .insert({
          inmobiliaria_id: inmobiliaria.id,
          email_invitado: data.email,
          nombre_invitado: `${data.nombre} ${data.apellido}`,
          rol,
          estado: 'pendiente',
          creado_por: usuario.id,
        })
        .select('id')
        .single()

      if (membresiaError) throw membresiaError

      // 2. Insertar permisos para la membresía
      const permisosData = rol === 'admin'
        ? {
            membresia_id: membresia.id,
            calculadora_tasas: true,
            calculadora_ipc_icl: true,
            alquileres: true,
            sitio_web: true,
            publicaciones: true,
            documentos: true,
          }
        : {
            membresia_id: membresia.id,
            ...permisos,
          }

      const { error: permisosError } = await supabase
        .from('permisos_secciones')
        .insert(permisosData)

      if (permisosError) throw permisosError

      setSuccessMsg('Invitación creada. El usuario fue registrado con estado pendiente.')
      reset()
      setRol('miembro')
      setPermisos({
        calculadora_tasas: false,
        calculadora_ipc_icl: false,
        alquileres: false,
        sitio_web: false,
        publicaciones: false,
        documentos: false,
      })
    } catch (err) {
      console.error(err)
      setErrorMsg('Ocurrió un error al crear la invitación. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Invitar usuario"
        subtitle="Enviá una invitación para sumar un nuevo miembro al equipo."
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/usuarios')}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            <span>Volver</span>
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-label-sm font-medium text-ink">
                  Nombre
                </label>
                <Input
                  placeholder="Ej: Juan"
                  {...register('nombre')}
                />
                {errors.nombre && (
                  <p className="text-label-sm text-danger">{errors.nombre.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-label-sm font-medium text-ink">
                  Apellido
                </label>
                <Input
                  placeholder="Ej: Pérez"
                  {...register('apellido')}
                />
                {errors.apellido && (
                  <p className="text-label-sm text-danger">{errors.apellido.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-label-sm font-medium text-ink">
                Email
              </label>
              <Input
                type="email"
                placeholder="juan@ejemplo.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-label-sm text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Rol */}
            <div className="space-y-1.5">
              <label className="text-label-sm font-medium text-ink">
                Rol
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={rol === 'admin' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setRol('admin')}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant={rol === 'miembro' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setRol('miembro')}
                >
                  Miembro
                </Button>
              </div>
            </div>

            {/* Permisos por sección */}
            <div className="space-y-3">
              <label className="text-label-sm font-medium text-ink">
                Permisos por sección
              </label>

              {rol === 'admin' && (
                <p className="text-body-sm text-ink-muted">
                  Los administradores tienen acceso a todas las secciones.
                </p>
              )}

              <div className="space-y-2.5">
                {SECCIONES_PERMISOS.map((seccion) => (
                  <label
                    key={seccion.key}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Checkbox
                      checked={rol === 'admin' ? true : permisos[seccion.key]}
                      onChange={() => togglePermiso(seccion.key)}
                      disabled={rol === 'admin'}
                    />
                    <span className="text-body-sm text-ink">{seccion.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mensajes */}
            {successMsg && (
              <div className="rounded-lg border border-line bg-surface px-4 py-3 text-body-sm text-ink">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-body-sm text-danger">
                {errorMsg}
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar invitación
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/usuarios')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

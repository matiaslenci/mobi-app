import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const onboardingSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la inmobiliaria es obligatorio.'),
  email: z
    .string()
    .email('Ingresá un email válido.')
    .or(z.literal(''))
    .optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
    },
  })

  const onSubmit = async (data: OnboardingFormData) => {
    setServerError(null)

    const userId = usuario?.id
    if (!userId) {
      setServerError('No se pudo identificar tu usuario. Recargá la página.')
      return
    }

    try {
      // 1. Crear la inmobiliaria — creado_por lo completa el trigger set_creado_por
      const { data: inmobiliaria, error } = await supabase
        .from('inmobiliarias')
        .insert({
          nombre: data.nombre,
          email: data.email || null,
          telefono: data.telefono || null,
          direccion: data.direccion || null,
          ciudad: data.ciudad || null,
          plan: 'mobi',
        })
        .select()
        .single()

      if (error) throw error

      // 2. Buscar la membresía recién creada por el trigger crear_membresia_fundador
      const { data: membresia } = await supabase
        .from('membresias')
        .select('id')
        .eq('usuario_id', userId)
        .eq('inmobiliaria_id', inmobiliaria.id)
        .single()

      // 3. Actualizar permisos a todos true (admin tiene acceso total)
      if (membresia) {
        await supabase
          .from('permisos_secciones')
          .update({
            calculadora_tasas: true,
            calculadora_ipc_icl: true,
            alquileres: true,
            sitio_web: true,
            publicaciones: true,
            documentos: true,
          })
          .eq('membresia_id', membresia.id)
      }

      // 4. Forzar recarga completa para re-inicializar el auth store
      window.location.href = '/'
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido.'
      setServerError(`No se pudo crear la inmobiliaria: ${message}`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-h-sm font-semibold text-primary-foreground">
              m
            </span>
          </div>
          <span className="text-h-sm font-semibold text-ink">Mobi</span>
        </div>

        {/* Encabezado */}
        <div className="mb-6 text-center">
          <h1 className="text-h-sm font-semibold text-ink">
            Configurá tu inmobiliaria
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-muted">
            Completá los datos de tu agencia para empezar a operar.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre de la inmobiliaria */}
          <div className="space-y-1.5">
            <label
              htmlFor="nombre"
              className="text-label font-medium text-ink"
            >
              Nombre de la inmobiliaria
            </label>
            <Input
              id="nombre"
              type="text"
              placeholder="Ej: Inmobiliaria López"
              {...register('nombre')}
            />
            {errors.nombre && (
              <p className="text-label-sm text-danger">
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Email de contacto */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-label font-medium text-ink">
              Email de contacto
            </label>
            <Input
              id="email"
              type="email"
              placeholder="contacto@inmobiliaria.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-label-sm text-danger">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Teléfono y Ciudad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="telefono"
                className="text-label font-medium text-ink"
              >
                Teléfono
              </label>
              <Input
                id="telefono"
                type="tel"
                placeholder="+54 11 1234-5678"
                {...register('telefono')}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ciudad"
                className="text-label font-medium text-ink"
              >
                Ciudad
              </label>
              <Input
                id="ciudad"
                type="text"
                placeholder="Buenos Aires"
                {...register('ciudad')}
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-1.5">
            <label
              htmlFor="direccion"
              className="text-label font-medium text-ink"
            >
              Dirección
            </label>
            <Input
              id="direccion"
              type="text"
              placeholder="Av. Corrientes 1234, Piso 3"
              {...register('direccion')}
            />
          </div>

          {/* Error del servidor */}
          {serverError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-body-sm text-danger">
              {serverError}
            </div>
          )}

          {/* Botón */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-2 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear inmobiliaria'}
          </Button>
        </form>
      </div>
    </div>
  )
}

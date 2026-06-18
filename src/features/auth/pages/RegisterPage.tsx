import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const registerSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  apellido: z.string().min(1, 'El apellido es obligatorio.'),
  email: z
    .string()
    .min(1, 'El email es obligatorio.')
    .email('Ingresá un email válido.'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
})

type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Mapea errores de Supabase Auth a mensajes en español.
 */
function mapAuthError(message: string): string {
  if (message.includes('User already registered')) {
    return 'Ya existe una cuenta con ese email.'
  }
  if (message.includes('Password should be')) {
    return 'La contraseña no cumple con los requisitos mínimos.'
  }
  return 'Ocurrió un error al crear la cuenta. Intentá de nuevo.'
}

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nombre: data.nombre,
          apellido: data.apellido,
        },
      },
    })

    if (error) {
      setServerError(mapAuthError(error.message))
      return
    }

    setSentEmail(data.email)
    setEmailSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-h-sm font-semibold text-primary-foreground">
              m
            </span>
          </div>
          <span className="text-h-sm font-semibold text-ink">Mobi</span>
        </div>

        {emailSent ? (
          /* Estado de éxito: email enviado */
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
              <Mail className="h-7 w-7 text-ink-secondary" />
            </div>
            <h1 className="text-h-sm font-semibold text-ink">
              Revisá tu email
            </h1>
            <p className="mt-2 text-body-sm text-ink-muted">
              Te enviamos un enlace de confirmación a{' '}
              <span className="font-medium text-ink">{sentEmail}</span>. Hacé
              click en el enlace para activar tu cuenta.
            </p>
            <Link to="/login">
              <Button variant="primary" size="lg" className="mt-6 w-full">
                Ir al login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Encabezado */}
            <div className="mb-6 text-center">
              <h1 className="text-h-sm font-semibold text-ink">
                Creá tu cuenta
              </h1>
              <p className="mt-1.5 text-body-sm text-ink-muted">
                Completá tus datos para empezar a usar Mobi.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="nombre"
                    className="text-label font-medium text-ink"
                  >
                    Nombre
                  </label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Juan"
                    autoComplete="given-name"
                    {...register('nombre')}
                  />
                  {errors.nombre && (
                    <p className="text-label-sm text-danger">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="apellido"
                    className="text-label font-medium text-ink"
                  >
                    Apellido
                  </label>
                  <Input
                    id="apellido"
                    type="text"
                    placeholder="Pérez"
                    autoComplete="family-name"
                    {...register('apellido')}
                  />
                  {errors.apellido && (
                    <p className="text-label-sm text-danger">
                      {errors.apellido.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-label font-medium text-ink"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-label-sm text-danger">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-label font-medium text-ink"
                >
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-label-sm text-danger">
                    {errors.password.message}
                  </p>
                )}
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
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>

            {/* Link a login */}
            <p className="mt-6 text-center text-body-sm text-ink-muted">
              ¿Ya tenés cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-ink underline underline-offset-4 hover:text-ink-secondary"
              >
                Iniciá sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

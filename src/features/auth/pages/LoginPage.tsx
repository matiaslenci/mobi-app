import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio.')
    .email('Ingresá un email válido.'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * Mapea errores de Supabase Auth a mensajes en español.
 */
function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'El email o la contraseña son incorrectos.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Tu email aún no fue confirmado. Revisá tu bandeja de entrada.'
  }
  return 'Ocurrió un error al iniciar sesión. Intentá de nuevo.'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError(mapAuthError(error.message))
      return
    }

    // El guard del router redirige a onboarding si falta la inmobiliaria
    navigate('/')
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

        {/* Encabezado */}
        <div className="mb-6 text-center">
          <h1 className="text-h-sm font-semibold text-ink">
            Iniciá sesión en tu cuenta
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-muted">
            Ingresá tu email y contraseña para acceder.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-label font-medium text-ink">
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
              <p className="text-label-sm text-danger">{errors.email.message}</p>
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
              autoComplete="current-password"
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
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        {/* Link a registro */}
        <p className="mt-6 text-center text-body-sm text-ink-muted">
          ¿No tenés cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-ink underline underline-offset-4 hover:text-ink-secondary"
          >
            Creá una cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import RequireAuth from '@/routes/RequireAuth'
import RequireSection from '@/routes/RequireSection'
import RequireAdmin from '@/routes/RequireAdmin'
import RequireOnboarding from '@/routes/RequireOnboarding'

// Páginas de autenticación
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import OnboardingPage from '@/features/auth/pages/OnboardingPage'

// Páginas de la app
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { AlquileresPage } from '@/features/alquileres/pages/AlquileresPage'
import { CalculadoraTasasPage } from '@/features/calculadora-tasas/pages/CalculadoraTasasPage'
import { CalculadoraIPCICLPage } from '@/features/calculadora-ipc-icl/pages/CalculadoraIPCICLPage'
import { SitioWebPage } from '@/features/sitio-web/pages/SitioWebPage'
import { PublicacionesPage } from '@/features/publicaciones/pages/PublicacionesPage'
import { DocumentosPage } from '@/features/documentos/pages/DocumentosPage'
import { UsuariosPage } from '@/features/usuarios/pages/UsuariosPage'
import InvitarUsuarioPage from '@/features/usuarios/pages/InvitarUsuarioPage'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export const router = createBrowserRouter([
  // Rutas públicas (sin auth)
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // Rutas protegidas
  {
    element: <RequireAuth />,
    children: [
      // Onboarding (solo si no tiene inmobiliaria)
      {
        element: <RequireOnboarding />,
        children: [
          { path: '/onboarding', element: <OnboardingPage /> },
        ],
      },
      // App principal (con layout)
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            element: <RequireSection seccion="calculadora_tasas" />,
            children: [{ path: 'calculadora-tasas', element: <CalculadoraTasasPage /> }],
          },
          {
            element: <RequireSection seccion="calculadora_ipc_icl" />,
            children: [{ path: 'calculadora-ipc-icl', element: <CalculadoraIPCICLPage /> }],
          },
          {
            element: <RequireSection seccion="alquileres" />,
            children: [{ path: 'alquileres', element: <AlquileresPage /> }],
          },
          {
            element: <RequireSection seccion="sitio_web" />,
            children: [{ path: 'sitio-web', element: <SitioWebPage /> }],
          },
          {
            element: <RequireSection seccion="publicaciones" />,
            children: [{ path: 'publicaciones', element: <PublicacionesPage /> }],
          },
          {
            element: <RequireSection seccion="documentos" />,
            children: [{ path: 'documentos', element: <DocumentosPage /> }],
          },
          {
            element: <RequireAdmin />,
            children: [
              { path: 'usuarios', element: <UsuariosPage /> },
              { path: 'usuarios/invitar', element: <InvitarUsuarioPage /> },
            ],
          },
          {
            path: 'configuracion',
            element: (
              <PagePlaceholder
                title="Configuración"
                subtitle="Datos de la inmobiliaria, plan, integraciones y preferencias."
              />
            ),
          },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { AlquileresPage } from '@/features/alquileres/pages/AlquileresPage'
import { CalculadoraTasasPage } from '@/features/calculadora-tasas/pages/CalculadoraTasasPage'
import { CalculadoraIPCICLPage } from '@/features/calculadora-ipc-icl/pages/CalculadoraIPCICLPage'
import { SitioWebPage } from '@/features/sitio-web/pages/SitioWebPage'
import { PublicacionesPage } from '@/features/publicaciones/pages/PublicacionesPage'
import { DocumentosPage } from '@/features/documentos/pages/DocumentosPage'
import { UsuariosPage } from '@/features/usuarios/pages/UsuariosPage'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'calculadora-tasas', element: <CalculadoraTasasPage /> },
      { path: 'calculadora-ipc-icl', element: <CalculadoraIPCICLPage /> },
      { path: 'alquileres', element: <AlquileresPage /> },
      { path: 'sitio-web', element: <SitioWebPage /> },
      { path: 'publicaciones', element: <PublicacionesPage /> },
      { path: 'documentos', element: <DocumentosPage /> },
      { path: 'usuarios', element: <UsuariosPage /> },
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
])

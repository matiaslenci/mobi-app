import {
  Building2,
  Calculator,
  FileText,
  Globe2,
  type LucideIcon,
  Megaphone,
  Percent,
  LayoutDashboard,
  Users,
} from 'lucide-react'

export type SectionSlug =
  | 'dashboard'
  | 'calculadora-tasas'
  | 'calculadora-ipc-icl'
  | 'alquileres'
  | 'sitio-web'
  | 'publicaciones'
  | 'documentos'
  | 'usuarios'

export interface SectionDef {
  slug: SectionSlug
  label: string
  path: string
  icon: LucideIcon
  /** Secciones que requieren permisos en permisos_secciones. Dashboard siempre está disponible. */
  gated: boolean
  /** Clave en permisos_secciones que habilita esta sección (usa guiones bajos). */
  permisoKey?: string
  /** Si es true, solo los administradores pueden acceder. */
  adminOnly?: boolean
}

export const sections: SectionDef[] = [
  { slug: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard, gated: false },
  { slug: 'calculadora-tasas', label: 'Calculadora de tasas', path: '/calculadora-tasas', icon: Calculator, gated: true, permisoKey: 'calculadora_tasas' },
  { slug: 'calculadora-ipc-icl', label: 'Calculadora IPC/ICL', path: '/calculadora-ipc-icl', icon: Percent, gated: true, permisoKey: 'calculadora_ipc_icl' },
  { slug: 'alquileres', label: 'Alquileres', path: '/alquileres', icon: Building2, gated: true, permisoKey: 'alquileres' },
  { slug: 'sitio-web', label: 'Sitio Web', path: '/sitio-web', icon: Globe2, gated: true, permisoKey: 'sitio_web' },
  { slug: 'publicaciones', label: 'Publicaciones', path: '/publicaciones', icon: Megaphone, gated: true, permisoKey: 'publicaciones' },
  { slug: 'documentos', label: 'Documentos', path: '/documentos', icon: FileText, gated: true, permisoKey: 'documentos' },
  { slug: 'usuarios', label: 'Usuarios', path: '/usuarios', icon: Users, gated: true, adminOnly: true },
]

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
  /** Sections that are gated by permisos_secciones in the DB. Dashboard is always available. */
  gated: boolean
}

export const sections: SectionDef[] = [
  { slug: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard, gated: false },
  { slug: 'calculadora-tasas', label: 'Calculadora de tasas', path: '/calculadora-tasas', icon: Calculator, gated: true },
  { slug: 'calculadora-ipc-icl', label: 'Calculadora IPC/ICL', path: '/calculadora-ipc-icl', icon: Percent, gated: true },
  { slug: 'alquileres', label: 'Alquileres', path: '/alquileres', icon: Building2, gated: true },
  { slug: 'sitio-web', label: 'Sitio Web', path: '/sitio-web', icon: Globe2, gated: true },
  { slug: 'publicaciones', label: 'Publicaciones', path: '/publicaciones', icon: Megaphone, gated: true },
  { slug: 'documentos', label: 'Documentos', path: '/documentos', icon: FileText, gated: true },
  { slug: 'usuarios', label: 'Usuarios', path: '/usuarios', icon: Users, gated: true },
]

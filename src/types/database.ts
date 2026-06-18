// ============================================================
// MOBI CRM — Tipos de base de datos
// Refleja exactamente el esquema SQL de Supabase
// ============================================================

// -------------------------------------------------------
// Enums (coinciden con los enums de Postgres)
// -------------------------------------------------------

export type RolMembresia = 'admin' | 'miembro'
export type EstadoMembresia = 'pendiente' | 'activa'
export type RolPersonaAlquiler = 'locador' | 'locatario'
export type EstadoAlquiler = 'activo' | 'vencido' | 'rescindido'
export type IndiceActualizacion = 'IPC' | 'ICL' | 'otro'
export type TipoInmueble = 'casa' | 'departamento' | 'local' | 'otro'
export type TipoPublicacion = 'alquiler' | 'venta'
export type EstadoPublicacion = 'activo' | 'pausado' | 'archivado'
export type PlataformaPublicacion = 'web_propia' | 'zonaprop' | 'mercadolibre' | 'argenprop'
export type EstadoPlataforma = 'pendiente' | 'publicado' | 'pausado' | 'error'

// -------------------------------------------------------
// Tablas
// -------------------------------------------------------

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  email: string
  avatar_url: string | null
  creado_en: string
  actualizado_en: string
  borrado_en: string | null
}

export interface Inmobiliaria {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  direccion: string | null
  ciudad: string | null
  plan: string
  creado_en: string
  actualizado_en: string
  creado_por: string | null
  borrado_en: string | null
}

export interface Membresia {
  id: string
  usuario_id: string | null
  inmobiliaria_id: string
  email_invitado: string
  nombre_invitado: string
  rol: RolMembresia
  estado: EstadoMembresia
  creado_en: string
  actualizado_en: string
  creado_por: string
  borrado_en: string | null
}

export interface PermisosSecciones {
  id: string
  membresia_id: string
  calculadora_tasas: boolean
  calculadora_ipc_icl: boolean
  alquileres: boolean
  sitio_web: boolean
  publicaciones: boolean
  documentos: boolean
  creado_en: string
  actualizado_en: string
}

export interface Persona {
  id: string
  inmobiliaria_id: string
  nombre: string
  apellido: string
  dni: string | null
  email: string | null
  telefono: string | null
  direccion: string | null
  ciudad: string | null
  notas: string | null
  creado_en: string
  actualizado_en: string
  creado_por: string | null
  borrado_en: string | null
}

export interface Alquiler {
  id: string
  inmobiliaria_id: string
  fecha_inicio: string
  fecha_fin: string
  monto_inicial: number
  indice_actualizacion: IndiceActualizacion
  periodicidad_aumento: string
  estado: EstadoAlquiler
  direccion: string
  ciudad: string
  tipo_inmueble: TipoInmueble
  superficie: number | null
  departamento: string | null
  piso: string | null
  torre: string | null
  creado_en: string
  actualizado_en: string
  creado_por: string | null
  borrado_en: string | null
}

export interface PersonaAlquiler {
  id: string
  persona_id: string
  alquiler_id: string
  rol: RolPersonaAlquiler
  creado_en: string
}

export interface Documento {
  id: string
  alquiler_id: string
  nombre: string
  tipo: string | null
  storage_path: string
  creado_en: string
  actualizado_en: string
  creado_por: string | null
  borrado_en: string | null
}

export interface Web {
  id: string
  inmobiliaria_id: string
  nombre: string
  slug: string
  whatsapp: string
  logo_path: string | null
  portada_path: string | null
  creado_en: string
  actualizado_en: string
  creado_por: string | null
  borrado_en: string | null
}

export interface Publicacion {
  id: string
  inmobiliaria_id: string
  titulo: string
  descripcion: string | null
  tipo: TipoPublicacion
  estado: EstadoPublicacion
  precio: number | null
  moneda: string
  direccion: string
  ciudad: string
  tipo_inmueble: TipoInmueble
  superficie: number | null
  ambientes: number | null
  departamento: string | null
  piso: string | null
  torre: string | null
  creado_en: string
  actualizado_en: string
  creado_por: string | null
  borrado_en: string | null
}

export interface PublicacionPlataforma {
  id: string
  publicacion_id: string
  plataforma: PlataformaPublicacion
  estado: EstadoPlataforma
  id_externo: string | null
  publicado_en: string | null
  creado_en: string
  actualizado_en: string
}

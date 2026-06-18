import { create } from 'zustand'
import type { Usuario, Inmobiliaria, Membresia, PermisosSecciones } from '@/types/database'

interface AuthState {
  // Estado
  usuario: Usuario | null
  membresia: Membresia | null
  inmobiliaria: Inmobiliaria | null
  permisos: PermisosSecciones | null
  isLoading: boolean
  isInitialized: boolean

  // Acciones
  setSession: (
    usuario: Usuario,
    membresia: Membresia | null,
    inmobiliaria: Inmobiliaria | null,
    permisos: PermisosSecciones | null,
  ) => void
  clearSession: () => void
  setLoading: (loading: boolean) => void
  setInitialized: () => void

  // Helpers
  tienePermiso: (seccion: string) => boolean
  esAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: null,
  membresia: null,
  inmobiliaria: null,
  permisos: null,
  isLoading: true,
  isInitialized: false,

  setSession: (usuario, membresia, inmobiliaria, permisos) =>
    set({ usuario, membresia, inmobiliaria, permisos, isLoading: false }),

  clearSession: () =>
    set({
      usuario: null,
      membresia: null,
      inmobiliaria: null,
      permisos: null,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setInitialized: () => set({ isInitialized: true, isLoading: false }),

  tienePermiso: (seccion: string) => {
    const { membresia, permisos } = get()
    // Los admins tienen acceso total independientemente de permisos_secciones
    if (membresia?.rol === 'admin') return true
    if (!permisos) return false
    // Convertir slug con guión medio a clave con guión bajo
    const key = seccion.replace(/-/g, '_') as keyof PermisosSecciones
    // Solo verificar campos booleanos de permisos
    const value = permisos[key]
    return typeof value === 'boolean' ? value : false
  },

  esAdmin: () => {
    const { membresia } = get()
    return membresia?.rol === 'admin'
  },
}))

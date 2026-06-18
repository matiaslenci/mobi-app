import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Usuario, Membresia, Inmobiliaria, PermisosSecciones } from '@/types/database'

export function useAuth() {
  const { setSession, clearSession, setLoading, setInitialized } = useAuthStore()

  useEffect(() => {
    // Cargar sesión inicial
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await loadUserData(session.user.id)
        }
      } catch (error) {
        console.error('Error al inicializar sesión:', error)
      } finally {
        setInitialized()
      }
    }

    initSession()

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setLoading(true)
            await loadUserData(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          clearSession()
        }
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      // Cargar perfil del usuario y membresía activa en paralelo
      const [usuarioRes, membresiaRes] = await Promise.all([
        supabase
          .from('usuarios')
          .select('*')
          .eq('id', userId)
          .is('borrado_en', null)
          .single(),
        supabase
          .from('membresias')
          .select('*')
          .eq('usuario_id', userId)
          .eq('estado', 'activa')
          .is('borrado_en', null)
          .maybeSingle(),
      ])

      const usuario = usuarioRes.data as Usuario | null
      const membresia = membresiaRes.data as Membresia | null

      if (!usuario) {
        clearSession()
        return
      }

      // Si tiene membresía activa, cargar inmobiliaria y permisos
      let inmobiliaria: Inmobiliaria | null = null
      let permisos: PermisosSecciones | null = null

      if (membresia) {
        const [inmobiliariaRes, permisosRes] = await Promise.all([
          supabase
            .from('inmobiliarias')
            .select('*')
            .eq('id', membresia.inmobiliaria_id)
            .is('borrado_en', null)
            .single(),
          supabase
            .from('permisos_secciones')
            .select('*')
            .eq('membresia_id', membresia.id)
            .single(),
        ])

        inmobiliaria = inmobiliariaRes.data as Inmobiliaria | null
        permisos = permisosRes.data as PermisosSecciones | null
      }

      setSession(usuario, membresia, inmobiliaria, permisos)
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error)
      clearSession()
    }
  }

  return { loadUserData }
}

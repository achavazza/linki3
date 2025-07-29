import { defineStore } from 'pinia'
import { api } from '@/utils/api'
import { helpers } from '@/utils/helpers'
import { supabase } from '@/supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    session: null,
    profiles: [],
    loading: false,
    error: null
  }),
  
  getters: {
    userData: (state) => {
      if (!state.user) return null
      return {
        email: state.user.email,
        username: state.user.user_metadata?.username || state.user.email.split('@')[0],
        avatar: state.user.user_metadata?.avatar_url || ''
      }
    }
  },
  
  actions: {
    setLoading(loading) {
      this.loading = loading
    },
    
    setError(error) {
      this.error = helpers.extractErrorMessage(error)
      this.loading = false
    },
    
    clearError() {
      this.error = null
    },
    
    async register({ email, password, username }) {
      try {
        this.setLoading(true)
        this.clearError()
        this.logout() // Cerrar cualquier sesión existente

        // Verificar si el username está disponible
        const { data: existing, error: checkError } = await api.executeQuery(
          supabase.from('users')
            .select('id')
            .eq('username', username)
            .maybeSingle()
        )

        if (checkError) throw checkError
        if (existing) throw new Error('El nombre de usuario ya está en uso')

        // Registrar usuario en Auth
        const { data: authData, error: authError } = await api.executeQuery(
          supabase.auth.signUp({ 
            email, 
            password,
            options: {
              data: {
                username,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
              }
            }
          })
        )

        if (authError) throw authError

        const user = authData.user
        if (!user) throw new Error('No se pudo obtener el usuario registrado')

        // Crear registro en tabla users
        const { error: dbError } = await api.create('users', {
          id: user.id,
          email,
          username,
          display_name: username,
          description: ''
        })

        if (dbError) throw dbError

        // Iniciar sesión automáticamente después del registro
        return await this.login(email, password)
      } catch (error) {
        this.setError(error)
        return { error }
      } finally {
        this.setLoading(false)
      }
    },

     async login(email, password) {
      try {
        this.loading = true
        this.error = null
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error
        
        // Asegurarse de asignar tanto user como session
        this.user = data?.user || null
        this.session = data?.session || null
        
        // Forzar persistencia
        await this.initUser()
        
        return { data, error: null }
      } catch (error) {
        this.error = error.message
        return { data: null, error }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        this.setLoading(true)
        await api.executeQuery(supabase.auth.signOut())
        this.user = null
        this.session = null
        this.profiles = []
        this.clearError()
      } catch (error) {
        this.setError(error)
      } finally {
        this.setLoading(false)
      }
    },

    async initUser() {
      try {
        this.loading = true
        
        // 1. Verificar si hay datos en el estado persistido
        if (this.user && this.session) {
          // Verificar si la sesión sigue siendo válida
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) throw error
          
          if (!session) {
            // Sesión expirada o inválida
            this.user = null
            this.session = null
            this.profiles = []
            return
          }
          
          // Actualizar con los datos más recientes
          this.session = session
          this.user = session.user
        } else {
          // 2. No hay datos persistidos, intentar obtener sesión
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) throw error
          
          this.session = session
          this.user = session?.user || null
        }
        
        // 3. Si hay usuario, cargar perfiles
        if (this.user) {
          await this.fetchProfiles()
        }
      } catch (error) {
        this.error = error.message
        // Limpiar estado en caso de error
        this.user = null
        this.session = null
        this.profiles = []
      } finally {
        this.loading = false
      }
    },

    async fetchProfiles() {
      try {
        if (!this.user) return
        
        this.setLoading(true)
        const { data, error } = await api.getAll(
          'profiles',
          { user_id: this.user.id },
          'created_at'
        )

        if (error) throw error

        this.profiles = data || []
      } catch (error) {
        this.setError(error)
        this.profiles = []
      } finally {
        this.setLoading(false)
      }
    },

    async createProfile(profileData) {
      try {
        this.setLoading(true)
        this.clearError()

        const { data, error } = await api.create('profiles', {
          ...profileData,
          user_id: this.user.id
        })

        if (error) throw error

        this.profiles.push(data)
        return { data, error: null }
      } catch (error) {
        this.setError(error)
        return { data: null, error }
      } finally {
        this.setLoading(false)
      }
    },

    async updateProfile(profileId, updates) {
      try {
        this.setLoading(true)
        this.clearError()

        const { data, error } = await api.update('profiles', profileId, updates)
        if (error) throw error

        const index = this.profiles.findIndex(p => p.id === profileId)
        if (index !== -1) {
          this.profiles[index] = data
        }

        return { data }
      } catch (error) {
        this.setError(error)
        return { error }
      } finally {
        this.setLoading(false)
      }
    },

    async deleteProfile(profileId) {
      try {
        this.setLoading(true)
        this.clearError()

        // 1. Primero eliminar todos los links asociados
        const { error: linksError } = await api.deleteAllProfileLinks(profileId)
        if (linksError) throw linksError

        // 2. Luego eliminar el perfil
        const { error } = await api.delete('profiles', profileId)
        if (error) throw error

        // 3. Actualizar la lista de perfiles en el estado
        this.profiles = this.profiles.filter(p => p.id !== profileId)

        return true
      } catch (error) {
        this.setError(error)
        return false
      } finally {
        this.setLoading(false)
      }
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user', // clave para el localStorage
        storage: localStorage,
        paths: ['user', 'session'] // solo persistir estos campos
      },
      {
        key: 'profiles',
        storage: sessionStorage, // los perfiles pueden ir en sessionStorage
        paths: ['profiles']
      }
    ]
  }
})
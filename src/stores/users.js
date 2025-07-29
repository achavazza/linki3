import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    session: null,
    profiles: [], // ahora todos los perfiles, todos activos
  }),
  getters: {
    userData(state) {
      if (!state.user) return null
      return {
        email: state.user.email,
        username: state.user.user_metadata?.username ?? '', // si usás metadata
      }
    },
  },
  actions: {
    async register({ email, password, username }) {
      this.logout() //primero deslogueate de la otra cuenta
      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (checkError) return { error: checkError }
      if (existing) return { error: { message: 'El nombre de usuario ya está en uso.' } }

      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return { error }

      const user = data.user || data.session?.user
      if (!user) return { error: { message: 'No se pudo obtener el usuario.' } }

      const display_name = email.split('@')[0]

      const { error: dbError } = await supabase.from('users').insert([
        {
          id: user.id,
          email,
          username,
          display_name,
          description: '',
        },
      ])
      if (dbError) return { error: dbError }

      return { data: user }
    },

    async login(email, password) {
      this.logout() //primero deslogueate de la otra cuenta
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (!error) {
        this.user = data.user
        this.session = data.session
        await this.fetchProfiles()
      }

      return { data, error }
    },

    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.session = null
      this.profiles = []
    },

    async initUser() {
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session
      this.user = session?.user ?? null
      if (this.user) {
        await this.fetchProfiles()
      }
    },

    async fetchProfiles() {
      if (!this.user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', this.user.id)

      if (error) {
        console.error('Error fetching profiles:', error)
        this.profiles = []
      } else {
        this.profiles = data || []
      }
    },

    async createProfile(profileData) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ ...profileData, user_id: this.user.id }])
        .select()
        .single()

      if (!error) {
        this.profiles.push(data)
      }

      return { data, error }
    },

    async updateProfile(profileId, updates) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single()

      if (!error) {
        const index = this.profiles.findIndex(p => p.id === profileId)
        if (index !== -1) this.profiles[index] = data
      }

      return { data, error }
    },
  },
})

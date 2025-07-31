import { ref } from 'vue'
import { useUserStore } from '@/stores/users'
import { useRouter } from 'vue-router'
import { api } from '@/utils/api'
import { helpers } from '@/utils/helpers'
import { useToast } from 'vue-toastification'
import { supabase } from '@/supabase'

const toast = useToast()

export const useAuth = () => {
  const userStore = useUserStore()
  const router = useRouter()
  
  // Estado reactivo
  const state = {
    email: ref(''),
    password: ref(''),
    username: ref(''),
    error: ref(''),
    success: ref(''),
    loading: ref(false)
  }

  // Validaciones
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const validateUsername = (username) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username)
  }

  // Métodos
  const resetMessages = () => {
    state.error.value = ''
    state.success.value = ''
  }

  const login = async () => {
    try {
      resetMessages()
      state.loading.value = true

      // Validaciones básicas
      if (!validateEmail(state.email.value)) {
        throw new Error('Por favor ingresa un email válido')
      }

      if (!validatePassword(state.password.value)) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      const { error: authError } = await userStore.login(
        state.email.value, 
        state.password.value
      )
      
      if (authError) throw authError

      toast.success('Login realizado con éxito')
      // Verificar si el usuario tiene perfiles
      const hasProfiles = userStore.profiles.length > 0
      router.push(hasProfiles ? '/profiles' : '/settings')
      
    } catch (err) {
      state.error.value = err.message || 'Error al iniciar sesión'
    } finally {
      state.loading.value = false
    }
  }
  
  const register = async () => {
    try {
      resetMessages()
      state.loading.value = true

      // Validaciones
      if (!validateEmail(state.email.value)) {
        throw new Error('Por favor ingresa un email válido')
      }

      if (!validatePassword(state.password.value)) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      if (!validateUsername(state.username.value)) {
        throw new Error('El nombre de usuario solo puede contener letras, números y guiones bajos')
      }

      // Verificar si el username está disponible
      const { data: existingUser, error: checkError } = await api.executeQuery(
        supabase.from('users')
          .select('id')
          .eq('username', state.username.value)
          .maybeSingle()
      )

      if (checkError) throw checkError
      if (existingUser) throw new Error('El nombre de usuario ya está en uso')

      // Registrar usuario
      const { error: authError, data: user } = await userStore.register({
        email: state.email.value,
        password: state.password.value,
        username: state.username.value
      })
      
      if (authError) {
        // Manejar específicamente el error de email no confirmado
        if (authError.message && authError.message.includes('Email not confirmed')) {
          state.success.value = 'Registro exitoso. Revisá tu email para confirmar tu cuenta antes de iniciar sesión.'
          return
        }
        throw authError
      }
      
      if (user) {
        // Usuario confirmado inmediatamente (puede variar según tu configuración)
        await userStore.fetchProfiles()
        router.push('/settings')
      } else {
        // Usuario necesita confirmación por email
        state.success.value = 'Registro exitoso. Revisá tu email para confirmar la cuenta.'
      }
    } catch (err) {
      state.error.value = helpers.extractErrorMessage(err) || 'Error en el registro'
    } finally {
      state.loading.value = false
    }
  }

  const logout = async () => {
    try {
      state.loading.value = true
      await userStore.logout()
      router.push('/login')
    } catch (err) {
      state.error.value = 'Error al cerrar sesión'
    } finally {
      state.loading.value = false
    }
  }
  
  return {
    ...state,
    login,
    register,
    logout,
    validateEmail,
    validatePassword,
    validateUsername
  }
}
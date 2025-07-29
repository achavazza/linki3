<template>
  <div>
    <h2 class="text-3xl font-semibold text-center mb-8">Ingresar</h2>
    
    <form @submit.prevent="login" class="space-y-6">
      <div>
        <label for="email" class="block mb-2 text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="tu@email.com"
          required
          :class="['w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2', 
                  validateEmail(email) || !email ? 'border-gray-300 focus:ring-indigo-500' : 'border-red-500 focus:ring-red-500']"
          @blur="validateEmail(email)"
        />
        <p v-if="email && !validateEmail(email)" class="mt-1 text-sm text-red-600">Email inválido</p>
      </div>

      <div>
        <label for="password" class="block mb-2 text-sm font-medium text-gray-700">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="********"
          required
          :class="['w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2', 
                  validatePassword(password) || !password ? 'border-gray-300 focus:ring-indigo-500' : 'border-red-500 focus:ring-red-500']"
          @blur="validatePassword(password)"
        />
        <p v-if="password && !validatePassword(password)" class="mt-1 text-sm text-red-600">
          La contraseña debe tener al menos 6 caracteres
        </p>
      </div>

      <button
        type="submit"
        :disabled="loading"
        :class="['w-full bg-indigo-600 text-white py-2 rounded-md font-semibold transition',
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700']"
      >
        <span v-if="loading">Ingresando...</span>
        <span v-else>Ingresar</span>
      </button>
    </form>

    <p v-if="error" class="mt-4 text-center text-red-600 font-semibold">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { 
  email,
  password,
  error,
  loading,
  login,
  validateEmail,
  validatePassword
} = useAuth()

// Limpiar mensajes al montar el componente
error.value = ''
</script>
<template>
  <div class="max-w-md mx-auto p-6">
    <h2 class="text-3xl font-semibold text-center mb-8">Ingresar</h2>
    
    <form @submit.prevent="login" class="space-y-6">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Email</span>
        </label>
        <input
          v-model="email"
          type="email"
          placeholder="tu@email.com"
          required
          class="input input-bordered w-full"
          :class="{ 'input-error': email && !validateEmail(email) }"
          @blur="validateEmail(email)"
        />
        <label v-if="email && !validateEmail(email)" class="label">
          <span class="label-text-alt text-error">Email inválido</span>
        </label>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Contraseña</span>
        </label>
        <input
          v-model="password"
          type="password"
          placeholder="********"
          required
          class="input input-bordered w-full"
          :class="{ 'input-error': password && !validatePassword(password) }"
          @blur="validatePassword(password)"
        />
        <label v-if="password && !validatePassword(password)" class="label">
          <span class="label-text-alt text-error">La contraseña debe tener al menos 6 caracteres</span>
        </label>
      </div>

      <button
        type="submit"
        class="btn btn-primary w-full"
        :disabled="loading"
      >
        <span v-if="loading" class="loading loading-spinner"></span>
        {{ loading ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>

    <div v-if="error" class="alert alert-error mt-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>
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

error.value = ''
</script>
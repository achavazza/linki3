<template>
  <div class="max-w-md mx-auto p-6">
    <h2 class="text-3xl font-semibold text-center mb-8">Registro de usuario</h2>

    <form @submit.prevent="register" class="space-y-6">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Email</span>
        </label>
        <input
          v-model="email"
          type="email"
          placeholder="tu@email.com"
          required
          class="input input-bordered"
          :class="{ 'input-error': email && !validateEmail(email) }"
          @blur="validateEmail(email)"
        />
        <label v-if="email && !validateEmail(email)" class="label">
          <span class="label-text-alt text-error">Email inválido</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Contraseña</span>
        </label>
        <input
          v-model="password"
          type="password"
          placeholder="********"
          required
          class="input input-bordered"
          :class="{ 'input-error': password && !validatePassword(password) }"
          @blur="validatePassword(password)"
        />
        <label v-if="password && !validatePassword(password)" class="label">
          <span class="label-text-alt text-error">La contraseña debe tener al menos 6 caracteres</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Nombre de usuario</span>
        </label>
        <input
          v-model="username"
          type="text"
          placeholder="Nombre de usuario"
          required
          class="input input-bordered"
          :class="{ 'input-error': username && !validateUsername(username) }"
          @blur="validateUsername(username)"
        />
        <label v-if="username && !validateUsername(username)" class="label">
          <span class="label-text-alt text-error">Solo letras, números y guiones bajos. Mínimo 3 caracteres.</span>
        </label>
      </div>

      <button
        type="submit"
        class="btn btn-primary w-full"
        :disabled="loading"
      >
        <span v-if="loading" class="loading loading-spinner"></span>
        {{ loading ? 'Registrando...' : 'Registrarse' }}
      </button>
    </form>

    <div v-if="error" class="alert alert-error mt-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-if="success" class="alert alert-success mt-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ success }}</span>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { 
  email,
  password,
  username,
  error,
  success,
  loading,
  register,
  validateEmail,
  validatePassword,
  validateUsername
} = useAuth()

error.value = ''
success.value = ''
</script>
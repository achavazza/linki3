<template>
  <div>
    <h2 class="text-3xl font-semibold text-center mb-8">Ingresar</h2>
    
    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label for="email" class="block mb-2 text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="tu@email.com"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label for="password" class="block mb-2 text-sm font-medium text-gray-700">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="********"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition"
      >
        Ingresar
      </button>
    </form>

    <p v-if="errorMessage" class="mt-4 text-center text-red-600 font-semibold">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/users'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const userStore = useUserStore()
const router = useRouter()

async function handleLogin() {
  errorMessage.value = ''
  const { error } = await userStore.login(email.value, password.value)

  if (error) {
    errorMessage.value = error.message
    return
  }
  /* 
  if (!userStore.activeProfile) {
    router.push('/settings') // Redirigir para crear primer perfil
  } else {
    router.push('/profiles')
  }
  */
  router.push('/profiles')
}
</script>

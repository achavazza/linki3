<template>
  <div>
    <h2 class="text-3xl font-semibold text-center mb-8">Registro de usuario</h2>

    <form @submit.prevent="handleRegister" class="space-y-6">
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

      <div>
        <label for="username" class="block mb-2 text-sm font-medium text-gray-700">Nombre de usuario</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Nombre de usuario"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition"
      >
        Registrarse
      </button>
    </form>

    <p v-if="errorMessage" class="mt-4 text-center text-red-600 font-semibold">
      {{ errorMessage }}
    </p>
    <p v-if="successMessage" class="mt-4 text-center text-green-600 font-semibold">
      {{ successMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/users'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const username = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const userStore = useUserStore()
const router = useRouter()

async function handleRegister() {
  errorMessage.value = ''
  successMessage.value = ''

  const { error, data: user } = await userStore.register({
    email: email.value,
    password: password.value,
    username: username.value,
  })

  if (error) {
    errorMessage.value = error.message
    return
  }

  if (user) {
    await userStore.fetchProfiles()
    router.push('/settings')
  } else {
    successMessage.value = 'Registro exitoso. Revisá tu email para confirmar la cuenta.'
  }

  email.value = ''
  password.value = ''
  username.value = ''
}
</script>

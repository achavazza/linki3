<template>
  <div class="max-w-md mx-auto">
    <h2 class="text-2xl font-semibold mb-6 text-center">Mi Cuenta</h2>

    <div v-if="user">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div class="px-4 py-2 border border-gray-300 rounded-md bg-gray-50">{{ user.email }}</div>
      </div>

      

      <RouterLink
        to="/profiles"
        class="block w-full text-center bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition"
      >
        Ver Perfiles
      </RouterLink>
    </div>

    <div v-else class="text-center text-gray-600">Cargando usuario...</div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/users'

const userStore = useUserStore()
const user = computed(() => userStore.userData)

onMounted(async () => {
  await userStore.initUser()
})
</script>

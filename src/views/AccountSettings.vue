<template>
  <div class="px-6 py-4">
    <h2 class="text-2xl font-semibold text-gray-800 text-center">Mi Cuenta</h2>
  </div>

  <div class="px-6 py-6">
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>

    <div v-else-if="user">
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div class="px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800">
          {{ user.email }}
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
        <div class="px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800">
          {{ user.username || 'No especificado' }}
        </div>
      </div>

      <div class="flex flex-col space-y-4 mt-8">
        <RouterLink
          to="/profiles"
          class="text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition"
        >
          Administrar Perfiles
        </RouterLink>

        <button
          @click="handleLogout"
          class="text-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>

    <div v-else class="text-center py-4 text-red-600 font-medium">
      {{ error || 'Error al cargar la información del usuario' }}
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/users'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const loading = ref(false)
const error = ref('')

const user = computed(() => userStore.userData)

onMounted(async () => {
  try {
    loading.value = true
    error.value = ''
    await userStore.initUser()
  } catch (err) {
    error.value = 'No se pudo cargar la información de tu cuenta'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const handleLogout = async () => {
  try {
    loading.value = true
    await userStore.logout()
    router.push('/login')
  } catch (err) {
    error.value = 'Error al cerrar sesión'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
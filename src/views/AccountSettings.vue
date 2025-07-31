<template>
  <div class="max-w-md mx-auto p-6">
    <h2 class="text-2xl font-semibold text-center mb-6">Mi Cuenta</h2>

    <div v-if="loading" class="flex justify-center py-4">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="user">

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <div class="input input-bordered flex items-center">
              {{ user.email }}
            </div>
          </div>

          <div class="form-control w-full mt-4">
            <label class="label">
              <span class="label-text">Nombre de usuario</span>
            </label>
            <div class="input input-bordered  flex items-center">
              {{ user.username || 'No especificado' }}
            </div>
          </div>

          <div class="flex flex-col space-y-4 mt-8">
            <RouterLink
              to="/profiles"
              class="btn btn-primary"
            >
              Administrar Perfiles
            </RouterLink>

            <button
              @click="handleLogout"
              class="btn btn-error"
            >
              Cerrar Sesión
            </button>
      </div>
    </div>


    <div v-else class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error || 'Error al cargar la información del usuario' }}</span>
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
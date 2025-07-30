<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Mis Perfiles</h1>
      <router-link
        to="/profiles/new"
        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        + Nuevo Perfil
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">Cargando perfiles...</p>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-600 font-semibold">
      {{ error }}
    </div>

    <div v-else-if="profiles.length === 0" class="text-gray-600">
      Aún no tienes perfiles.
    </div>

    <ul v-else class="space-y-6">
      <li
        v-for="profile in profiles"
        :key="profile.id"
        class="border p-4 rounded-md shadow-sm flex flex-col md:flex-row md:justify-between md:items-end gap-4"
      >
        <!-- Información principal -->
        <div class="flex-1 flex-col min-w-0">
          <h2 class="text-lg font-semibold truncate">{{ profile.display_name }}</h2>
          <p class="text-gray-600 text-sm mb-2 truncate">{{ profile.tagline || profile.description }}</p>
          <div class="flex gap-2">
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                v-model="profile.active" 
                @change="toggleProfileActive(profile)" 
                class="sr-only peer"
              >
              <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
            <router-link
              :to="`/profiles/${profile.id}/edit`"
              class="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 text-center"
            >
              Editar
            </router-link>
            <a
              :href="`${baseUrl}/p/${profile.slug}`"
              target="_blank"
              class="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 text-center"
            >
              Ver perfil público
            </a>
          </div>
        </div>

        <!-- QR + Link -->
        <div class="flex flex-col items-end gap-6">
          <div class="gap-2 text-right">
            <a
              :href="`${baseUrl}/p/${profile.slug}`"
              target="_blank"
              class="text-indigo-700 font-mono text-xs truncate hover:underline"
            >
              /{{ profile.slug }}
            </a>
          </div>
          <div class="w-36 h-36 flex-shrink-0">
            <qrcode-vue :value="`${baseUrl}/p/${profile.slug}`" :size="150" />
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/users'
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import QrcodeVue from 'qrcode.vue'

const userStore = useUserStore()
const baseUrl = window.location.origin
const loading = ref(true)
const error = ref(null)
const toast = useToast()

const profiles = computed(() => userStore.profiles)

const toggleProfileActive = async (profile) => {
  try {
    loading.value = true
    const { error: updateError } = await userStore.updateProfile(profile.id, {
      active: profile.active
    })
    
    if (updateError) throw updateError
    
    toast.info(`Perfil ${profile.active ? 'activado' : 'desactivado'}`)
  } catch (err) {
    toast.error('Error al actualizar el perfil')
    console.error(err)
    // Revertir el cambio si falla
    profile.active = !profile.active
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    await userStore.initUser()
    await userStore.fetchProfiles()
  } catch (err) {
    error.value = 'Error al cargar los perfiles'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
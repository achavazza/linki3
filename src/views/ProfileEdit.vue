<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h2 class="text-2xl font-bold text-center mb-6">Editar Perfil</h2>

    <form @submit.prevent="handleSave" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre público</label>
        <input 
          v-model="displayName" 
          :class="['w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2', 
                  errorField === 'displayName' ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500']"
        />
        <p v-if="errorField === 'displayName'" class="mt-1 text-sm text-red-600">
          El nombre público es obligatorio
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <input 
          v-model="tagline" 
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          v-model="description"
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <div>
        <h3 class="text-lg font-semibold mt-6 mb-2">Links</h3>
        <div v-for="(link, index) in links" :key="index" class="flex gap-3 items-center mb-2">
          <input
            v-model="link.title"
            placeholder="Título"
            :class="['flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    link.error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500']"
            @input="link.error = false"
          />
          <input
            v-model="link.url"
            placeholder="URL"
            :class="['flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    link.error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500']"
            @input="link.error = false"
          />
          <button
            type="button"
            class="text-red-600 font-semibold hover:text-red-800"
            @click="removeLink(index)"
            aria-label="Eliminar link"
          >
            ✕
          </button>
        </div>
        <p v-if="errorField === 'links'" class="mt-1 text-sm text-red-600">
          Todos los links deben tener título y URL válida
        </p>

        <button
          type="button"
          @click="addLink"
          class="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 transition"
        >
          + Agregar Link
        </button>
      </div>

      <div class="flex gap-4 justify-end mt-6">
        <router-link
          to="/profiles"
          class="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition"
        >
          Cancelar
        </router-link>
        <button
          type="submit"
          :disabled="loading"
          :class="['bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-indigo-700 transition',
                  loading ? 'opacity-70 cursor-not-allowed' : '']"
        >
          <span v-if="loading">Guardando...</span>
          <span v-else>Guardar Cambios</span>
        </button>
      </div>

      <p v-if="error" class="mt-4 text-center text-red-600 font-semibold">
        {{ error }}
      </p>
    </form>

    <section class="mt-10" v-if="profileSlug">
      <h3 class="text-lg font-semibold mb-2">Perfil público</h3>
      <div class="border p-4 rounded-md shadow-sm flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div class="flex-1 flex-col min-w-0">
          <h2 class="text-lg font-semibold truncate">{{ displayName }}</h2>
          <p class="text-gray-600 text-sm mb-2 truncate">{{ tagline || description }}</p>
        </div>

        <div class="flex flex-col items-end gap-6">
          <div class="gap-2 text-right">
            <a
              :href="`${baseUrl}/p/${profileSlug}`"
              target="_blank"
              class="text-indigo-700 font-mono text-xs truncate hover:underline"
            >
              /{{ profileSlug }}
            </a> 
          </div>
          <div class="w-36 h-36 flex-shrink-0">
            <qrcode-vue :value="`${baseUrl}/p/${profileSlug}`" :size="150" />
          </div>
        </div>
      </div>
    </section>

    <div class="flex justify-center gap-4 mt-4">
      <button 
        @click="downloadQr" 
        type="button" 
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        Descargar QR
      </button>
      <button 
        @click="downloadQrSvg" 
        type="button" 
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        Descargar QR SVG
      </button>
    </div>
    <!-- Sección de acciones peligrosas -->
    <div class="border border-red-400 bg-red-100 pt-6 mt-10 flex flex-row gap-2 rounded-md p-6 justify-between">
      <div class="flex items-center">
        <h3 class="text-lg font-semibold text-red-700">Zona peligrosa</h3>
      </div>
      <div class="flex">
        <button
        type="button"
        @click="showDeleteConfirm(profileId)"
        class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
        Eliminar permanentemente
        </button>
        </div>
    </div>
  </div>
  <!-- Diálogo de confirmación -->
  <ConfirmDialog
    v-if="showConfirmDialog"
    :show="showConfirmDialog"
    @confirm="deleteProfile"
    @cancel="showConfirmDialog = false"
  />
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useProfiles } from '@/composables/useProfiles'
import { useQr } from '@/composables/useQr'
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useUserStore } from '@/stores/users'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const profileId = route.params.id
const baseUrl = window.location.origin
const showConfirmDialog = ref(false)
const profileToDelete = ref(null)
const userStore = useUserStore()

const {
  displayName,
  tagline,
  description,
  links,
  loading,
  error,
  errorField,
  profileSlug,
  publicUrl,
  addLink,
  removeLink,
  saveProfile,
  loadProfile
} = useProfiles(profileId)

const { downloadQr, downloadQrSvg, QrcodeVue } = useQr()


// Cargar el perfil al montar el componente
loadProfile()

const handleSave = async () => {
  const success = await saveProfile()
  if (success) {
    toast.success('Perfil guardado correctamente')
    setTimeout(() => {
      router.push('/profiles')
    }, 1000);
  } else {
    toast.error('Error al guardar el perfil')
  }
}

const downloadProfileQr = async () => {
  try {
    await downloadQr(
      null, // No pasamos ref
      `QR-${displayName.value}`,
      `${baseUrl}/p/${profileSlug.value}`,
      200,
      'H'
    )
  } catch (error) {
    error.value = error.message
  }
}
const validateBeforeSave = () => {
  if (!displayName.value.trim()) {
    error.value = 'El nombre público es obligatorio'
    return false
  }
  
  const invalidLinks = links.value.filter(link => 
    !link.title.trim() || !link.url.trim()
  )
  
  if (invalidLinks.length > 0) {
    error.value = 'Todos los links deben tener título y URL válidos'
    invalidLinks.forEach(link => link.error = true)
    return false
  }
  
  return true
}


const showDeleteConfirm = (profileId) => {
  profileToDelete.value = profileId
  showConfirmDialog.value = true
}

const deleteProfile = async () => {
  showConfirmDialog.value = false
  
  if (!profileToDelete.value) return
  
  const success = await userStore.deleteProfile(profileToDelete.value)
  
  if (success) {
    toast.error('Perfil eliminado correctamente')
    router.push('/profiles')
  } else {
    toast.error(userStore.error || 'Error al eliminar el perfil')
  }
}
// Verificar cambios en profileSlug para debug
watch(profileSlug, (newVal) => {
  console.log('profileSlug cambió:', newVal)
})
</script>
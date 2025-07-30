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
        
        <!-- Lista de links existentes -->
        <div v-for="(link, index) in links" :key="index" class="flex gap-3 items-center mb-2">
          <!-- Mostrar input para website/custom, label para otros -->
          <template v-if="shouldShowTitleInput(link.type)">
            <input
              v-model="link.title"
              placeholder="Título del link"
              :class="['flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                      link.error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500']"
              @input="link.error = false"
            />
          </template>
          <template v-else>
            <div class="flex-1 px-3 py-2 bg-gray-100 rounded-md">
              {{ getLinkTypeLabel(link.type) }}
            </div>
          </template>

          <input
            v-model="link.url"
            :placeholder="getLinkPlaceholder(link.type)"
            :class="['flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    link.error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500']"
            @input="formatSocialUrl(link)"
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

        <!-- Botones principales para redes sociales comunes -->
        <div class="flex gap-2 mt-2 flex-wrap">
          <button
            type="button"
            @click="addLink('website')"
            class="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
          >
            + Sitio Web
          </button>
          <button
            type="button"
            @click="addLink('instagram')"
            class="bg-pink-600 text-white px-3 py-1 rounded-md hover:bg-pink-700 transition"
          >
            + Instagram
          </button>
          <button
            type="button"
            @click="addLink('facebook')"
            class="bg-blue-800 text-white px-3 py-1 rounded-md hover:bg-blue-900 transition"
          >
            + Facebook
          </button>
          <button
            type="button"
            @click="addLink('whatsapp')"
            class="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
          >
            + WhatsApp
          </button>
          <button
            type="button"
            @click="addLink('email')"
            class="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition"
          >
            + Email
          </button>
        </div>

        <!-- Selector para otras opciones -->
        <div class="flex gap-2 mt-4 items-center">
          <select
            v-model="selectedLinkType"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Otra red social...</option>
            <option 
              v-for="type in otherLinkTypes" 
              :key="type.value" 
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>

          <button
            type="button"
            @click="addSelectedLink"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            :disabled="!selectedLinkType"
          >
            Agregar
          </button>
        </div>

        <p v-if="errorField === 'links'" class="mt-1 text-sm text-red-600">
          Todos los links deben tener título y URL válida
        </p>
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
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
      >
        Descargar QR
      </button>
      <button 
        @click="downloadQrSvg" 
        type="button" 
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
      >
        Descargar QR SVG
      </button>
    </div>

    <div class="border border-red-400 bg-red-100 pt-6 mt-10 flex flex-row gap-2 rounded-md p-6 justify-between">
      <div class="flex items-center">
        <h3 class="text-lg font-semibold text-red-700">Zona peligrosa</h3>
      </div>
      <div class="flex">
        <button
          type="button"
          @click="showDeleteConfirm(profileId)"
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          Eliminar permanentemente
        </button>
      </div>
    </div>
  </div>

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
import { ref, computed, onMounted } from 'vue'
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
const selectedLinkType = ref('')

// Definición completa de tipos de links
const allLinkTypes = [
  { value: 'website', label: 'Sitio Web', baseUrl: '' },
  { value: 'facebook', label: 'Facebook', baseUrl: 'https://facebook.com/' },
  { value: 'instagram', label: 'Instagram', baseUrl: 'https://instagram.com/' },
  { value: 'twitter', label: 'Twitter', baseUrl: 'https://twitter.com/' },
  { value: 'linkedin', label: 'LinkedIn', baseUrl: 'https://linkedin.com/in/' },
  { value: 'youtube', label: 'YouTube', baseUrl: 'https://youtube.com/c/' },
  { value: 'whatsapp', label: 'WhatsApp', baseUrl: 'https://wa.me/' },
  { value: 'email', label: 'Email', baseUrl: 'mailto:' },
  { value: 'phone', label: 'Teléfono', baseUrl: 'tel:' },
  { value: 'custom', label: 'Personalizado', baseUrl: '' }
]

// Tipos principales para botones
const mainLinkTypes = ['website', 'instagram', 'facebook', 'whatsapp', 'email']
const otherLinkTypes = computed(() => 
  allLinkTypes.filter(type => !mainLinkTypes.includes(type.value))
)

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
  linkTypes,
  addLink,
  removeLink,
  saveProfile,
  loadProfile: originalLoadProfile // Renombramos la importación
} = useProfiles(profileId)

const { downloadQr, downloadQrSvg, QrcodeVue } = useQr()

// Función para asegurar que los links cargados tengan el type correcto
const ensureLinkTypes = (loadedLinks) => {
  return loadedLinks.map(link => {
    // Si el link ya tiene type, dejarlo como está
    if (link.type) return link
    
    // Si no tiene type pero tiene title, intentar determinar el type
    if (link.title) {
      const matchedType = allLinkTypes.find(t => 
        link.title.toLowerCase().includes(t.label.toLowerCase())
      )
      if (matchedType) {
        return { ...link, type: matchedType.value }
      }
    }
    
    // Default para links antiguos sin type
    return { ...link, type: 'custom' }
  })
}

// Función corregida para mostrar labels
const getLinkTypeLabel = (type) => {
  // Primero buscar en los tipos predefinidos
  const predefinedType = allLinkTypes.find(t => t.value === type)
  if (predefinedType) return predefinedType.label
  
  // Si no existe, verificar si es un tipo guardado en la store
  if (linkTypes.value) {
    const storeType = linkTypes.value.find(t => t.value === type)
    if (storeType) return storeType.label
  }
  
  // Si todo falla, devolver el type como último recurso
  return type || 'Link'
}

// Función para cargar el perfil con el procesamiento de links
const loadProfileWithTypes = async () => {
  await originalLoadProfile()
  if (links.value) {
    links.value = ensureLinkTypes(links.value)
  }
}

// Sobrescribir la función loadProfile en el template
const loadProfile = loadProfileWithTypes

const formatSocialUrl = (link) => {
  link.error = false
  const linkType = allLinkTypes.find(t => t.value === link.type)
  
  if (!linkType?.baseUrl || link.url.startsWith(linkType.baseUrl)) {
    return
  }

  // Formatear URLs de redes sociales
  if (linkType.baseUrl && !link.url.startsWith('http') && !link.url.startsWith('mailto:') && !link.url.startsWith('tel:')) {
    // Eliminar @ si existe y cualquier caracter no válido
    const cleanValue = link.url.replace(/^@/, '').replace(/\s+/g, '')
    if (cleanValue) {
      link.url = linkType.baseUrl + cleanValue
    }
  }
}

const getLinkPlaceholder = (type) => {
  const placeholders = {
    website: 'https://tusitio.com',
    facebook: 'facebook.com/tuUsuario',
    instagram: 'instagram.com/tuUsuario',
    twitter: 'twitter.com/tuUsuario',
    linkedin: 'linkedin.com/in/tuPerfil',
    youtube: 'youtube.com/c/tuCanal',
    whatsapp: 'número con código de país',
    email: 'tu@email.com',
    phone: '+541112345678',
    custom: 'https://ejemplo.com'
  }
  return placeholders[type] || 'Ingresa la URL'
}

const shouldShowTitleInput = (type) => {
  return ['website', 'custom'].includes(type)
}

const addSelectedLink = () => {
  if (selectedLinkType.value) {
    addLink(selectedLinkType.value)
    selectedLinkType.value = ''
  }
}

const handleSave = async () => {
  const success = await saveProfile()
  if (success) {
    toast.success('Perfil guardado correctamente')
    setTimeout(() => {
      router.push('/profiles')
    }, 1000)
  } else {
    toast.error('Error al guardar el perfil')
  }
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

// Cargar el perfil al montar el componente
onMounted(() => {
  loadProfile()
})
</script>
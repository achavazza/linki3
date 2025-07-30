<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6 text-center">Crear Nuevo Perfil</h1>

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
        
        <!-- Lista de links -->
        <div v-for="(link, index) in links" :key="index" class="flex gap-3 items-center mb-2">
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

        <!-- Botones principales y selector (igual que en ProfileEdit) -->
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
      </div>

      <section class="mt-10">
        <h3 class="text-lg font-semibold mb-2">Perfil público</h3>
        <div class="border p-4 rounded-md shadow-sm flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div class="flex-1 flex-col min-w-0">
            <h2 class="text-lg font-semibold truncate">{{ displayName }}</h2>
            <p class="text-gray-600 text-sm mb-2 truncate">{{ tagline || description }}</p>
          </div>

          <div class="flex flex-col items-end gap-6">
            <div class="gap-2 text-right">
              <span class="text-indigo-700 font-mono text-xs truncate hover:underline">
                /{{ slug }}
              </span>
            </div>
            <div class="w-36 h-36 flex-shrink-0">
              <qrcode-vue :value="`${baseUrl}/p/${slug}`" :size="150" />
            </div>
          </div>
        </div>
      </section>

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
          <span v-else>Guardar Perfil</span>
        </button>
      </div>

      <p v-if="error" class="mt-4 text-center text-red-600 font-semibold">
        {{ error }}
      </p>
    </form>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useProfiles } from '@/composables/useProfiles'
import { useQr } from '@/composables/useQr'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const baseUrl = window.location.origin
const selectedLinkType = ref('')


const {
  displayName,
  tagline,
  description,
  links,
  loading,
  error,
  errorField,
  slug,
  publicUrl,
  linkTypes,
  addLink,
  removeLink,
  saveProfile
} = useProfiles()

const { QrcodeVue } = useQr()

const updateLinkType = (index) => {
  const link = links.value[index]
  const type = linkTypes.value.find(t => t.value === link.type) || { label: 'Personalizado', needsName: true }
  
  link.title = type.label
  link.needsName = type.needsName || false
  link.url = ''
  link.error = false
}


// Función para mostrar labels (igual que en ProfileEdit)
const getLinkTypeLabel = (type) => {
  const predefinedType = allLinkTypes.find(t => t.value === type)
  if (predefinedType) return predefinedType.label
  
  if (linkTypes.value) {
    const storeType = linkTypes.value.find(t => t.value === type)
    if (storeType) return storeType.label
  }
  
  return type || 'Link'
}

// Función para formatear URLs sociales (igual que en ProfileEdit)
const formatSocialUrl = (link) => {
  link.error = false
  const linkType = allLinkTypes.find(t => t.value === link.type)
  
  if (!linkType?.baseUrl || link.url.startsWith(linkType.baseUrl)) {
    return
  }

  if (linkType.baseUrl && !link.url.startsWith('http') && 
      !link.url.startsWith('mailto:') && !link.url.startsWith('tel:')) {
    const cleanValue = link.url.replace(/^@/, '').replace(/\s+/g, '')
    if (cleanValue) {
      link.url = linkType.baseUrl + cleanValue
    }
  }
}
// Definición completa de tipos de links (igual que en ProfileEdit)
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
    router.push('/profiles')
  } else {
    toast.error('Error al guardar el perfil')
  }
}
</script>
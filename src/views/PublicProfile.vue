<template>
    <div v-if="profileNotFound || !profileActive" class="text-center py-20">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Perfil no encontrado</h1>
      <p class="text-gray-600">El perfil que estás buscando no existe o ha sido desactivado.</p>
      <router-link 
        to="/" 
        class="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
      >
        Volver al inicio
      </router-link>
    </div>

    <div v-else >
    <div class="px-6 py-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        {{ displayName }}
      </h1>
      <h2 v-if="tagline" class="text-xl text-gray-600 mb-4">
        {{ tagline }}
      </h2>
      <p v-if="description" class="text-gray-600 whitespace-pre-line">
        {{ description }}
      </p>
    </div>

    <!-- Links -->
    <div class="px-6 py-6  border-t border-gray-200" v-if="links.length">
      <ul class="space-y-4">
        <li v-for="link in links" :key="link.id">
          <a
            :href="helpers.formatUrl(link.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md transition duration-150 ease-in-out transform hover:scale-105"
          >
            {{ link.title }}
          </a>
        </li>
      </ul>
    </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/utils/api'
import { helpers } from '@/utils/helpers'
import { useProfiles } from '@/composables/useProfiles'

const route = useRoute()
const slug = route.params.slug
const profileNotFound = ref(false)

const {
  displayName,
  tagline,
  description,
  links,
  loading,
  error,
  loadProfile
} = useProfiles(null, slug) // Pasamos null para profileId y el slug

onMounted(async () => {
  try {
    loading.value = true
    await loadProfile()
    
    // Verificar si el perfil existe y está activo
    if (displayName.value === '' || error.value) {
      profileNotFound.value = true
    } else {
      // Necesitamos verificar el estado active del perfil directamente desde la API
      const { data: profileData, error: profileError } = await api.getBySlug('profiles', slug)
      
      if (profileError || !profileData) {
        profileNotFound.value = true
      } else {
        profileActive.value = profileData.active !== false
      }
    }
  } catch (err) {
    profileNotFound.value = true
    console.error('Error loading profile:', err)
  } finally {
    loading.value = false
  }
})
</script>
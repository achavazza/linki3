<template>
  

  <div v-if="!profileNotFound || profileActive"  class="container mx-auto">

    <div class="items-center text-center">
      <h1 class="text-center heading text-3xl font-extrabold">{{ displayName }}</h1>
      <h2 v-if="tagline" class="text-xl text-gray-600 font-bold">{{ tagline }}</h2>
      <p v-if="description" class="py-4 whitespace-pre-line">{{ description }}</p>
    </div>


    <div v-if="links.length" class=" bg-base-100 mt-5 pt-5 border-t-2  border-base-200">
        <div class="space-y-3">
          <a
            v-for="link in links"
            :key="link.id"
            :href="helpers.formatUrl(link.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary btn-block"
          >
            {{ link.title }}
          </a>

      </div>
    </div>
  </div>
  <div v-else>
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-2xl font-bold">Perfil no encontrado</h1>
        <p class="py-6">El perfil que estás buscando no existe o ha sido desactivado.</p>
        <router-link to="/" class="btn btn-primary">
          Volver al inicio
        </router-link>
      </div>
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
const profileActive = ref(false)

const {
  displayName,
  tagline,
  description,
  links,
  loading,
  error,
  loadProfile
} = useProfiles(null, slug)

onMounted(async () => {
  try {
    loading.value = true
    await loadProfile()
    
    if (displayName.value === '' || error.value) {
      profileNotFound.value = true
    } else {
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
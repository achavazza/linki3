<template>
  <!-- Loading state -->
  <div v-if="loading" class="hero-content text-center">
    <div class="max-w-md">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="py-6">Cargando perfil...</p>
    </div>
  </div>

  <!-- Profile found and active -->
  <div v-else-if="!profileNotFound && profileActive" class="container mx-auto">
    <div class="items-center text-center">
      <h1 v-if="displayName"class="text-center heading text-3xl font-bold">{{ displayName }}</h1>
      <h2 v-if="tagline" class="text-xl text-gray-600 font-bold">{{ tagline }}</h2>
      <p v-if="description" class="py-4 whitespace-pre-line">{{ description }}</p>
    </div>

    <div v-if="links.length" class=" mt-5 pt-5 border-t-2 border-base-200">
      <div class="space-y-3">
        <a
          v-for="link in links"
          :key="link.id"
          :href="helpers.formatUrl(link.url, link.type)"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-primary btn-block flex items-center gap-2"
        > 
          <span
            v-if="linkTypesStore.getLinkType(link.type)?.icon"
            class="inline-block"
            v-html="linkTypesStore.getLinkType(link.type).icon"
          ></span>
          <span>{{ link.title || link.url }}</span>
        </a>
      </div>
    </div>
  </div>

  <!-- Profile not found or inactive -->
  <div v-else>
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-2xl font-bold">Perfil no encontrado</h1>
        <p class="py-6">El perfil que estás buscando no existe o ha sido desactivado.</p>
        <!--
          <router-link to="/" class="btn btn-primary">
            Volver al inicio
          </router-link>
          -->
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
import { useLinkTypesStore } from '@/stores/linkTypes'
import { supabase } from '@/supabase'

const linkTypesStore = useLinkTypesStore()


const route = useRoute()
const slug = route.params.slug
const profileNotFound = ref(null)
const profileActive = ref(null)

const {
  displayName,
  tagline,
  description,
  links,
  loading,
  error,
  loadProfile
} = useProfiles(null, slug)

const getLinkIcon = (type) => {
  const typeData = linkTypesStore.getLinkType(type)
  return typeData?.icon || ''
}

onMounted(async () => {
  try {
    loading.value = true
    await loadProfile()
    
    if (displayName.value === '' || error.value) {
      profileNotFound.value = true
      profileActive.value = false
    } else {
      // Intentar buscar por handle primero, luego por slug
      let profileData = null
      let profileError = null
      
      // Buscar por handle
      const { data: handleData, error: handleError } = await api.executeQuery(
        supabase.from('profiles')
          .select('*')
          .eq('handle', slug)
          .single()
      )
      
      if (!handleError && handleData) {
        profileData = handleData
      } else {
        // Si no se encuentra por handle, buscar por slug
        const { data: slugData, error: slugError } = await api.getBySlug('profiles', slug)
        profileData = slugData
        profileError = slugError
      }
      
      if (profileError || !profileData) {
        profileNotFound.value = true
        profileActive.value = false
      } else {
        profileNotFound.value = false
        profileActive.value = profileData.active !== false
      }
    }
  } catch (err) {
    profileNotFound.value = true
    profileActive.value = false
    console.error('Error loading profile:', err)
  } finally {
    loading.value = false
  }
})
</script>
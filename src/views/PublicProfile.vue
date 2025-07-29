<template>
  <div>
    <div v-if="loading" class="text-center text-gray-600 text-lg">Cargando...</div>

    <div v-else-if="error" class="text-center text-red-600 font-semibold">{{ error }}</div>

    <div v-else>
      <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">
        {{ profile.display_name }}
      </h1>
      <h1 class="text-1xl font-bold text-center mb-6 text-gray-800">
        {{ profile.tagline }}
      </h1>
      <p class="text-center text-gray-600 mb-8 whitespace-pre-line">
        {{ profile.description }}
      </p>

      <ul class="flex flex-col items-center gap-4">
        <li v-for="link in links" :key="link.id" class="w-full max-w-xs">
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="block text-center bg-indigo-600 text-white text-lg font-medium rounded-md py-3 px-6 hover:bg-indigo-700 transition"
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
import { supabase } from '@/supabase'

const route = useRoute()
const slug = route.params.slug  // no usas username, mejor eliminarlo si no se usa

const profile = ref(null)
const links = ref([])
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Obtener perfil según slug
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (profileError || !profileData) {
      error.value = 'Perfil no encontrado'
      loading.value = false
      return
    }

    profile.value = profileData

    // Obtener links asociados
    const { data: linksData, error: linksError } = await supabase
      .from('links')
      .select('*')
      .eq('profile_id', profileData.id)
      .order('position', { ascending: true })

    if (linksError) {
      error.value = 'Error cargando links'
      links.value = []
    } else {
      links.value = linksData
    }
  } catch (e) {
    error.value = 'Error inesperado'
    links.value = []
  } finally {
    loading.value = false
  }
})
</script>

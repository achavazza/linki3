<template>
   <!-- Header del perfil -->
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/utils/api'
import { helpers } from '@/utils/helpers'
import { useProfiles } from '@/composables/useProfiles'

const route = useRoute()
const slug = route.params.slug

const {
  displayName,
  tagline,
  description,
  links,
  loading,
  error,
  loadProfile
} = useProfiles(null, slug) // Pasamos null para profileId y el slug

onMounted(() => {
  loadProfile()
})
</script>
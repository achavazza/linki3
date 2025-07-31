<template>
  <component :is="currentLayout">
    <RouterView />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'

const route = useRoute()

const currentLayout = computed(() => {
  // Use public layout for routes with meta.layout === 'public'
  if (route.meta.layout === 'public') {
    return PublicLayout
  }
  // Default to DefaultLayout for all other routes
  return DefaultLayout
})
</script>
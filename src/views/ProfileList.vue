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

    <div v-if="userStore.profiles.length === 0" class="text-gray-600">Aún no tienes perfiles.</div>

    <ul v-else class="space-y-6">
      <li
        v-for="profile in userStore.profiles"
        :key="profile.id"
        class="border p-4 rounded-md shadow-sm flex flex-col md:flex-row md:justify-between md:items-end gap-4"
      >
        <!-- Información principal -->
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold truncate">{{ profile.display_name }}</h2>
          <p class="text-gray-600 text-sm mb-2 truncate">{{ profile.tagline || profile.description }}</p>
          <router-link
              :to="`/profiles/${profile.id}/edit`"
              class="bg-indigo-600 text-white mr-2 px-3 py-1 rounded-md hover:bg-indigo-700 text-center"
            >
              Editar
            </router-link>
          <a
            :href="`${baseUrl}/p/${profile.slug}`"
            target="_blank"
            class="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 text-center"
            >Ver perfil público</a
            >  
        </div>

        <!-- QR + Link -->
        <div class="flex flex-col items-end gap-6">
          <div class="w-36 h-36 flex-shrink-0">
            <qrcode-vue :value="`${baseUrl}/p/${profile.slug}`" :size="144" />
          </div>
          <div class=" gap-2 min-w-[180px]">
            <a
              :href="`${baseUrl}/p/${profile.slug}`"
              target="_blank"
              class="text-indigo-700 font-mono text-xs truncate hover:underline"
            >
              {{ baseUrl }}/p/{{ profile.slug }}
            </a>
            
            
          </div>
          
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/users'
import { onMounted, computed } from 'vue'
import QrcodeVue from 'qrcode.vue'  // Importa el componente QR

const userStore = useUserStore()
const baseUrl = window.location.origin

onMounted(async () => {
  await userStore.initUser()
  await userStore.fetchProfiles()
})
</script>

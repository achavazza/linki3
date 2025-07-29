<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6 text-center">Crear Nuevo Perfil</h1>

    <form @submit.prevent="handleSave" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre público</label>
        <input 
          v-model="displayName" 
          :class="['w-full px-4 py-2 border rounded-md', errorField === 'displayName' ? 'border-red-500' : 'border-gray-300']"
        />
        <p v-if="errorField === 'displayName'" class="mt-1 text-sm text-red-600">
          El nombre público es obligatorio
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <input v-model="tagline" class="w-full px-4 py-2 border border-gray-300 rounded-md" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea 
          v-model="description" 
          rows="4" 
          class="w-full px-4 py-2 border border-gray-300 rounded-md resize-none"
        ></textarea>
      </div>
      
      <div>
        <h3 class="text-lg font-semibold mt-6 mb-2">Links</h3>
        <div v-for="(link, index) in links" :key="index" class="flex gap-3 items-center mb-2">
          <input 
            v-model="link.title" 
            placeholder="Título" 
            :class="['flex-1 px-3 py-2 border rounded-md', link.error ? 'border-red-500' : 'border-gray-300']"
          />
          <input 
            v-model="link.url" 
            placeholder="URL" 
            :class="['flex-1 px-3 py-2 border rounded-md', link.error ? 'border-red-500' : 'border-gray-300']"
          />
          <button 
            @click="removeLink(index)" 
            type="button" 
            class="text-red-500 font-bold"
          >
            ✕
          </button>
        </div>
        <p v-if="errorField === 'links'" class="mt-1 text-sm text-red-600">
          Todos los links deben tener título y URL válida
        </p>

        <button 
          @click="addLink" 
          type="button" 
          class="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
        >
          + Agregar Link
        </button>
      </div>
      <!--
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600 mb-2">Tu perfil estará disponible en:</p>
          <a :href="publicUrl" target="_blank" class="text-indigo-600 font-semibold underline break-all">
            {{ publicUrl }}
          </a>
        </div>
        -->

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
              <div class="w-36 h-36 flex-shrink-0">
                <qrcode-vue :value="`${baseUrl}/p/${profileSlug}`" :size="150" />
              </div>
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
      :class="['bg-indigo-600  text-white px-6 py-2 rounded-md font-semibold hover:bg-indigo-700 transition',
                  loading ? 'opacity-70 cursor-not-allowed' : '']"
      ><span v-if="loading">Guardando...</span>
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
import { ref, watch } from 'vue'
import { useProfiles } from '@/composables/useProfiles'
import { useRouter } from 'vue-router'
import { useQr } from '@/composables/useQr'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const baseUrl = ref(window.location.origin)

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
  addLink,
  removeLink,
  saveProfile
} = useProfiles()

const {  QrcodeVue } = useQr()

// Configurar redirección después de guardar
const handleSave = async () => {
  const success = await saveProfile()
  if (success) {
    toast.success('Perfil guardado correctamente')
    router.push('/profiles')
  }
}
</script>
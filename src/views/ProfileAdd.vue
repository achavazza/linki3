<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6 text-center">Crear Nuevo Perfil</h1>

    <form @submit.prevent="handleSave" class="space-y-6">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Nombre público</span>
        </label>
        <input 
          v-model="displayName" 
          type="text" 
          placeholder="Nombre público" 
          class="input input-bordered"
          :class="{ 'input-error': errorField === 'displayName' }"
        />
        <label v-if="errorField === 'displayName'" class="label">
          <span class="label-text-alt text-error">El nombre público es obligatorio</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Tagline</span>
        </label>
        <input 
          v-model="tagline" 
          type="text" 
          placeholder="Tagline" 
          class="input input-bordered"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Descripción</span>
        </label>
        <textarea
          v-model="description"
          rows="4"
          placeholder="Descripción"
          class="textarea textarea-bordered"
        ></textarea>
      </div>

      <div class="form-control">
        <h3 class="text-lg font-semibold mb-2">Links</h3>
        
        <div v-for="(link, index) in links" :key="index" class="flex gap-3 items-center mb-2">
          <template v-if="shouldShowTitleInput(link.type)">
            <input
              v-model="link.title"
              placeholder="Título del link"
              class="input input-bordered flex-1"
              :class="{ 'input-error': link.error }"
              @input="link.error = false"
            />
          </template>
          <template v-else>
            <div class="input flex-1 bg-base-200">
              {{ getLinkTypeLabel(link.type) }}
            </div>
          </template>

          <input
            v-model="link.url"
            :placeholder="getLinkPlaceholder(link.type)"
            class="input input-bordered flex-1"
            :class="{ 'input-error': link.error }"
            @input="formatSocialUrl(link)"
          />

          <button
            type="button"
            class="btn btn-circle btn-sm btn-error"
            @click="removeLink(index)"
            aria-label="Eliminar link"
          >
            ✕
          </button>
        </div>

        <div class="flex gap-2 mt-2 flex-wrap">
          <button
            type="button"
            @click="addLink('website')"
            class="btn btn-primary btn-sm"
          >
            + Sitio Web
          </button>
          <button
            type="button"
            @click="addLink('instagram')"
            class="btn btn-primary btn-sm bg-pink-600 border-pink-600"
          >
            + Instagram
          </button>
          <button
            type="button"
            @click="addLink('facebook')"
            class="btn btn-primary btn-sm bg-blue-800 border-blue-800"
          >
            + Facebook
          </button>
          <button
            type="button"
            @click="addLink('whatsapp')"
            class="btn btn-primary btn-sm bg-green-600 border-green-600"
          >
            + WhatsApp
          </button>
          <button
            type="button"
            @click="addLink('email')"
            class="btn btn-primary btn-sm bg-gray-600 border-gray-600"
          >
            + Email
          </button>
        </div>

        <div class="flex gap-2 mt-4 items-center">
          <select
            v-model="selectedLinkType"
            class="select select-bordered flex-1"
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
            class="btn btn-primary"
            :disabled="!selectedLinkType"
          >
            Agregar
          </button>
        </div>
      </div>

      <section class="mt-10">
        <h3 class="text-lg font-semibold mb-2">Perfil público</h3>
        <div class="card bg-base-100 shadow">
          <div class="card-body flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div class="flex-1">
              <h2 class="card-title truncate">{{ displayName }}</h2>
              <p class="text-gray-600 text-sm truncate">{{ tagline || description }}</p>
            </div>

            <div class="flex flex-col items-end gap-2">
              <span class="text-primary font-mono text-xs truncate">
                /{{ slug }}
              </span>
              <div class="w-36 h-36">
                <qrcode-vue :value="`${baseUrl}/p/${slug}`" :size="150" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="flex gap-4 justify-end mt-6">
        <router-link
          to="/profiles"
          class="btn btn-ghost"
        >
          Cancelar
        </router-link>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
        >
          <span v-if="loading" class="loading loading-spinner"></span>
          {{ loading ? 'Guardando...' : 'Guardar Perfil' }}
        </button>
      </div>

      <div v-if="error" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
    </form>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useProfiles } from '@/composables/useProfiles'
import { useQr } from '@/composables/useQr'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useLinkTypesStore } from '@/stores/linkTypes'

const router = useRouter()
const toast = useToast()
const baseUrl = window.location.origin
const selectedLinkType = ref('')

const linkTypesStore = useLinkTypesStore()

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

const { QrcodeVue } = useQr()

const getLinkTypeLabel = (type) => {
  const linkType = linkTypesStore.getLinkType(type)
  return linkType.label
}

const otherLinkTypes = computed(() => linkTypesStore.otherLinkTypes)
const shouldShowTitleInput = (type) => linkTypesStore.shouldShowTitleInput(type)
const getLinkPlaceholder = (type) => linkTypesStore.getLinkPlaceholder(type)

const formatSocialUrl = (link) => {
  link.url = linkTypesStore.formatSocialUrl(link)
}

const addSelectedLink = () => {
  if (selectedLinkType.value) {
    addLink(selectedLinkType.value)
    selectedLinkType.value = ''
  }
}

const handleSave = async () => {
  links.value.forEach(link => {
    if (link.url) {
      link.url = linkTypesStore.formatSocialUrl(link)
    }
  })
  
  const success = await saveProfile()
  if (success) {
    toast.success('Perfil guardado correctamente')
    router.push('/profiles')
  } else {
    toast.error('Error al guardar el perfil')
  }
}
</script>
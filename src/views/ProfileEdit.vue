<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold text-center mb-6">Editar Perfil</h2>

    <form @submit.prevent="handleSave" class="space-y-6">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Nombre público</span>
        </label>
        <input 
          v-model="displayName" 
          type="text" 
          class="input input-bordered"
          :class="{ 'input-error': errorField === 'displayName' }"
        />
        <label v-if="errorField === 'displayName'" class="label">
          <span class="label-text-alt text-error">El nombre público es obligatorio</span>
        </label>
      </div>

      <!-- Cambiar todas las referencias de handle por slug -->
      <div class="form-control">
        <label class="label">
          <span class="label-text">Slug único</span>
        </label>
        <div class="flex gap-2">
          <input
            v-model="slug"
            type="text"
            placeholder="mi-perfil"
            class="input input-bordered flex-1"
            :class="{ 
              'input-error': slug && !validateSlug(slug) || errorField === 'slug',
              'input-success': slug && slugAvailability === 'available',
              'input-warning': slug && slugAvailability === 'checking'
            }"
            @blur="validateSlug(slug)"
            @input="onSlugInput"
          />
          <button
            type="button"
            class="btn btn-outline"
            :disabled="!slug || !validateSlug(slug) || slugAvailability === 'checking'"
            @click="checkSlugAvailability"
          >
            <span v-if="slugAvailability === 'checking'" class="loading loading-spinner loading-sm"></span>
            {{ slugAvailability === 'checking' ? 'Verificando...' : 'Verificar' }}
          </button>
        </div>
        <label v-if="slug && !validateSlug(slug)" class="label">
          <span class="label-text-alt text-error">Solo letras, números y guiones. Mínimo 3 caracteres.</span>
        </label>
        <label v-if="slug && slugAvailability === 'available'" class="label">
          <span class="label-text-alt text-success">✅ Slug disponible</span>
        </label>
        <label v-if="slug && slugAvailability === 'unavailable'" class="label">
          <span class="label-text-alt text-error">❌ Slug no disponible</span>
        </label>
        <label v-if="errorField === 'slug'" class="label">
          <span class="label-text-alt text-error">{{ error }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Tagline</span>
        </label>
        <input 
          v-model="tagline" 
          type="text" 
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
          class="textarea textarea-bordered"
        ></textarea>
      </div>

      <div class="form-control">
        <h3 class="text-lg font-semibold mb-2">Links</h3>
        
        <div v-for="(link, index) in links" :key="index" class="flex gap-2 items-center mb-2">
          <template v-if="shouldShowTitleInput(link.type)">
            <input
              v-model="link.title"
              placeholder="Título del link"
              class="input input-bordered flex-[1] max-w-[120px]"
              :class="{ 'input-error': link.error }"
              @input="link.error = false"
            />
          </template>
          <template v-else>
            <div class="content-center input flex-[1] max-w-[120px] bg-base-200">
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
            class="btn btn-square btn-sm btn-error size-10"
            @click="removeLink(index)"
            aria-label="Eliminar link"
          >
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /> </svg>
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
            class="btn btn-primary btn-sm bg-pink-400 border-pink-600 hover:bg-pink-500 hover:border-pink-600 hover:text-white"
          >
            + Instagram
          </button>
          <button
            type="button"
            @click="addLink('facebook')"
            class="btn btn-primary btn-sm bg-blue-400 border-blue-600  hover:bg-blue-500 hover:border-blue-600 hover:text-white"
          >
            + Facebook
          </button>
          <button
            type="button"
            @click="addLink('whatsapp')"
            class="btn btn-primary btn-sm bg-green-400 border-green-600  hover:bg-green-500 hover:border-green-600 hover:text-white"
          >
            + WhatsApp
          </button>
          <button
            type="button"
            @click="addLink('email')"
            class="btn btn-primary btn-sm bg-gray-400 border-gray-600  hover:bg-gray-500 hover:border-gray-600 hover:text-white"
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

      <div class="flex gap-4 justify-end mt-6">
        <router-link
          to="/profiles"
          class="btn btn-default"
        >
          Cancelar
        </router-link>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
        >
          <span v-if="loading" class="loading loading-spinner"></span>
          {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>

      <div v-if="error" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
    </form>

    <section class="mt-10" v-if="profileSlug">
      <h3 class="text-lg font-semibold mb-2">Perfil público</h3>
      <div class="card bg-base-100 border-base-200 border rounded-xl ">
        <div class="card-body flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div class="flex-1">
            <h2 class="card-title truncate">{{ displayName }}</h2>
            <p class="text-gray-600 text-sm truncate">{{ tagline || description }}</p>
          </div>

          <div class="flex flex-col items-end gap-2">
            <a
              :href="`${baseUrl}/p/${profileSlug}`"
              target="_blank"
              class="text-primary font-mono text-xs hover:underline"
            >
              /{{ profileSlug }}
            </a>
            <div class="w-36 h-36">
              <qrcode-vue :value="`${baseUrl}/p/${profileSlug}`" :size="150" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 
      <div class="flex justify-center gap-4 mt-4">
            <button 
            @click="downloadQr" 
            class="btn btn-primary"
            >
            Descargar QR
          </button>
          <button 
          @click="downloadQrSvg" 
          class="btn btn-primary"
          >
          Descargar QR SVG
        </button>
      </div>
      -->

    <div class="alert alert-error mt-10">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <h3 class="font-bold">Zona peligrosa</h3>
      </div>
      <button
        @click="showDeleteConfirm(profileId)"
        class="btn btn-error btn-sm"
      >
        Eliminar permanentemente
      </button>
    </div>
  </div>

  <ConfirmDialog
    v-if="showConfirmDialog"
    :show="showConfirmDialog"
    @confirm="deleteProfile"
    @cancel="showConfirmDialog = false"
  />
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useProfiles } from '@/composables/useProfiles'
import { useQr } from '@/composables/useQr'
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useUserStore } from '@/stores/users'
import { useLinkTypesStore } from '@/stores/linkTypes'
import QrcodeVue from 'qrcode.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const profileId = route.params.id
const baseUrl = window.location.origin
const showConfirmDialog = ref(false)
const profileToDelete = ref(null)
const userStore = useUserStore()
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
  profileSlug,
  publicUrl,
  slug,
  slugAvailability,
  addLink,
  removeLink,
  saveProfile,
  loadProfile,
  validateSlug,
  checkSlugAvailability,
  onSlugInput
} = useProfiles(profileId, route.params.slug) // Asegúrate de pasar el slug aquí

const { downloadQr, downloadQrSvg } = useQr()

const getLinkTypeLabel = (type) => linkTypesStore.getLinkType(type).label
const shouldShowTitleInput = (type) => linkTypesStore.shouldShowTitleInput(type)
const getLinkPlaceholder = (type) => linkTypesStore.getLinkPlaceholder(type)
const otherLinkTypes = computed(() => linkTypesStore.otherLinkTypes)

const formatSocialUrl = (link) => {
  link.error = false
  const formattedUrl = linkTypesStore.formatSocialUrl(link)
  if (formattedUrl !== link.url) {
    link.url = formattedUrl
  }
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
    setTimeout(() => {
      router.push('/profiles')
    }, 1000)
  }
}

const showDeleteConfirm = (profileId) => {
  profileToDelete.value = profileId
  showConfirmDialog.value = true
}

const deleteProfile = async () => {
  showConfirmDialog.value = false
  
  if (!profileToDelete.value) return
  
  try {
    const success = await userStore.deleteProfile(profileToDelete.value)
    if (success) {
      toast.success('Perfil eliminado correctamente')
      router.push('/profiles')
    }
  } catch (err) {
    toast.error(err.message || 'Error al eliminar el perfil')
  }
}

onMounted(() => {
  loadProfile().then(() => {
    // Después de cargar el perfil, verificar disponibilidad del slug si existe
    /*if (slug.value) {
      checkSlugAvailability()
    }*/
  })
})
</script>
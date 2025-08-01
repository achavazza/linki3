<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Mis Perfiles</h1>
      <router-link to="/profiles/new" class="btn btn-default">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>

        Agregar Perfil
      </router-link>
    </div>
<!-- 
  <div v-if="loading" class="flex justify-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
  <div v-else-if="error" class="alert alert-error">
    -->

    <div v-if="error" class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-if="profiles.length === 0" class="text-center text-gray-600">
      Aún no tienes perfiles.
    </div>

    <div v-else class="space-y-4">
      <div v-for="profile in profiles" :key="profile.id" class="card bg-base-100 border-base-200 border rounded-xl">
        <div class="card-body">
          <div class="flex flex-col md:flex-row md:justify-between gap-4">
            <div class="flex-1 flex flex-col justify-between">
              <div>
              <div class="flex items-center gap-2">
                <h2 class="card-title truncate">{{ profile.display_name }}</h2>
                
              </div>
              <p class="text-gray-600 text-sm truncate">{{ profile.tagline || profile.description }}</p>
              </div>
              <div class="flex flex-wrap gap-2 mt-2">
                <div class="w-full flex items-left">
                  <label class="label cursor-pointer gap-2">
                    <input 
                    type="checkbox" 
                    v-model="profile.active" 
                    @change="toggleProfileActive(profile)"
                    class="toggle toggle-primary"
                    />
                    <div class="badge" :class="profile.active ? 'badge-success' : 'badge-default'">
                      {{ profile.active ? 'Activo' : 'Inactivo' }}
                    </div>
                  </label>
                </div>
                <div class="w-full flex gap-2">
                  <a :href="`${baseUrl}/p/${profile.slug}`" target="_blank" class="btn  btn-default btn-sm">
                    Ver
                  </a>
                  <router-link :to="`/profiles/${profile.id}/edit`" class="btn  btn-default btn-sm">
                    Editar
                  </router-link>
                   <a href="#" @click.prevent="openQrModal(profile.slug)" class="btn btn-sm btn-default" >
                    Descargar QR
                  </a>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-end gap-2">
              <a :href="`${baseUrl}/p/${profile.slug}`" target="_blank" class="text-primary text-xs hover:underline">
                /{{ profile.slug }}
              </a>
              <div class="w-36 h-36">
                <qrcode-vue :value="`${baseUrl}/p/${profile.slug}`" :size="150" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <QrModal 
    ref="qrModal" 
    :profile-slug="selectedProfileSlug" 
    v-if="selectedProfileSlug"
  />
</template>

<script setup>
import { useUserStore } from '@/stores/users'
import { computed, onMounted, ref, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import QrcodeVue from 'qrcode.vue'
import QrModal from '@/components/QrModal.vue'

const userStore = useUserStore()
const baseUrl = window.location.origin
const loading = ref(true)
const error = ref(null)
const toast = useToast()

const profiles = computed(() => userStore.profiles)
const qrModal = ref(null)
const selectedProfileSlug = ref('')



const toggleProfileActive = async (profile) => {
  try {
    loading.value = true
    const { error: updateError } = await userStore.updateProfile(profile.id, {
      active: profile.active
    })
    
    if (updateError) throw updateError
    
    toast.info(`Perfil ${profile.active ? 'activado' : 'desactivado'}`)
  } catch (err) {
    toast.error('Error al actualizar el perfil')
    console.error(err)
    profile.active = !profile.active
  } finally {
    loading.value = false
  }
}

const openQrModal = async (slug) => {
  selectedProfileSlug.value = slug
  await nextTick()
  qrModal.value?.openModal()
}

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    await userStore.initUser()
    await userStore.fetchProfiles()
  } catch (err) {
    error.value = 'Error al cargar los perfiles'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
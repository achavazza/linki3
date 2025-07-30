<template>
  <div class="container mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">Mis Perfiles</h2>

    <div v-if="loading" class="flex justify-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="error" class="alert alert-error mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-else>
      <ul class="space-y-4 mb-8">
        <li v-for="profile in userStore.profiles" :key="profile.id" class="card bg-base-100 shadow">
          <div class="card-body">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="card-title">{{ profile.display_name }}</h3>
                <p class="text-sm text-gray-600">{{ profile.slug }}</p>
              </div>
              <button 
                @click="selectProfile(profile)" 
                class="btn btn-primary btn-sm"
              >
                Editar
              </button>
            </div>
          </div>
        </li>
      </ul>

      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="card-title mb-4">Crear nuevo perfil</h3>
          <form @submit.prevent="createNewProfile" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Nombre público</span>
              </label>
              <input
                v-model="newProfile.display_name"
                placeholder="Nombre público"
                class="input input-bordered"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">URL (slug)</span>
              </label>
              <input
                v-model="newProfile.slug"
                placeholder="URL (slug)"
                class="input input-bordered"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Descripción</span>
              </label>
              <textarea
                v-model="newProfile.description"
                placeholder="Descripción"
                class="textarea textarea-bordered"
              ></textarea>
            </div>

            <button type="submit" class="btn btn-success">
              Crear
            </button>
          </form>
        </div>
      </div>

      <div v-if="activeProfile" class="card bg-base-100 shadow mt-6">
        <div class="card-body">
          <h3 class="card-title">Editando: {{ activeProfile.display_name }}</h3>
          <!-- Aquí podrías poner un componente editable de links o detalles del perfil -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/users'
import { supabase } from '@/supabase'

const userStore = useUserStore()

const newProfile = reactive({
  display_name: '',
  slug: '',
  description: '',
})

const activeProfile = ref(null)
const links = ref([])
const loading = ref(false)
const error = ref(null)

function selectProfile(profile) {
  userStore.activeProfile = profile
  activeProfile.value = profile
  loadLinks(profile)
}

async function loadLinks(profile) {
  loading.value = true
  error.value = null
  const { data, error: linksError } = await supabase
    .from('links')
    .select('id, title, url, position')
    .eq('profile_id', profile.id)
    .order('position', { ascending: true })

  if (linksError) {
    error.value = 'Error cargando los links: ' + linksError.message
    links.value = []
  } else {
    links.value = data
  }
  loading.value = false
}

async function createNewProfile() {
  if (!newProfile.display_name || !newProfile.slug) {
    alert('Por favor completa el nombre público y el slug.')
    return
  }

  const { data, error: createError } = await userStore.createProfile({
    display_name: newProfile.display_name,
    slug: newProfile.slug,
    description: newProfile.description,
  })

  if (createError) {
    alert('Error al crear perfil: ' + createError.message)
  } else {
    alert('Perfil creado correctamente.')
    newProfile.display_name = ''
    newProfile.slug = ''
    newProfile.description = ''
    await userStore.fetchProfiles()
  }
}

onMounted(() => {
  if (userStore.activeProfile) {
    activeProfile.value = userStore.activeProfile
    loadLinks(userStore.activeProfile)
  }
})
</script>
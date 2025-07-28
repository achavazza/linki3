<template>
  <div>
    <h2>Mis Perfiles</h2>

    <ul>
      <li v-for="profile in userStore.profiles" :key="profile.id" class="mb-2">
        <strong>{{ profile.display_name }}</strong> —
        <em>{{ profile.slug }}</em>
        <button @click="selectProfile(profile)" class="ml-2 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Editar
        </button>
      </li>
    </ul>

    <h3 class="mt-6">Crear nuevo perfil</h3>
    <form @submit.prevent="createNewProfile" class="space-y-3 max-w-md">
      <input
        v-model="newProfile.display_name"
        placeholder="Nombre público"
        class="w-full border px-3 py-2 rounded"
      />
      <input
        v-model="newProfile.slug"
        placeholder="URL (slug)"
        class="w-full border px-3 py-2 rounded"
      />
      <textarea
        v-model="newProfile.description"
        placeholder="Descripción"
        class="w-full border px-3 py-2 rounded"
      />
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Crear
      </button>
    </form>

    <div v-if="activeProfile" class="mt-8">
      <h3>Editando: {{ activeProfile.display_name }}</h3>
      <!-- Aquí podrías poner un componente editable de links o detalles del perfil -->
    </div>

    <div v-if="loading" class="mt-4">Cargando...</div>
    <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
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
    // Actualizar lista
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

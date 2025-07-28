<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h2 class="text-2xl font-bold text-center mb-6">Editar Perfil</h2>

    <form @submit.prevent="saveProfile" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre público</label>
        <input v-model="displayName" type="text" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <input v-model="tagline" type="text" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          v-model="description"
          rows="4"
          class="w-full px-4 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <div>
        <h3 class="text-lg font-semibold mt-6 mb-2">Links</h3>
        <div v-for="(link, index) in links" :key="index" class="flex gap-3 items-center mb-2">
          <input
            v-model="link.title"
            placeholder="Título"
            class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            v-model="link.url"
            placeholder="URL"
            class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            class="text-red-600 font-semibold hover:text-red-800"
            @click="removeLink(index)"
            aria-label="Eliminar link"
          >
            ✕
          </button>
        </div>
        <button
          type="button"
          @click="addLink"
          class="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 transition"
        >
          + Agregar Link
        </button>
      </div>

      <div class="flex gap-4 justify-end mt-6">
        <router-link
          to="/profiles"
          class="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition"
        >
          Cancelar
        </router-link>
        <button
          type="submit"
          class="bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-indigo-700 transition"
        >
          Guardar Cambios
        </button>
      </div>
    </form>

    <section class="mt-10 text-center" v-if="profileSlug">
      <h3 class="text-lg font-semibold mb-2">Perfil público</h3>
      <a
        :href="`${baseUrl}/p/${profileSlug}`"
        target="_blank"
        class="text-indigo-600 hover:underline break-all"
      >
        {{ baseUrl }}/p/{{ profileSlug }}
      </a>

      <div class="mt-4 inline-block mx-auto">
        <qrcode-vue :value="`${baseUrl}/p/${profileSlug}`" :size="160" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { supabase } from '@/supabase'
import QrcodeVue from 'qrcode.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const profileId = route.params.id
const displayName = ref('')
const tagline = ref('')
const description = ref('')
const links = ref([])
const profileSlug = ref('')
const baseUrl = window.location.origin

onMounted(async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (error || !data) {
    alert('No se pudo cargar el perfil')
    router.push('/profiles')
    return
  }

  displayName.value = data.display_name || ''
  tagline.value = data.tagline || ''
  description.value = data.description || ''
  profileSlug.value = data.slug || ''

  const { data: linksData } = await supabase
    .from('links')
    .select('*')
    .eq('profile_id', profileId)
    .order('position', { ascending: true })

  links.value = linksData || []
})

function addLink() {
  links.value.push({ title: '', url: '', position: links.value.length })
}

function removeLink(index) {
  links.value.splice(index, 1)
}

async function saveProfile() {

    
  const { error: updateError } = await userStore.updateProfile(profileId, {
    display_name: displayName.value,
    tagline: tagline.value,
    description: description.value,
  })

  if (updateError) {
    alert('Error al actualizar el perfil: ' + updateError.message)
    return
  }

  // Eliminar links anteriores
  await supabase.from('links').delete().eq('profile_id', profileId)

  const formattedLinks = links.value.map((link, i) => {
    let url = link.url.trim()
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    return { ...link, url, position: i, profile_id: profileId }
  })

  const { error: insertError } = await supabase.from('links').insert(formattedLinks)

  if (insertError) {
    alert('Error al guardar los links: ' + insertError.message)
  } else {
    alert('Perfil actualizado correctamente')
    router.push('/profiles')
  }
}
</script>


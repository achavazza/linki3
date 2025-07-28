<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6 text-center">Crear Nuevo Perfil</h1>

    <form @submit.prevent="submitProfile" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre público</label>
        <input v-model="displayName" class="w-full px-4 py-2 border rounded-md" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <input v-model="tagline" class="w-full px-4 py-2 border rounded-md" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea v-model="description" rows="4" class="w-full px-4 py-2 border rounded-md resize-none"></textarea>
      </div>

      <div>
        <h3 class="text-lg font-semibold mt-6 mb-2">Links</h3>

        <div v-for="(link, index) in links" :key="index" class="flex gap-3 items-center mb-2">
          <input v-model="link.title" placeholder="Título" class="flex-1 px-3 py-2 border rounded-md" />
          <input v-model="link.url" placeholder="URL" class="flex-1 px-3 py-2 border rounded-md" />
          <button @click="removeLink(index)" type="button" class="text-red-500 font-bold">✕</button>
        </div>

        <button @click="addLink" type="button" class="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">
          + Agregar Link
        </button>
      </div>

      <div class="text-center mt-6">
        <p class="text-sm text-gray-600 mb-2">Tu perfil estará disponible en:</p>
        <a :href="publicUrl" target="_blank" class="text-indigo-600 font-semibold underline break-all">{{ publicUrl }}</a>
      </div>

      <div ref="canvasWrapper" class="text-center mt-4">
        <qrcode-vue :value="publicUrl" :size="160" level="M" render-as="canvas" />
      </div>

      <div class="flex justify-center gap-4 mt-4">
        <button @click="downloadQr" type="button" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Descargar QR
        </button>
      </div>

      <button type="submit" class="block w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700">
        Guardar Perfil
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { supabase } from '@/supabase'
import QrcodeVue from 'qrcode.vue'

const displayName = ref('')
const tagline = ref('')
const description = ref('')
const links = ref([])
const canvasWrapper = ref(null)

const router = useRouter()
const userStore = useUserStore()

function addLink() {
  links.value.push({ title: '', url: '' })
}

function removeLink(index) {
  links.value.splice(index, 1)
}

const slug = computed(() => {
  return displayName.value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
})

async function isSlugAvailable(slug) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('slug', slug)
    .limit(1)
    .single()

  return !data  // true si no existe otro perfil con ese slug
}

const publicUrl = computed(() => {
  return `${window.location.origin}/p/${slug.value}`
})

async function submitProfile() {
    const slugValue = slug.value
    if (!(await isSlugAvailable(slugValue))) {
    alert('Este nombre público ya está en uso. Por favor, elige otro.')
    return
  }

  if (!displayName.value.trim()) {
    alert('El nombre público es obligatorio.')
    return
  }

  if (links.value.some(link => !link.title || !link.url)) {
    alert('Todos los links deben tener título y URL.')
    return
  }

  // Crear perfil
  const { data: profile, error } = await userStore.createProfile({
    display_name: displayName.value.trim(),
    tagline: tagline.value.trim(),
    description: description.value.trim(),
    slug: slug.value,
    active: true,
  })

  if (error || !profile) {
    alert('Error al crear perfil: ' + (error?.message || 'Desconocido'))
    return
  }

  // Formatear y guardar links
  const formattedLinks = links.value.map((link, i) => {
    let url = link.url.trim()
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url

    return {
      ...link,
      url,
      position: i,
      profile_id: profile.id,
    }
  })

  const { error: linksError } = await supabase.from('links').insert(formattedLinks)

  if (linksError) {
    alert('Perfil creado, pero hubo error al guardar los links: ' + linksError.message)
  } else {
    alert('Perfil creado correctamente.')
  }

  router.push('/profiles')
}

async function downloadQr() {
  await nextTick()
  const canvas = canvasWrapper.value?.querySelector('canvas')
  if (!canvas) return alert('No se encontró el código QR.')
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `QR-${slug.value}.png`
  a.click()
}
</script>

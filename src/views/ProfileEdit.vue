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

    <section class="mt-10" v-if="profileSlug">
    <h3 class="text-lg font-semibold mb-2">Perfil público</h3>
        <div class="border p-4 rounded-md shadow-sm flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div class="flex-1 flex-col min-w-0">
            <h2 class="text-lg font-semibold truncate">{{ displayName }}</h2>
            <p class="text-gray-600 text-sm mb-2 truncate">{{ tagline || description }}</p>
          </div>

          <!-- QR + Link -->
          <div class="flex flex-col items-end gap-6">
            <div class="gap-2  text-right">
              <a
                :href="`${baseUrl}/p/${profileSlug}`"
                target="_blank"
                class="text-indigo-700 font-mono text-xs truncate hover:underline"
              >
                <!--{{ baseUrl }}/p/{{ slug }}-->
                /{{ profileSlug }}
              </a> 
            </div>
            <div class="w-36 h-36 flex-shrink-0">
              <qrcode-vue :value="`${baseUrl}/p/${profileSlug}`" :size="150" />
            </div>
        </div>

       
        
      </div>
    </section>

     <div ref="canvasWrapper" class="text-center mt-4 hidden">
        <qrcode-vue :value="`${baseUrl}/p/${profileSlug}`" :size="150" level="M" render-as="canvas" />
      </div>
      <div ref="svgWrapper" class="hidden">
        <qrcode-vue ref="svgQrRef" :value="`${baseUrl}/p/${profileSlug}`" :size="150" level="M" render-as="svg" />
      </div>

      <div class="flex justify-center gap-4 mt-4">
        <button @click="downloadQr" type="button" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Descargar QR
        </button>
        <button @click="downloadQrSvg" type="button" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Descargar QR SVG
        </button>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { supabase } from '@/supabase'
import { v4 as uuidv4 } from 'uuid'
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
const url = ref(null)
const canvasWrapper = ref(null)
const svgWrapper = ref(null)

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
  return {
    id: uuidv4(),  // ⚠️ nuevo ID para todos
    title: link.title,
    url,
    position: i,
    profile_id: profileId,
  }
})

  const { error: insertError } = await supabase.from('links').insert(formattedLinks)

  if (insertError) {
    alert('Error al guardar los links: ' + insertError.message)
  } else {
    alert('Perfil actualizado correctamente')
    router.push('/profiles')
  }
}


async function downloadQr() {
  await nextTick()

  if (!canvasWrapper.value) {
    alert('No se encontró el contenedor del QR')
    return
  }

  const canvas = canvasWrapper.value.querySelector('canvas')
  if (!canvas) {
    alert('No se encontró el canvas dentro del QR')
    return
  }

  const url = canvas.toDataURL('image/png')
  triggerDownload(url, `QR-${displayName.value}.png`)
}

async function downloadQrSvg() {
  await nextTick()
  if (!svgWrapper.value) {
    alert('No se encontró el contenedor del QR')
    return
  }
  const svg = svgWrapper.value.querySelector('svg')
  if (!svg) {
    alert('No se encontró el SVG dentro del QR')
    return
  }
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svg)
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  triggerDownload(url, `QR-${displayName.value}.svg`)

  URL.revokeObjectURL(url)
}

function triggerDownload(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
</script>


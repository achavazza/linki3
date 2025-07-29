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

      <section class="mt-10">
    <h3 class="text-lg font-semibold mb-2">Perfil público</h3>
        <div class="border p-4 rounded-md shadow-sm flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div class="flex-1 flex-col min-w-0">
            <h2 class="text-lg font-semibold truncate">{{ displayName }}</h2>
            <p class="text-gray-600 text-sm mb-2 truncate">{{ tagline || description }}</p>
          </div>

          <!-- QR + Link -->
          <div class="flex flex-col items-end gap-6">
            <div class="gap-2  text-right">
              <span
                :href="`${baseUrl}/p/${slug}`"
                target="_blank"
                class="text-indigo-700 font-mono text-xs truncate hover:underline"
              >
                <!--{{ baseUrl }}/p/{{ slug }}-->
                /{{ slug }}
              </span> 
            </div>
            <div class="w-36 h-36 flex-shrink-0">
              <qrcode-vue :value="publicUrl" :size="150" level="M"  />
            </div>
        </div>
        
      </div>
    </section>
      <!--
        <div ref="canvasWrapper" class="text-center mt-4 hidden">
          <qrcode-vue :value="publicUrl" :size="160" level="M" render-as="canvas" />
        </div>
        <div ref="svgWrapper" class="hidden">
          <qrcode-vue ref="svgQrRef" :value="publicUrl" :size="160" level="M" render-as="svg" />
        </div>
        
        <div class="flex justify-center gap-4 mt-4">
          <button @click="downloadQr" type="button" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Descargar QR
          </button>
          <button @click="downloadQrSvg" type="button" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Descargar QR SVG
          </button>
        </div>
      -->

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
const url = ref(null)
const canvasWrapper = ref(null)
const svgWrapper = ref(null)

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

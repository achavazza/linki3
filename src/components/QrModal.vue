<template>
  <div class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box max-w-2xl relative">
      <h3 class="font-bold text-lg">Descargar Código QR</h3>
      <button
        @click="closeModal"
        class="absolute top-3 right-3  btn btn-square btn-sm btn-default size-10"
        aria-label="Cerrar modal">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      
      <div class="flex flex-col items-center py-6">
        <div class="w-64 h-64 mb-4" ref="qrRef">
          <qrcode-vue :value="qrValue" :size="256" />
        </div>
        
        <div class="flex gap-4">
          <button @click="downloadPng" class="btn btn-primary">Descargar PNG</button>
          <button @click="downloadSvg" class="btn btn-primary">Descargar SVG</button>
        </div>
      </div>

      <div id="qr-canvas-hidden" style="position: absolute; left: -9999px; top: -9999px;">
        <qrcode-vue ref="qrCanvasRef" :value="qrValue" :size="256" render-as="canvas" margin="2" />
        <qrcode-vue ref="qrSvgRef"    :value="qrValue" :size="256" render-as="svg" margin="2" />
      </div>
      
      
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { useToast } from 'vue-toastification'

const isOpen = ref(false)
const openModal = () => isOpen.value = true
const closeModal = () => isOpen.value = false
defineExpose({ openModal, closeModal })

const toast = useToast()

const props = defineProps({
  profileSlug: {
    type: String,
    required: true
  }
})

const qrValue = ref(`${window.location.origin}/p/${props.profileSlug}`)

const qrCanvasRef = ref(null)
const qrSvgRef = ref(null)

const downloadPng = async () => {
  await nextTick()
  const canvas = document.querySelector('#qr-canvas-hidden canvas')
  if (!canvas) {
    toast.error('No se pudo encontrar el canvas')
    return
  }
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = `qr-${props.profileSlug}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success('QR descargado como PNG')
}


const downloadSvg = async () => {
  await nextTick()
  const svg = document.querySelector('#qr-canvas-hidden svg')
  if (!svg) {
    toast.error('No se pudo encontrar el SVG')
    return
  }

  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svg)
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `qr-${props.profileSlug}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  toast.success('QR descargado como SVG')
}

</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
      <p class="mb-6">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <button 
          @click="onCancel"
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button 
          @click="onConfirm"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Confirmar eliminación'
  },
  message: {
    type: String,
    default: '¿Estás seguro que deseas eliminar este perfil? Esta acción no se puede deshacer.'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const onConfirm = () => emit('confirm')
const onCancel = () => emit('cancel')
</script>
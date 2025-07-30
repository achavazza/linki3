<template>
  <div v-if="show" class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ title }}</h3>
      <p class="py-4">{{ message }}</p>
      <div class="modal-action">
        <button @click="onCancel" class="btn btn-ghost">Cancelar</button>
        <button @click="onConfirm" class="btn btn-error">Confirmar</button>
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
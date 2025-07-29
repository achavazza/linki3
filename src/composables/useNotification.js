import { ref } from 'vue'

export function useNotification() {
  const notification = ref(null)
  const show = ref(false)

  const notify = (message, type = 'success') => {
    notification.value = { message, type }
    show.value = true
    setTimeout(() => {
      show.value = false
    }, 3000)
  }

  return {
    notification,
    show,
    success: (message) => notify(message, 'success'),
    error: (message) => notify(message, 'error'),
    info: (message) => notify(message, 'info'),
    warning: (message) => notify(message, 'warning')
  }
}
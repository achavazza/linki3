// src/router/guards.js
import { useUserStore } from '@/stores/users'

export const authGuard = (to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.user) {
    next({
      path: '/login',
      query: { redirect: to.fullPath } // Guardamos la ruta a la que intentaba acceder
    })
  } else {
    next()
  }
}
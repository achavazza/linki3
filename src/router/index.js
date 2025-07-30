import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'
import { useUserStore } from '@/stores/users'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true } // Protegemos esta ruta
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/AccountSettings.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/u/:username',
      name: 'PublicProfile',
      component: () => import('@/views/PublicProfile.vue'),
    },
    {
      path: '/p/:slug',
      name: 'PublicProfile',
      component: () => import('@/views/PublicProfile.vue'),
    },
    {
      path: '/profiles',
      name: 'profiles',
      component: () => import('@/views/ProfileList.vue'),
      meta: { requiresAuth: true } 
    },
    {
      path: '/profiles/new',
      name: 'profile-add',
      component: () => import('@/views/ProfileAdd.vue'),
      meta: { requiresAuth: true } 
    },
    {
      path: '/profiles/:id/edit',
      name: 'ProfileEdit',
      component: () => import('@/views/ProfileEdit.vue'),
      meta: { requiresAuth: true },
      props: true,
    },
  ],

  
})


// Aplicamos el guard globalmente
router.beforeEach(authGuard)

export default router

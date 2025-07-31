<template>
  <div>
    <header class="navbar bg-base-100 shadow-sm relative">
      <div class="container flex mx-auto px-4">
        <div class="flex-1">
          <!-- Logo -->
          <RouterLink to="/" class="btn btn-ghost text-xl text-primary">MiLogo</RouterLink>
        </div>
        
        <!-- Menú Desktop -->
        <nav class="hidden md:flex items-center gap-2">
          <RouterLink 
            to="/" 
            exact-active-class="btn-active" 
            class="btn btn-ghost"
          >
            Inicio
          </RouterLink>
          

          <!-- Mostrar si NO está logueado -->
          <template v-if="!user">
            <RouterLink 
              to="/login" 
              active-class="btn-active" 
              class="btn btn-ghost"
            >
              Login
            </RouterLink>
            <RouterLink 
              to="/register" 
              active-class="btn-active" 
              class="btn btn-ghost"
            >
              Registro
            </RouterLink>
          </template>

          <!-- Mostrar si está logueado -->
          <template v-else>
            <RouterLink 
              to="/profiles" 
              active-class="btn-active" 
              class="btn btn-ghost"
            >
              Perfiles
            </RouterLink>
            <RouterLink 
              to="/settings" 
              active-class="btn-active" 
              class="btn btn-ghost"
            >
              Ajustes
            </RouterLink>
            <button 
              @click="handleLogout" 
              class="btn btn-ghost text-error"
            >
              Logout
            </button>
          </template>
        </nav>

        <!-- Botón Hamburguesa Mobile -->
        <div class="md:hidden">
          <button
            @click="toggleMenu"
            class="btn btn-square btn-ghost"
            aria-label="Toggle menu"
          >
            <svg
              v-if="!menuOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Menú Mobile -->
      <nav
        v-show="menuOpen"
        class="md:hidden bg-base-100 shadow-md w-full absolute top-full left-0 z-50 flex flex-col"
      >
        <RouterLink
          to="/"
          exact-active-class="bg-primary text-primary-content"
          class="block px-6 py-3 hover:bg-base-200 w-full"
          @click="closeMenu"
        >
        Inicio
        </RouterLink>
        <!--
              <RouterLink
              to="/about"
              active-class="bg-primary text-primary-content"
              class="block px-6 py-3 hover:bg-base-200"
              @click="closeMenu"
            >
            Sobre
          </RouterLink>
          -->

        <!-- Mostrar si NO está logueado -->
        <template v-if="!user">
          <RouterLink
            to="/login"
            active-class="bg-primary text-primary-content"
            class="block px-6 py-3 hover:bg-base-200 w-full"
            @click="closeMenu"
          >
            Login
          </RouterLink>
          <RouterLink
            to="/register"
            active-class="bg-primary text-primary-content"
            class="block px-6 py-3 hover:bg-base-200 w-full"
            @click="closeMenu"
          >
            Registro
          </RouterLink>
        </template>

        <!-- Mostrar si está logueado -->
        <template v-else>
          <RouterLink
            to="/profiles"
            active-class="bg-primary text-primary-content"
            class="block px-6 py-3 hover:bg-base-200 w-full"
            @click="closeMenu"
          >
            Perfiles
          </RouterLink>
          <RouterLink
            to="/settings"
            active-class="bg-primary text-primary-content"
            class="block px-6 py-3 hover:bg-base-200 w-full"
            @click="closeMenu"
          >
            Ajustes
          </RouterLink>
          <button 
            @click="handleLogout" 
            class="block w-full text-left px-6 py-3 hover:bg-base-200 text-error w-full"
          >
            Logout
          </button>
        </template>
      </nav>
    </header>
    <div class="pb-10">
      <main class="container mx-auto max-w-xl p-6 mt-6 bg-base-100 rounded-3xl border border-base-300">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/users'

const menuOpen = ref(false)
const userStore = useUserStore()
const user = computed(() => userStore.user) 
const router = useRouter()

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

async function handleLogout() {
  await userStore.logout()
  closeMenu()
  router.push('/')
}
</script> 
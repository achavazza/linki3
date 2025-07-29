<template>
  <header class="bg-white shadow-md py-4">
    <div class="container mx-auto flex items-center justify-between px-4">
      <!-- Logo -->
      <RouterLink to="/" class="text-xl font-bold text-indigo-600">MiLogo</RouterLink>

      <!-- Menú Desktop -->
      <nav class="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
        <RouterLink to="/" exact-active-class="text-indigo-600 font-semibold" class="hover:text-indigo-600">Home</RouterLink>
        <RouterLink to="/about" active-class="text-indigo-600 font-semibold" class="hover:text-indigo-600">About</RouterLink>

        <!-- Mostrar si NO está logueado -->
        <template v-if="!user">
          <RouterLink to="/login" active-class="text-indigo-600 font-semibold" class="hover:text-indigo-600">Login</RouterLink>
          <RouterLink to="/register" active-class="text-indigo-600 font-semibold" class="hover:text-indigo-600">Register</RouterLink>
        </template>

        <!-- Mostrar si está logueado -->
        <template v-else>
          <RouterLink to="/profiles" active-class="text-indigo-600 font-semibold" class="hover:text-indigo-600">Profiles</RouterLink>
          <RouterLink to="/settings" active-class="text-indigo-600 font-semibold" class="hover:text-indigo-600">Settings</RouterLink>
          <button @click="handleLogout" class="text-indigo-600 font-semibold hover:text-indigo-800 cursor-pointer bg-transparent border-none">
            Logout
          </button>
        </template>
      </nav>

      <!-- Botón Hamburguesa Mobile -->
      <button
        @click="toggleMenu"
        class="md:hidden flex items-center text-gray-700 focus:outline-none"
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

    <!-- Menú Mobile -->
    <nav
      v-show="menuOpen"
      class="md:hidden bg-white shadow-md mt-2 rounded-b-lg"
    >
      <RouterLink
        to="/"
        exact-active-class="text-indigo-600 font-semibold"
        class="block px-6 py-3 border-b border-gray-200 hover:bg-indigo-50"
        @click="closeMenu"
        >Home</RouterLink>
      <RouterLink
        to="/about"
        active-class="text-indigo-600 font-semibold"
        class="block px-6 py-3 border-b border-gray-200 hover:bg-indigo-50"
        @click="closeMenu"
        >About</RouterLink>

      <!-- Mostrar si NO está logueado -->
      <template v-if="!user">
        <RouterLink
          to="/login"
          active-class="text-indigo-600 font-semibold"
          class="block px-6 py-3 border-b border-gray-200 hover:bg-indigo-50"
          @click="closeMenu"
          >Login</RouterLink
        >
        <RouterLink
          to="/register"
          active-class="text-indigo-600 font-semibold"
          class="block px-6 py-3 border-b border-gray-200 hover:bg-indigo-50"
          @click="closeMenu"
          >Register</RouterLink
        >
      </template>

      <!-- Mostrar si está logueado -->
      <template v-else>
        <RouterLink
          to="/profiles"
          active-class="text-indigo-600 font-semibold"
          class="block px-6 py-3 border-b border-gray-200 hover:bg-indigo-50"
          >Profiles</RouterLink
        >
        <RouterLink
          to="/settings"
          active-class="text-indigo-600 font-semibold"
          class="block px-6 py-3 border-b border-gray-200 hover:bg-indigo-50"
          @click="closeMenu"
          >Settings</RouterLink
        >
        <button @click="handleLogout" class="text-indigo-600 font-semibold hover:text-indigo-800 cursor-pointer bg-transparent border-none">
          Logout
        </button>
      </template>
    </nav>
  </header>

  <main class="container mx-auto max-w-xl p-6 mt-6 bg-white rounded-3xl border border-gray-300 mb-10">
    <RouterView />
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink, RouterView } from 'vue-router'
import { useUserStore } from './stores/users'

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

function handleLogout() {
  userStore.logout()
  closeMenu()
  router.push('/')
}


</script>


<template>
  <main class="text-center">
    <div class="mb-5">
      <h2 class="text-3xl font-bold mb-5">
        Linki3    
      </h2>
      <p>
        Comparte tu perfil digital con un código QR 
      </p>
      <hr class="w-10 border mx-auto mt-6 mb-4" />
      <p class="">
        Accede a crear una cuenta o ingresar a tu cuenta
      </p>
    </div>
    <div class="flex gap-2">
      <router-link to="/login" class="btn btn-primary flex-1">
        Login
      </router-link>
      <router-link to="/register" class="btn btn-default flex-1">
        Registro
      </router-link>
    </div>
  </main>
</template>

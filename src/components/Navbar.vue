<template>
  <nav class="bg-white shadow-lg border-b border-neutral-200 sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo y nombre -->
        <router-link to="/" class="flex items-center space-x-3 group">
          <div class="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
            <IconChefHat class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-display font-bold text-neutral-900">TOSCANA</h1>
            <p class="text-xs text-neutral-500 hidden sm:block">Experiencia culinaria premium</p>
          </div>
        </router-link>

        <!-- Navegación desktop -->
        <div class="hidden md:flex items-center space-x-1">
          <router-link
            to="/"
            class="flex items-center space-x-2 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 hover:text-primary-600 transition-all duration-200 font-medium"
            :class="{ 'bg-primary-50 text-primary-700': $route.path === '/' }"
          >
            <IconMenu class="w-4 h-4" />
            <span>Menú</span>
          </router-link>

          <router-link
            to="/admin"
            class="flex items-center space-x-2 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 hover:text-primary-600 transition-all duration-200 font-medium"
            :class="{ 'bg-primary-50 text-primary-700': $route.path === '/admin' }"
          >
            <IconSettings class="w-4 h-4" />
            <span>Admin</span>
          </router-link>

          <router-link
            to="/cocina"
            class="flex items-center space-x-2 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 hover:text-primary-600 transition-all duration-200 font-medium"
            :class="{ 'bg-primary-50 text-primary-700': $route.path === '/cocina' }"
          >
            <IconChefHat class="w-4 h-4" />
            <span>Cocina</span>
          </router-link>

          <router-link
            to="/comandas"
            class="flex items-center space-x-2 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 hover:text-primary-600 transition-all duration-200 font-medium"
            :class="{ 'bg-primary-50 text-primary-700': $route.path === '/comandas' }"
          >
            <IconUsers class="w-4 h-4" />
            <span>Comandas</span>
          </router-link>
        </div>

        <!-- Carrito (solo visible en menú) -->
        <div v-if="$route.path.includes('/menu')" class="flex items-center">
          <button class="relative p-2 text-neutral-700 hover:text-primary-600 transition-colors">
            <IconShoppingCart class="w-6 h-6" />
            <span v-if="carritoStore.items.length > 0" class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {{ carritoStore.items.length }}
            </span>
          </button>
        </div>

        <!-- Menú móvil -->
        <div class="md:hidden">
          <button @click="toggleMobileMenu" class="p-2 text-neutral-700 hover:text-primary-600 transition-colors">
            <IconMenu class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Menú móvil desplegable -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-neutral-200 bg-neutral-50 animate-slide-up">
        <div class="px-4 py-3 space-y-1">
          <router-link
            to="/"
            @click="closeMobileMenu"
            class="flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-700 hover:bg-white hover:text-primary-600 transition-all duration-200"
            :class="{ 'bg-primary-50 text-primary-700': $route.path === '/' }"
          >
            <IconMenu class="w-5 h-5" />
            <span>Menú</span>
          </router-link>

          <router-link
            to="/admin"
            @click="closeMobileMenu"
            class="flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-700 hover:bg-white hover:text-primary-600 transition-all duration-200"
            :class="{ 'bg-primary-50 text-primary-700': $route.path === '/admin' }"
          >
            <IconSettings class="w-5 h-5" />
            <span>Admin</span>
          </router-link>

          <router-link
            to="/cocina"
            @click="closeMobileMenu"
            class="flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-700 hover:bg-white hover:text-primary-600 transition-all duration-200"
            :class="{ 'bg-primary-50 text-primary-700': $route.path === '/cocina' }"
          >
            <IconChefHat class="w-5 h-5" />
            <span>Cocina</span>
          </router-link>

          <router-link
            to="/comandas"
            @click="closeMobileMenu"
            class="flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-700 hover:bg-white hover:text-primary-600 transition-all duration-200"
            :class="{ 'bg-primary-50 text-primary-700': $route.path === '/comandas' }"
          >
            <IconUsers class="w-5 h-5" />
            <span>Comandas</span>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCarritoStore } from '../store/carrito'

const route = useRoute()
const carritoStore = useCarritoStore()
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>
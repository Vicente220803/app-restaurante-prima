<template>
  <div class="min-h-screen bg-neutral-50">
    <Navbar />

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-accent-600 via-accent-700 to-primary-700 text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative container mx-auto px-4 py-16">
        <div class="flex items-center space-x-4 mb-6">
          <div class="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <IconSettings class="w-8 h-8" />
          </div>
          <div>
            <h1 class="text-4xl md:text-5xl font-display font-bold">Panel de Administración</h1>
            <p class="text-xl text-white/90 font-light">Gestiona tu restaurante de forma eficiente</p>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-neutral-50 to-transparent"></div>
    </section>

    <main class="container mx-auto px-4 py-12">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div class="flex items-center space-x-4">
            <div class="bg-primary-100 p-3 rounded-lg">
              <IconChefHat class="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-600">Productos Activos</p>
              <p class="text-2xl font-bold text-neutral-900">{{ productosCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div class="flex items-center space-x-4">
            <div class="bg-accent-100 p-3 rounded-lg">
              <IconShoppingCart class="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-600">Pedidos Hoy</p>
              <p class="text-2xl font-bold text-neutral-900">{{ pedidosCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div class="flex items-center space-x-4">
            <div class="bg-green-100 p-3 rounded-lg">
              <IconCheck class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-600">Pedidos Completados</p>
              <p class="text-2xl font-bold text-neutral-900">{{ pedidosCompletadosCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Gestión de Productos -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div class="p-6 border-b border-neutral-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <IconChefHat class="w-6 h-6 text-primary-600" />
                  <h2 class="text-xl font-semibold text-neutral-900">Gestión de Productos</h2>
                </div>
                <button class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
                  <IconPlus class="w-4 h-4" />
                  <span>Agregar Producto</span>
                </button>
              </div>
            </div>

            <div class="p-6">
              <!-- Filtros -->
              <div class="flex flex-wrap gap-2 mb-6">
                <button
                  v-for="categoria in categorias"
                  :key="categoria"
                  @click="categoriaFiltro = categoria"
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                    categoriaFiltro === categoria
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  ]"
                >
                  {{ categoria }}
                </button>
              </div>

              <!-- Lista de productos -->
              <div v-if="productosFiltrados.length > 0" class="space-y-4">
                <div
                  v-for="producto in productosFiltrados"
                  :key="producto.id"
                  class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center">
                      <img
                        v-if="producto.imagen_url"
                        :src="producto.imagen_url"
                        :alt="producto.nombre"
                        class="w-full h-full object-cover rounded-lg"
                      />
                      <IconChefHat v-else class="w-6 h-6 text-neutral-400" />
                    </div>
                    <div>
                      <h3 class="font-medium text-neutral-900">{{ producto.nombre }}</h3>
                      <p class="text-sm text-neutral-600">{{ producto.categoria }} • {{ producto.destino }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span class="font-semibold text-primary-600">{{ producto.precio }}€</span>
                    <div class="flex space-x-2">
                      <button class="p-2 text-neutral-600 hover:text-primary-600 transition-colors">
                        <IconSettings class="w-4 h-4" />
                      </button>
                      <button class="p-2 text-neutral-600 hover:text-red-600 transition-colors">
                        <IconX class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8">
                <IconChefHat class="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                <p class="text-neutral-600">No hay productos en esta categoría</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel Lateral -->
        <div class="space-y-6">
          <!-- Acciones Rápidas -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <h3 class="text-lg font-semibold text-neutral-900 mb-4">Acciones Rápidas</h3>
            <div class="space-y-3">
              <button class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                <IconPlus class="w-4 h-4" />
                <span>Nuevo Producto</span>
              </button>
              <button class="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                <IconSettings class="w-4 h-4" />
                <span>Configuración</span>
              </button>
            </div>
          </div>

          <!-- Estado del Sistema -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <h3 class="text-lg font-semibold text-neutral-900 mb-4">Estado del Sistema</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-600">Base de Datos</span>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-green-600">Conectado</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-600">Última Sincronización</span>
                <span class="text-sm text-neutral-900">Hace 5 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'
import { supabase } from '../supabase'

// Datos mockeados para demo
const productosCount = ref(24)
const pedidosCount = ref(12)
const pedidosCompletadosCount = ref(8)
const categoriaFiltro = ref('Todos')

const productos = ref([
  { id: 1, nombre: 'Pizza Margherita', categoria: 'Pizzas', destino: 'COCINA', precio: 12.50, imagen_url: null },
  { id: 2, nombre: 'Cerveza Estrella', categoria: 'Bebidas', destino: 'BARRA', precio: 3.50, imagen_url: null },
  // Más productos...
])

const categorias = computed(() => {
  const cats = ['Todos', ...new Set(productos.value.map(p => p.categoria))]
  return cats
})

const productosFiltrados = computed(() => {
  if (categoriaFiltro.value === 'Todos') {
    return productos.value
  }
  return productos.value.filter(p => p.categoria === categoriaFiltro.value)
})

onMounted(() => {
  // Aquí iría la lógica para cargar datos reales
})
</script>
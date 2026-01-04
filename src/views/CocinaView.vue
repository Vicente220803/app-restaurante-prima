<template>
  <div class="min-h-screen bg-neutral-50">
    <Navbar />

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-orange-600 via-red-600 to-red-700 text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative container mx-auto px-4 py-16">
        <div class="flex items-center space-x-4 mb-6">
          <div class="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <IconChefHat class="w-8 h-8" />
          </div>
          <div>
            <h1 class="text-4xl md:text-5xl font-display font-bold">Cocina</h1>
            <p class="text-xl text-white/90 font-light">Gestión de pedidos en tiempo real</p>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-neutral-50 to-transparent"></div>
    </section>

    <main class="container mx-auto px-4 py-12">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div class="flex items-center space-x-4">
            <div class="bg-red-100 p-3 rounded-lg">
              <IconClock class="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-600">Pendientes</p>
              <p class="text-2xl font-bold text-neutral-900">{{ pedidosPendientes.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div class="flex items-center space-x-4">
            <div class="bg-yellow-100 p-3 rounded-lg">
              <IconChefHat class="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-600">En Preparación</p>
              <p class="text-2xl font-bold text-neutral-900">{{ pedidosPreparando.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div class="flex items-center space-x-4">
            <div class="bg-blue-100 p-3 rounded-lg">
              <IconCheck class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-600">Listos</p>
              <p class="text-2xl font-bold text-neutral-900">{{ pedidosListos.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div class="flex items-center space-x-4">
            <div class="bg-green-100 p-3 rounded-lg">
              <IconCheck class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-600">Entregados</p>
              <p class="text-2xl font-bold text-neutral-900">{{ pedidosEntregados.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros de Estado -->
      <div class="mb-8">
        <div class="flex flex-wrap justify-center gap-2">
          <button
            v-for="estado in estados"
            :key="estado.value"
            @click="estadoFiltro = estado.value"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center space-x-2',
              estadoFiltro === estado.value
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            ]"
          >
            <component :is="estado.icon" class="w-4 h-4" />
            <span>{{ estado.label }}</span>
          </button>
        </div>
      </div>

      <!-- Pedidos Grid -->
      <div v-if="pedidosFiltrados.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="pedido in pedidosFiltrados"
          :key="pedido.id"
          :class="[
            'bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-200 hover:shadow-lg',
            getEstadoColor(pedido.estado)
          ]"
        >
          <!-- Header del pedido -->
          <div class="p-6 border-b border-neutral-200">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold text-neutral-900">Pedido #{{ pedido.id }}</h3>
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', getEstadoBadge(pedido.estado)]">
                {{ getEstadoLabel(pedido.estado) }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm text-neutral-600">
              <span>Mesa {{ pedido.mesa_id || 'Sin asignar' }}</span>
              <span>{{ formatTime(pedido.created_at) }}</span>
            </div>
          </div>

          <!-- Items del pedido -->
          <div class="p-6">
            <div class="space-y-3 mb-4">
              <div
                v-for="item in pedido.items"
                :key="item.id"
                class="flex justify-between items-center"
              >
                <div class="flex-1">
                  <span class="font-medium text-neutral-900">{{ item.nombre }}</span>
                  <span class="text-sm text-neutral-600 ml-2">x{{ item.cantidad }}</span>
                </div>
                <span class="text-sm text-neutral-600">{{ item.destino }}</span>
              </div>
            </div>

            <!-- Notas -->
            <div v-if="pedido.notas" class="mb-4 p-3 bg-yellow-50 rounded-lg">
              <p class="text-sm text-yellow-800">
                <strong>Nota:</strong> {{ pedido.notas }}
              </p>
            </div>

            <!-- Total y acciones -->
            <div class="border-t border-neutral-200 pt-4">
              <div class="flex items-center justify-between mb-4">
                <span class="text-lg font-semibold text-neutral-900">Total: {{ pedido.total }}€</span>
              </div>

              <div class="flex space-x-2">
                <button
                  v-if="pedido.estado === 'pendiente'"
                  @click="cambiarEstado(pedido, 'preparando')"
                  class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Iniciar Preparación
                </button>
                <button
                  v-if="pedido.estado === 'preparando'"
                  @click="cambiarEstado(pedido, 'listo')"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Marcar como Listo
                </button>
                <button
                  v-if="pedido.estado === 'listo'"
                  @click="cambiarEstado(pedido, 'entregado')"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Entregar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-16">
        <IconChefHat class="w-16 h-16 mx-auto text-neutral-300 mb-4" />
        <h3 class="text-xl font-semibold text-neutral-900 mb-2">No hay pedidos {{ getEstadoLabel(estadoFiltro).toLowerCase() }}s</h3>
        <p class="text-neutral-600">Los pedidos aparecerán aquí automáticamente</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'

// Datos mockeados para demo
const estadoFiltro = ref('pendiente')

const pedidos = ref([
  {
    id: 1,
    mesa_id: 5,
    estado: 'pendiente',
    total: 28.50,
    created_at: new Date().toISOString(),
    items: [
      { id: 1, nombre: 'Pizza Margherita', cantidad: 2, destino: 'COCINA' },
      { id: 2, nombre: 'Cerveza Estrella', cantidad: 1, destino: 'BARRA' }
    ]
  },
  {
    id: 2,
    mesa_id: 3,
    estado: 'preparando',
    total: 15.00,
    created_at: new Date(Date.now() - 300000).toISOString(),
    items: [
      { id: 3, nombre: 'Pasta Carbonara', cantidad: 1, destino: 'COCINA' }
    ]
  }
])

const estados = [
  { value: 'pendiente', label: 'Pendientes', icon: 'IconClock' },
  { value: 'preparando', label: 'Preparando', icon: 'IconChefHat' },
  { value: 'listo', label: 'Listos', icon: 'IconCheck' },
  { value: 'entregado', label: 'Entregados', icon: 'IconCheck' }
]

const pedidosPendientes = computed(() => pedidos.value.filter(p => p.estado === 'pendiente'))
const pedidosPreparando = computed(() => pedidos.value.filter(p => p.estado === 'preparando'))
const pedidosListos = computed(() => pedidos.value.filter(p => p.estado === 'listo'))
const pedidosEntregados = computed(() => pedidos.value.filter(p => p.estado === 'entregado'))

const pedidosFiltrados = computed(() => {
  return pedidos.value.filter(p => p.estado === estadoFiltro.value)
})

const getEstadoColor = (estado) => {
  const colors = {
    pendiente: 'border-red-200',
    preparando: 'border-yellow-200',
    listo: 'border-blue-200',
    entregado: 'border-green-200'
  }
  return colors[estado] || 'border-neutral-200'
}

const getEstadoBadge = (estado) => {
  const badges = {
    pendiente: 'bg-red-100 text-red-800',
    preparando: 'bg-yellow-100 text-yellow-800',
    listo: 'bg-blue-100 text-blue-800',
    entregado: 'bg-green-100 text-green-800'
  }
  return badges[estado] || 'bg-neutral-100 text-neutral-800'
}

const getEstadoLabel = (estado) => {
  const labels = {
    pendiente: 'Pendiente',
    preparando: 'Preparando',
    listo: 'Listo',
    entregado: 'Entregado'
  }
  return labels[estado] || estado
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const cambiarEstado = (pedido, nuevoEstado) => {
  pedido.estado = nuevoEstado
  // Aquí iría la lógica para actualizar en la base de datos
}

onMounted(() => {
  // Aquí iría la lógica para cargar pedidos desde Supabase
})
</script>
<template>
  <div class="min-h-screen bg-neutral-50">
    <Navbar />

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative container mx-auto px-4 py-16">
        <div class="flex items-center space-x-4 mb-6">
          <div class="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <IconUsers class="w-8 h-8" />
          </div>
          <div>
            <h1 class="text-4xl md:text-5xl font-display font-bold">Comandas</h1>
            <p class="text-xl text-white/90 font-light">Gestión de mesas y atención al cliente</p>
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
            <div class="bg-green-100 p-3 rounded-lg">
              <IconCheck class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-600">Mesas Libres</p>
              <p class="text-2xl font-bold text-neutral-900">{{ mesasLibres }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div class="flex items-center space-x-4">
            <div class="bg-yellow-100 p-3 rounded-lg">
              <IconClock class="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-600">Mesas Ocupadas</p>
              <p class="text-2xl font-bold text-neutral-900">{{ mesasOcupadas }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div class="flex items-center space-x-4">
            <div class="bg-blue-100 p-3 rounded-lg">
              <IconUsers class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-600">Clientes Atendidos</p>
              <p class="text-2xl font-bold text-neutral-900">{{ clientesAtendidos }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div class="flex items-center space-x-4">
            <div class="bg-purple-100 p-3 rounded-lg">
              <IconShoppingCart class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-neutral-600">Pedidos Activos</p>
              <p class="text-2xl font-bold text-neutral-900">{{ pedidosActivos }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Layout Principal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Mapa de Mesas -->
        <div class="lg:col-span-2">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-neutral-900">Mapa del Restaurante</h2>
              <div class="flex space-x-4 text-sm">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span class="text-neutral-600">Libre</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span class="text-neutral-600">Ocupada</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span class="text-neutral-600">Pidiendo</span>
                </div>
              </div>
            </div>

            <!-- Grid de mesas -->
            <div class="grid grid-cols-4 md:grid-cols-6 gap-4">
              <button
                v-for="mesa in mesas"
                :key="mesa.id"
                @click="seleccionarMesa(mesa)"
                :class="[
                  'aspect-square rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center font-medium',
                  getMesaClass(mesa)
                ]"
              >
                <IconUsers class="w-6 h-6 mb-1" />
                <span class="text-sm">{{ mesa.numero }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Panel Lateral -->
        <div class="space-y-6">
          <!-- Mesa Seleccionada -->
          <div v-if="mesaSeleccionada" class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-neutral-900">Mesa {{ mesaSeleccionada.numero }}</h3>
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', getEstadoBadge(mesaSeleccionada.estado)]">
                {{ getEstadoLabel(mesaSeleccionada.estado) }}
              </span>
            </div>

            <!-- Pedidos de la mesa -->
            <div v-if="mesaSeleccionada.pedidos && mesaSeleccionada.pedidos.length > 0" class="space-y-3 mb-4">
              <div
                v-for="pedido in mesaSeleccionada.pedidos"
                :key="pedido.id"
                class="p-3 bg-neutral-50 rounded-lg"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="font-medium text-neutral-900">Pedido #{{ pedido.id }}</span>
                  <span :class="['px-2 py-1 rounded-full text-xs', getPedidoBadge(pedido.estado)]">
                    {{ pedido.estado }}
                  </span>
                </div>
                <div class="text-sm text-neutral-600 space-y-1">
                  <div v-for="item in pedido.items" :key="item.id" class="flex justify-between">
                    <span>{{ item.nombre }} x{{ item.cantidad }}</span>
                    <span>{{ (item.precio * item.cantidad).toFixed(2) }}€</span>
                  </div>
                </div>
                <div class="border-t border-neutral-200 mt-2 pt-2 flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{{ pedido.total }}€</span>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="space-y-2">
              <button
                v-if="mesaSeleccionada.estado === 'libre'"
                @click="ocuparMesa(mesaSeleccionada)"
                class="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Ocupar Mesa
              </button>
              <button
                v-if="mesaSeleccionada.estado === 'ocupada'"
                @click="pedirCuenta(mesaSeleccionada)"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Pedir Cuenta
              </button>
              <button
                v-if="mesaSeleccionada.estado === 'pidiendo'"
                @click="liberarMesa(mesaSeleccionada)"
                class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Liberar Mesa
              </button>
            </div>
          </div>

          <!-- Acciones Rápidas -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <h3 class="text-lg font-semibold text-neutral-900 mb-4">Acciones Rápidas</h3>
            <div class="space-y-3">
              <button class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                <IconPlus class="w-4 h-4" />
                <span>Nueva Comanda</span>
              </button>
              <button class="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                <IconUsers class="w-4 h-4" />
                <span>Ver Todas las Mesas</span>
              </button>
            </div>
          </div>

          <!-- Notificaciones -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <h3 class="text-lg font-semibold text-neutral-900 mb-4">Notificaciones</h3>
            <div class="space-y-3">
              <div class="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <IconClock class="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p class="text-sm font-medium text-yellow-800">Pedido listo en cocina</p>
                  <p class="text-xs text-yellow-700">Mesa 5 - Pizza Margherita</p>
                </div>
              </div>
              <div class="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <IconUsers class="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p class="text-sm font-medium text-blue-800">Nueva reserva</p>
                  <p class="text-xs text-blue-700">Mesa 12 - 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Navbar from '../components/Navbar.vue'

// Datos mockeados para demo
const mesaSeleccionada = ref(null)
const mesasLibres = ref(8)
const mesasOcupadas = ref(6)
const clientesAtendidos = ref(24)
const pedidosActivos = ref(12)

const mesas = ref([
  { id: 1, numero: 1, estado: 'libre', pedidos: [] },
  { id: 2, numero: 2, estado: 'ocupada', pedidos: [{ id: 1, estado: 'preparando', total: 25.50, items: [{ nombre: 'Pizza', precio: 12.50, cantidad: 2 }] }] },
  { id: 3, numero: 3, estado: 'pidiendo', pedidos: [{ id: 2, estado: 'listo', total: 15.00, items: [{ nombre: 'Pasta', precio: 15.00, cantidad: 1 }] }] },
  // Más mesas...
])

const seleccionarMesa = (mesa) => {
  mesaSeleccionada.value = mesa
}

const getMesaClass = (mesa) => {
  const baseClass = 'hover:scale-105'
  const states = {
    libre: 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100',
    ocupada: 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100',
    pidiendo: 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
  }
  return `${baseClass} ${states[mesa.estado] || 'bg-neutral-50 border-neutral-300 text-neutral-700'}`
}

const getEstadoBadge = (estado) => {
  const badges = {
    libre: 'bg-green-100 text-green-800',
    ocupada: 'bg-yellow-100 text-yellow-800',
    pidiendo: 'bg-red-100 text-red-800'
  }
  return badges[estado] || 'bg-neutral-100 text-neutral-800'
}

const getEstadoLabel = (estado) => {
  const labels = {
    libre: 'Libre',
    ocupada: 'Ocupada',
    pidiendo: 'Pidiendo'
  }
  return labels[estado] || estado
}

const getPedidoBadge = (estado) => {
  const badges = {
    pendiente: 'bg-red-100 text-red-800',
    preparando: 'bg-yellow-100 text-yellow-800',
    listo: 'bg-blue-100 text-blue-800',
    entregado: 'bg-green-100 text-green-800'
  }
  return badges[estado] || 'bg-neutral-100 text-neutral-800'
}

const ocuparMesa = (mesa) => {
  mesa.estado = 'ocupada'
  mesasLibres.value--
  mesasOcupadas.value++
}

const pedirCuenta = (mesa) => {
  mesa.estado = 'pidiendo'
}

const liberarMesa = (mesa) => {
  mesa.estado = 'libre'
  mesa.pedidos = []
  mesasOcupadas.value--
  mesasLibres.value++
  mesaSeleccionada.value = null
}
</script>
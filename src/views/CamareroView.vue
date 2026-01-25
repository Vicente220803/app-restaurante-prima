<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-orange-500 p-2 rounded-lg">
            <span class="material-symbols-outlined text-white">room_service</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800">Panel Camarero</h1>
            <p class="text-xs text-gray-500">Gestiona mesas y pedidos</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <!-- PIN del día -->
          <div class="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
            <p class="text-xs text-orange-600 font-medium">PIN del día</p>
            <p class="text-2xl font-bold text-orange-500 tracking-widest">{{ pinDia }}</p>
          </div>
          <!-- Cerrar sesión -->
          <button
            @click="cerrarSesion"
            class="text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"
          >
            <span class="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          @click="tabActiva = 'pedidos'"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition',
            tabActiva === 'pedidos' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          ]"
        >
          <span class="material-symbols-outlined text-sm align-middle mr-1">receipt_long</span>
          Pedidos Activos
        </button>
        <button
          @click="tabActiva = 'mesas'"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition',
            tabActiva === 'mesas' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          ]"
        >
          <span class="material-symbols-outlined text-sm align-middle mr-1">table_restaurant</span>
          Mesas
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando...</p>
      </div>

      <!-- Tab: Pedidos -->
      <div v-else-if="tabActiva === 'pedidos'" class="space-y-4">
        <div v-if="pedidos.length === 0" class="bg-white rounded-xl p-8 text-center">
          <span class="material-symbols-outlined text-6xl text-gray-300">receipt_long</span>
          <p class="mt-4 text-gray-500">No hay pedidos activos</p>
        </div>

        <div
          v-for="pedido in pedidos"
          :key="pedido.id"
          class="bg-white rounded-xl shadow p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="bg-gray-100 px-3 py-1 rounded-lg">
                <span class="font-bold text-gray-700">Mesa {{ pedido.mesa_id || '?' }}</span>
              </div>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                  pedido.estado === 'preparando' ? 'bg-blue-100 text-blue-700' :
                  pedido.estado === 'listo' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                ]"
              >
                {{ pedido.estado?.toUpperCase() }}
              </span>
            </div>
            <span class="text-sm text-gray-500">
              {{ formatTime(pedido.created_at) }}
            </span>
          </div>

          <!-- Items del pedido -->
          <div class="border-t pt-3 space-y-2">
            <div v-for="(item, idx) in pedido.items" :key="idx" class="flex justify-between text-sm">
              <span>{{ item.cantidad || 1 }}x {{ item.nombre }}</span>
              <span class="text-gray-600">{{ item.precio_total?.toFixed(2) }}€</span>
            </div>
          </div>

          <!-- Total y acciones -->
          <div class="border-t mt-3 pt-3 flex items-center justify-between">
            <span class="font-bold text-lg">Total: {{ pedido.total?.toFixed(2) }}€</span>
            <div class="flex gap-2">
              <button
                v-if="pedido.estado === 'listo'"
                @click="cambiarEstado(pedido.id, 'entregado')"
                class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
              >
                Marcar Entregado
              </button>
              <button
                v-if="pedido.estado === 'pendiente'"
                @click="cambiarEstado(pedido.id, 'preparando')"
                class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
              >
                En Preparación
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Mesas -->
      <div v-else-if="tabActiva === 'mesas'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div
          v-for="mesa in mesas"
          :key="mesa.numero"
          :class="[
            'bg-white rounded-xl p-4 text-center cursor-pointer transition hover:shadow-lg',
            mesa.ocupada ? 'ring-2 ring-orange-500' : ''
          ]"
        >
          <span class="material-symbols-outlined text-4xl" :class="mesa.ocupada ? 'text-orange-500' : 'text-gray-300'">
            table_restaurant
          </span>
          <p class="font-bold text-lg mt-2">Mesa {{ mesa.numero }}</p>
          <p :class="['text-xs', mesa.ocupada ? 'text-orange-500' : 'text-gray-400']">
            {{ mesa.ocupada ? 'Ocupada' : 'Libre' }}
          </p>
          <p v-if="mesa.pedidos > 0" class="text-xs text-blue-500 mt-1">
            {{ mesa.pedidos }} pedido(s)
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

const loading = ref(true)
const tabActiva = ref('pedidos')
const pedidos = ref([])
const mesas = ref([])
const pinDia = ref('1111')

let subscription = null

onMounted(async () => {
  await cargarDatos()
  suscribirPedidos()
})

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe()
  }
})

async function cargarDatos() {
  loading.value = true
  try {
    // Cargar PIN del día
    const { data: resData } = await supabase
      .from('restaurantes')
      .select('pin_dia')
      .limit(1)
      .single()

    if (resData?.pin_dia) {
      pinDia.value = resData.pin_dia
    }

    // Cargar pedidos activos
    const { data: pedidosData } = await supabase
      .from('pedidos')
      .select('*')
      .in('estado', ['pendiente', 'preparando', 'listo'])
      .order('created_at', { ascending: false })

    pedidos.value = pedidosData || []

    // Generar mesas (por ahora estáticas, luego desde BD)
    const mesasArray = []
    for (let i = 1; i <= 12; i++) {
      const pedidosMesa = pedidos.value.filter(p => p.mesa_id === i)
      mesasArray.push({
        numero: i,
        ocupada: pedidosMesa.length > 0,
        pedidos: pedidosMesa.length
      })
    }
    mesas.value = mesasArray

  } catch (e) {
    console.error('Error cargando datos:', e)
  } finally {
    loading.value = false
  }
}

function suscribirPedidos() {
  subscription = supabase
    .channel('pedidos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
      cargarDatos()
    })
    .subscribe()
}

async function cambiarEstado(pedidoId, nuevoEstado) {
  try {
    await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', pedidoId)

    await cargarDatos()
  } catch (e) {
    console.error('Error cambiando estado:', e)
  }
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function cerrarSesion() {
  sessionStorage.removeItem('userRole')
  sessionStorage.removeItem('adminAuth')
  router.push('/la-toscana/table/1')
}
</script>

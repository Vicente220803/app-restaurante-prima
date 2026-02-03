<template>
  <div class="bg-[#0f1115] font-display text-white min-h-screen flex">
    <!-- Sidebar de Navegación -->
    <aside class="w-64 border-r border-gray-800/50 bg-[#0a0b0d] flex flex-col shrink-0">
      <!-- Logo -->
      <div class="p-5 border-b border-gray-800/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e27246] to-[#c25f38] flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-xl">restaurant</span>
          </div>
          <div>
            <h1 class="font-black text-lg tracking-tight">La Toscana</h1>
            <p class="text-[10px] text-gray-500 uppercase tracking-widest">Sistema TPV</p>
          </div>
        </div>
      </div>

      <!-- Navegación -->
      <nav class="flex-1 p-4 space-y-2">
        <router-link
          to="/camarero"
          class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-xl transition-all"
        >
          <span class="material-symbols-outlined">table_restaurant</span>
          <span>SALÓN</span>
        </router-link>

        <router-link
          to="/admin/productos"
          class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-xl transition-all"
        >
          <span class="material-symbols-outlined">restaurant_menu</span>
          <span>PRODUCTOS</span>
        </router-link>

        <router-link
          to="/cocina"
          class="flex items-center gap-3 px-4 py-3 bg-[#e27246]/10 text-[#e27246] rounded-xl font-semibold"
        >
          <span class="material-symbols-outlined">soup_kitchen</span>
          <span>Cocina</span>
        </router-link>

        <router-link
          to="/gestion"
          class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-xl transition-all"
        >
          <span class="material-symbols-outlined">admin_panel_settings</span>
          <span>GESTIÓN</span>
        </router-link>
      </nav>

      <!-- Footer del sidebar -->
      <div class="p-4 border-t border-gray-800/50">
        <button
          @click="cerrarSesion"
          class="w-full py-3 border border-gray-700 text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-800 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-sm">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Contenido Principal -->
    <div class="flex-1 flex flex-col">
      <!-- Header Section -->
      <header class="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0f1115]/90 px-6 py-4 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-500">
            <span class="material-symbols-outlined text-3xl">skillet</span>
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-white">Cocina</h1>
            <p class="text-xs font-medium tracking-widest text-orange-500 uppercase">Pedidos en tiempo real</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-sm">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span class="text-gray-400">En vivo</span>
          </div>
          <div class="text-2xl font-bold tabular-nums text-white">{{ horaActual }}</div>
        </div>
      </header>

      <main class="p-6 flex-1 overflow-auto">
      <!-- Tabs de estado -->
      <div class="flex gap-4 mb-6">
        <button
          @click="tabActiva = 'pendiente'"
          :class="[
            'flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all',
            tabActiva === 'pendiente'
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          ]"
        >
          <span class="material-symbols-outlined">schedule</span>
          Nuevos
          <span v-if="pedidosPendientes.length > 0" class="bg-black/20 px-2 py-0.5 rounded-full text-sm">
            {{ pedidosPendientes.length }}
          </span>
        </button>
        <button
          @click="tabActiva = 'preparando'"
          :class="[
            'flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all',
            tabActiva === 'preparando'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          ]"
        >
          <span class="material-symbols-outlined">local_fire_department</span>
          Preparando
          <span v-if="pedidosPreparando.length > 0" class="bg-black/20 px-2 py-0.5 rounded-full text-sm">
            {{ pedidosPreparando.length }}
          </span>
        </button>
        <button
          @click="tabActiva = 'listo'"
          :class="[
            'flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all',
            tabActiva === 'listo'
              ? 'bg-green-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          ]"
        >
          <span class="material-symbols-outlined">check_circle</span>
          Listos
          <span v-if="pedidosListos.length > 0" class="bg-black/20 px-2 py-0.5 rounded-full text-sm">
            {{ pedidosListos.length }}
          </span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-4 text-gray-400">Cargando pedidos...</p>
      </div>

      <!-- Lista de pedidos -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Sin pedidos -->
        <div v-if="pedidosFiltrados.length === 0" class="col-span-full text-center py-20">
          <span class="material-symbols-outlined text-6xl text-gray-700">
            {{ tabActiva === 'pendiente' ? 'inbox' : tabActiva === 'preparando' ? 'skillet' : 'check_circle' }}
          </span>
          <p class="mt-4 text-xl text-gray-500">
            {{ tabActiva === 'pendiente' ? 'No hay pedidos nuevos' : tabActiva === 'preparando' ? 'No hay pedidos en preparación' : 'No hay pedidos listos' }}
          </p>
        </div>

        <!-- Cards de pedidos -->
        <div
          v-for="pedido in pedidosFiltrados"
          :key="pedido.id"
          :class="[
            'rounded-2xl overflow-hidden border-2 transition-all',
            pedido.estado === 'pendiente' ? 'bg-yellow-500/10 border-yellow-500/30' : '',
            pedido.estado === 'preparando' ? 'bg-orange-500/10 border-orange-500/30' : '',
            pedido.estado === 'listo' ? 'bg-green-500/10 border-green-500/30' : ''
          ]"
        >
          <!-- Alerta de pedido actualizado -->
          <div v-if="tieneItemsRecientes(pedido)" class="bg-purple-500 text-white px-4 py-2 flex items-center gap-2 animate-pulse-bg">
            <span class="material-symbols-outlined text-lg">notification_important</span>
            <span class="font-bold text-sm uppercase tracking-wide">¡Pedido Actualizado!</span>
            <span class="text-xs opacity-80">- Nuevos items añadidos</span>
          </div>

          <!-- Header del pedido -->
          <div :class="[
            'px-5 py-4 flex items-center justify-between',
            pedido.estado === 'pendiente' ? 'bg-yellow-500/20' : '',
            pedido.estado === 'preparando' ? 'bg-orange-500/20' : '',
            pedido.estado === 'listo' ? 'bg-green-500/20' : ''
          ]">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-gray-400">Mesa</span>
              <h3 class="text-3xl font-black">{{ pedido.mesa }}</h3>
            </div>
            <div class="text-right">
              <span :class="[
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase',
                pedido.estado === 'pendiente' ? 'bg-yellow-500 text-black' : '',
                pedido.estado === 'preparando' ? 'bg-orange-500 text-white' : '',
                pedido.estado === 'listo' ? 'bg-green-500 text-white' : ''
              ]">
                <span class="material-symbols-outlined text-sm">
                  {{ pedido.estado === 'pendiente' ? 'schedule' : pedido.estado === 'preparando' ? 'local_fire_department' : 'check_circle' }}
                </span>
                {{ pedido.estado === 'pendiente' ? 'Nuevo' : pedido.estado === 'preparando' ? 'Preparando' : 'Listo' }}
              </span>
              <p class="text-xs text-gray-500 mt-1">{{ tiempoDesde(pedido.created_at) }}</p>
            </div>
          </div>

          <!-- Items del pedido (solo cocina, sin bebidas) -->
          <div class="p-5 space-y-3">
            <div
              v-for="(item, idx) in filtrarItemsCocina(pedido.items)"
              :key="idx"
              :class="[
                'flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0 last:pb-0 rounded-lg transition-all',
                esItemReciente(pedido, item) ? 'bg-purple-500/20 p-2 -mx-2 border-purple-500/30' : ''
              ]"
            >
              <span :class="[
                'font-bold text-sm w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                esItemReciente(pedido, item) ? 'bg-purple-500 text-white' : 'bg-gray-800 text-white'
              ]">
                {{ item.cantidad }}
              </span>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-white">{{ item.nombre }}</h4>
                  <span v-if="esItemReciente(pedido, item)" class="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Nuevo
                  </span>
                </div>
                <p v-if="item.opciones" class="text-sm text-orange-400 mt-0.5">{{ item.opciones }}</p>
                <p v-if="item.instrucciones" class="text-sm text-yellow-400 mt-1 flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded">
                  <span class="material-symbols-outlined text-xs">priority_high</span>
                  {{ item.instrucciones }}
                </p>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="p-4 bg-black/20 border-t border-gray-800">
            <!-- Pedido Pendiente -> Marcar como Preparando -->
            <button
              v-if="pedido.estado === 'pendiente'"
              @click="cambiarEstado(pedido.id, 'preparando')"
              class="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all"
            >
              <span class="material-symbols-outlined">local_fire_department</span>
              Empezar a Preparar
            </button>

            <!-- Pedido Preparando -> Marcar como Listo -->
            <button
              v-if="pedido.estado === 'preparando'"
              @click="cambiarEstado(pedido.id, 'listo')"
              class="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all"
            >
              <span class="material-symbols-outlined">check_circle</span>
              Marcar como Listo
            </button>

            <!-- Pedido Listo -> Info -->
            <div v-if="pedido.estado === 'listo'" class="text-center text-green-400 font-bold py-2">
              <span class="material-symbols-outlined align-middle mr-1">notifications_active</span>
              Esperando recogida
            </div>
          </div>
        </div>
      </div>

      <!-- Sonido de notificación para nuevos pedidos -->
      <audio ref="audioNotificacion" preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQwWVK7c5bKFLhZAptTpwY05G0Sa0NnNilIuTp3M07+JTi1SoszTvIhOLlKgytG6h0suUqDK0bmGSi1Sn8nRuIZKLVKeyNG3hkotUp7I0LeGSi1SnsjQt4ZKLVKA" type="audio/wav"/>
      </audio>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

const loading = ref(true)
const pedidos = ref([])
const horaActual = ref('')
const tabActiva = ref('pendiente')
const audioNotificacion = ref(null)

let subscription = null
let clockInterval = null
let ultimosPedidosPendientes = 0

// Filtrar items de cocina (solo excluir si el grupo es "Bebida")
const filtrarItemsCocina = (items) => {
  if (!items || !Array.isArray(items)) return []
  return items.filter(item => {
    const grupo = (item.grupo || '').toLowerCase()
    // Solo excluir si el grupo es exactamente "bebida"
    return grupo !== 'bebida'
  })
}

// Detectar si un pedido tiene items añadidos recientemente (después de 3 minutos desde la creación)
const tieneItemsRecientes = (pedido) => {
  if (!pedido || !pedido.items || !Array.isArray(pedido.items)) return false

  const createdAt = new Date(pedido.created_at).getTime()
  const margenMinutos = 3 * 60 * 1000 // 3 minutos en milisegundos
  const ahora = Date.now()
  const recienteMs = 10 * 60 * 1000 // Items añadidos en los últimos 10 minutos

  // Buscar items que fueron añadidos después de created_at + margen
  return pedido.items.some(item => {
    if (!item.added_at) return false
    const itemAddedAt = new Date(item.added_at).getTime()
    // El item fue añadido al menos 3 min después de crear el pedido Y hace menos de 10 min
    return itemAddedAt > (createdAt + margenMinutos) && (ahora - itemAddedAt) < recienteMs
  })
}

// Verificar si un item específico es reciente
const esItemReciente = (pedido, item) => {
  if (!pedido || !item || !item.added_at) return false

  const createdAt = new Date(pedido.created_at).getTime()
  const margenMinutos = 3 * 60 * 1000 // 3 minutos
  const ahora = Date.now()
  const recienteMs = 10 * 60 * 1000 // 10 minutos
  const itemAddedAt = new Date(item.added_at).getTime()

  return itemAddedAt > (createdAt + margenMinutos) && (ahora - itemAddedAt) < recienteMs
}

// Filtrar pedidos por estado (solo mostrar si tienen items de cocina)
const pedidosPendientes = computed(() => {
  return pedidos.value
    .filter(p => p.estado === 'pendiente')
    .filter(p => filtrarItemsCocina(p.items).length > 0)
})
const pedidosPreparando = computed(() => {
  return pedidos.value
    .filter(p => p.estado === 'preparando')
    .filter(p => filtrarItemsCocina(p.items).length > 0)
})
const pedidosListos = computed(() => {
  return pedidos.value
    .filter(p => p.estado === 'listo')
    .filter(p => filtrarItemsCocina(p.items).length > 0)
})

// Pedidos según tab activa
const pedidosFiltrados = computed(() => {
  if (tabActiva.value === 'pendiente') return pedidosPendientes.value
  if (tabActiva.value === 'preparando') return pedidosPreparando.value
  return pedidosListos.value
})

// Reproducir sonido cuando llega un nuevo pedido
watch(pedidosPendientes, (nuevos) => {
  if (nuevos.length > ultimosPedidosPendientes && ultimosPedidosPendientes > 0) {
    // Hay un nuevo pedido
    if (audioNotificacion.value) {
      audioNotificacion.value.play().catch(() => {})
    }
    // Cambiar a la pestaña de pendientes automáticamente
    tabActiva.value = 'pendiente'
  }
  ultimosPedidosPendientes = nuevos.length
})

onMounted(async () => {
  await cargarPedidos()
  suscribirPedidos()
  actualizarReloj()
  clockInterval = setInterval(actualizarReloj, 1000)
  ultimosPedidosPendientes = pedidosPendientes.value.length
})

onUnmounted(() => {
  if (subscription) supabase.removeChannel(subscription)
  if (clockInterval) clearInterval(clockInterval)
})

function actualizarReloj() {
  horaActual.value = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

async function cargarPedidos() {
  loading.value = true
  try {
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .in('estado', ['pendiente', 'preparando', 'listo'])
      .order('created_at', { ascending: true })

    pedidos.value = data || []
  } catch (e) {
    console.error('Error cargando pedidos:', e)
  } finally {
    loading.value = false
  }
}

function suscribirPedidos() {
  subscription = supabase
    .channel('cocina-pedidos-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
      cargarPedidos()
    })
    .subscribe()
}

async function cambiarEstado(pedidoId, nuevoEstado) {
  try {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', pedidoId)

    if (error) {
      console.error('Error actualizando pedido:', error)
      return
    }

    await cargarPedidos()

    // Cambiar automáticamente a la pestaña correspondiente
    if (nuevoEstado === 'preparando') {
      tabActiva.value = 'preparando'
    } else if (nuevoEstado === 'listo') {
      tabActiva.value = 'listo'
    }
  } catch (e) {
    console.error('Error cambiando estado:', e)
  }
}

function tiempoDesde(fecha) {
  if (!fecha) return ''
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000 / 60)
  if (diff < 1) return 'Ahora mismo'
  if (diff === 1) return 'Hace 1 min'
  if (diff < 60) return `Hace ${diff} min`
  const horas = Math.floor(diff / 60)
  return `Hace ${horas}h ${diff % 60}m`
}

function cerrarSesion() {
  sessionStorage.removeItem('userRole')
  sessionStorage.removeItem('adminAuth')
  router.push('/la-toscana/table/1')
}
</script>

<style scoped>
.font-display {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes pulse-bg {
  0%, 100% {
    background-color: rgb(168 85 247);
  }
  50% {
    background-color: rgb(126 34 206);
  }
}

.animate-pulse-bg {
  animation: pulse-bg 2s ease-in-out infinite;
}
</style>

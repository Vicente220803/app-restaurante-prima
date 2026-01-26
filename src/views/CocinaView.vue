<template>
  <div class="bg-[#0f2316] font-display text-white min-h-screen">
    <!-- Header Section -->
    <header class="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0f2316]/80 px-6 py-4 backdrop-blur-md lg:px-20">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#33ff77]/20 text-[#33ff77]">
          <span class="material-symbols-outlined text-[28px]">restaurant</span>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-white uppercase">Kitchen Pass</h1>
          <p class="text-[10px] font-medium tracking-widest text-[#33ff77] uppercase opacity-80">Real-time Delivery Alerts</p>
        </div>
      </div>
      <div class="flex items-center gap-6">
        <div class="hidden flex-col items-end md:flex">
          <span class="text-lg font-bold tabular-nums">{{ horaActual }}</span>
          <span class="text-[10px] uppercase tracking-wider text-slate-500">System Live</span>
        </div>
        <button
          @click="cerrarSesion"
          class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white hover:bg-red-500/20 hover:text-red-400 transition-all"
        >
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>

    <main class="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 py-8 lg:px-10">
      <!-- Headline Status -->
      <div class="flex flex-col items-center justify-between gap-4 md:flex-row md:px-4">
        <h2 class="text-3xl font-bold tracking-tight">
          Orders <span class="text-[#33ff77] underline decoration-[#33ff77]/30 underline-offset-8">Ready to Serve</span>
        </h2>
        <div class="flex items-center gap-2 rounded-full bg-[#33ff77]/10 px-4 py-2 text-[#33ff77] border border-[#33ff77]/20">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#33ff77] opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-[#33ff77]"></span>
          </span>
          <span class="text-sm font-bold uppercase tracking-widest">{{ pedidosListos.length }} Active Alerts</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin w-12 h-12 border-4 border-[#33ff77] border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-4 text-slate-400">Cargando pedidos...</p>
      </div>

      <!-- No hay pedidos -->
      <div v-else-if="pedidosListos.length === 0" class="text-center py-20">
        <span class="material-symbols-outlined text-8xl text-slate-700">check_circle</span>
        <p class="mt-4 text-2xl text-slate-500">No hay pedidos listos</p>
        <p class="text-slate-600">Los pedidos apareceran aqui cuando esten listos</p>
      </div>

      <!-- Active Alerts Grid -->
      <div v-else class="grid grid-cols-1 gap-6">
        <!-- Card para cada pedido -->
        <div
          v-for="(pedido, index) in pedidosListos"
          :key="pedido.id"
          :class="[
            'group relative overflow-hidden rounded-xl bg-[#152a1c] p-1',
            index === 0 ? 'glow-card urgent-pulse' : 'glow-card'
          ]"
        >
          <div class="flex flex-col lg:flex-row">
            <!-- Visual/Dish Thumbnail -->
            <div class="h-48 w-full lg:h-auto lg:w-72 shrink-0">
              <div
                class="h-full w-full bg-cover bg-center bg-slate-800 flex items-center justify-center"
                :style="pedido.items?.[0]?.imagen_url ? `background-image: url('${pedido.items[0].imagen_url}')` : ''"
              >
                <span v-if="!pedido.items?.[0]?.imagen_url" class="material-symbols-outlined text-6xl text-slate-600">restaurant</span>
              </div>
            </div>

            <!-- Details Content -->
            <div class="flex flex-1 flex-col justify-between p-6 lg:p-8">
              <div class="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                <div>
                  <span class="text-xs font-bold uppercase tracking-[0.2em]" :class="index === 0 ? 'text-[#33ff77]/80' : 'text-slate-400'">Mesa</span>
                  <h3 class="text-6xl font-bold tracking-tighter text-white lg:text-7xl">MESA {{ pedido.mesa_id || '?' }}</h3>
                </div>
                <div class="flex flex-col gap-2 xl:text-right">
                  <span class="text-xs font-bold uppercase tracking-[0.2em]" :class="index === 0 ? 'text-[#33ff77]/80' : 'text-slate-400'">Contenido</span>
                  <p class="text-xl font-medium text-[#8dcea3]">
                    {{ formatItems(pedido.items) }}
                  </p>
                  <div class="mt-2 flex items-center gap-2 text-sm font-semibold xl:justify-end" :class="index === 0 ? 'text-amber-500' : 'text-slate-400'">
                    <span class="material-symbols-outlined text-sm">schedule</span>
                    <span>{{ tiempoEspera(pedido.updated_at || pedido.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Interactive Delivery Button -->
              <div class="mt-8">
                <button
                  @click="marcarEntregado(pedido.id)"
                  :class="[
                    'swipe-track group/btn relative flex w-full items-center justify-center overflow-hidden rounded-lg py-6 transition-all active:scale-[0.98]',
                    index === 0
                      ? 'border border-[#33ff77]/30 hover:bg-[#33ff77]/10'
                      : 'border border-[#33ff77]/10 hover:bg-[#33ff77]/5'
                  ]"
                >
                  <div
                    :class="[
                      'absolute left-4 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300',
                      index === 0
                        ? 'bg-[#33ff77] text-[#0f2316] shadow-[#33ff77]/40 group-hover/btn:translate-x-4'
                        : 'bg-white/10 text-white group-hover/btn:bg-[#33ff77] group-hover/btn:text-[#0f2316]'
                    ]"
                  >
                    <span class="material-symbols-outlined font-bold">arrow_forward</span>
                  </div>
                  <span
                    :class="[
                      'text-lg font-black uppercase tracking-[0.2em]',
                      index === 0 ? 'text-[#33ff77]' : 'text-slate-400 group-hover/btn:text-[#33ff77]'
                    ]"
                  >
                    {{ index === 0 ? 'Slide to Deliver' : 'Deliver Order' }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Urgent Indicator Ribbon -->
          <div v-if="index === 0" class="absolute top-0 right-0 bg-[#33ff77] px-4 py-1 text-[10px] font-black uppercase tracking-widest text-[#0f2316]">
            Urgent
          </div>
        </div>
      </div>

      <!-- Dashboard Footer Info -->
      <footer class="mt-12 flex flex-col items-center justify-between border-t border-white/5 py-8 md:flex-row">
        <div class="flex gap-8">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pedidos Hoy</span>
            <div class="mt-1 flex items-baseline gap-2">
              <span class="text-2xl font-bold">{{ estadisticas.total }}</span>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Entregados</span>
            <div class="mt-1 flex items-baseline gap-2">
              <span class="text-2xl font-bold text-[#33ff77]">{{ estadisticas.entregados }}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 flex items-center gap-4 md:mt-0">
          <button class="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10">
            <span class="material-symbols-outlined text-sm">history</span>
            Ver Historial
          </button>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

const loading = ref(true)
const pedidos = ref([])
const horaActual = ref('')

let subscription = null
let clockInterval = null

// Pedidos listos para entregar
const pedidosListos = computed(() => {
  return pedidos.value.filter(p => p.estado === 'listo')
})

// Estadisticas
const estadisticas = computed(() => {
  const hoy = new Date().toDateString()
  const pedidosHoy = pedidos.value.filter(p => {
    const fecha = new Date(p.created_at)
    return fecha.toDateString() === hoy
  })
  return {
    total: pedidosHoy.length,
    entregados: pedidosHoy.filter(p => p.estado === 'entregado').length
  }
})

onMounted(async () => {
  await cargarPedidos()
  suscribirPedidos()
  actualizarReloj()
  clockInterval = setInterval(actualizarReloj, 1000)
})

onUnmounted(() => {
  if (subscription) subscription.unsubscribe()
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
      .in('estado', ['listo', 'entregado'])
      .order('updated_at', { ascending: false })

    pedidos.value = data || []
  } catch (e) {
    console.error('Error cargando pedidos:', e)
  } finally {
    loading.value = false
  }
}

function suscribirPedidos() {
  subscription = supabase
    .channel('cocina-pedidos')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
      cargarPedidos()
    })
    .subscribe()
}

async function marcarEntregado(pedidoId) {
  try {
    await supabase
      .from('pedidos')
      .update({ estado: 'entregado', updated_at: new Date().toISOString() })
      .eq('id', pedidoId)

    await cargarPedidos()
  } catch (e) {
    console.error('Error marcando entregado:', e)
  }
}

function formatItems(items) {
  if (!items || !Array.isArray(items)) return 'Sin items'
  return items.map(i => `${i.cantidad || 1}x ${i.nombre}`).join(', ')
}

function tiempoEspera(fecha) {
  if (!fecha) return 'Ahora'
  const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000 / 60)
  if (diff < 1) return 'Ahora'
  if (diff === 1) return 'Hace 1 min'
  return `Hace ${diff}m`
}

function cerrarSesion() {
  sessionStorage.removeItem('userRole')
  sessionStorage.removeItem('adminAuth')
  router.push('/la-toscana/table/1')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

.font-display {
  font-family: 'Space Grotesk', sans-serif;
}

.glow-card {
  box-shadow: 0 0 20px rgba(51, 255, 119, 0.15);
  border: 1px solid rgba(51, 255, 119, 0.2);
}

.urgent-pulse {
  box-shadow: 0 0 35px rgba(51, 255, 119, 0.3);
  border: 2px solid rgba(51, 255, 119, 0.5);
}

.swipe-track {
  background: linear-gradient(90deg, rgba(51, 255, 119, 0.1) 0%, rgba(51, 255, 119, 0) 100%);
}
</style>

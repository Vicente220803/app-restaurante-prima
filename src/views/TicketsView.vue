<template>
  <div class="bg-[#0f1115] text-white min-h-screen">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-4xl font-black tracking-tight mb-2">Historial de Tickets</h2>
      <p style="color: #9ca3af; font-size: 1.1rem;">Registro completo de todas las ventas</p>
    </div>

    <!-- Controles de Filtro y Búsqueda -->
    <div class="mb-8 p-6 rounded-2xl" style="background: linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%); border: 1px solid #2d2d2d;">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Búsqueda por ID Ticket -->
        <div>
          <label class="text-sm font-bold mb-2 block uppercase tracking-wider" style="color: #f97316;">Búsqueda</label>
          <input
            v-model="filtroId"
            type="text"
            placeholder="ID o Mesa..."
            class="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border-2 border-[#2d2d2d] text-white placeholder-gray-600 focus:border-[#f97316] focus:outline-none transition-all"
          />
        </div>

        <!-- Filtro por Fecha Inicio -->
        <div>
          <label class="text-sm font-bold mb-2 block uppercase tracking-wider" style="color: #f97316;">Desde</label>
          <input
            v-model="fechaInicio"
            type="date"
            class="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border-2 border-[#2d2d2d] text-white focus:border-[#f97316] focus:outline-none transition-all"
          />
        </div>

        <!-- Filtro por Fecha Fin -->
        <div>
          <label class="text-sm font-bold mb-2 block uppercase tracking-wider" style="color: #f97316;">Hasta</label>
          <input
            v-model="fechaFin"
            type="date"
            class="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border-2 border-[#2d2d2d] text-white focus:border-[#f97316] focus:outline-none transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Grid de Tickets -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin w-12 h-12 border-4 border-[#f97316] border-t-transparent rounded-full mx-auto"></div>
      <p class="mt-4" style="color: #6b7280;">Cargando tickets...</p>
    </div>

    <div v-else-if="ticketsFiltrados.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Card de Ticket -->
      <div
        v-for="ticket in ticketsFiltrados"
        :key="ticket.id"
        @click="abrirModalTicket(ticket)"
        class="rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
        style="background: linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%); border: 2px solid #2d2d2d;"
      >
        <!-- Header del Card -->
        <div class="p-6 bg-gradient-to-r from-[#f97316] to-[#d97706] flex items-center justify-between">
          <div>
            <p class="text-white/80 text-sm font-semibold uppercase tracking-wide">Mesa {{ ticket.mesa }}</p>
            <p class="text-white text-xs mt-1">{{ formatearFecha(ticket.created_at) }} · {{ formatearHora(ticket.created_at) }}</p>
          </div>
          <div class="text-right">
            <span :class="[
              'px-3 py-1 rounded-full text-xs font-black uppercase',
              ticket.metodo_pago === 'efectivo'
                ? 'bg-white/20 text-white'
                : 'bg-blue-500/20 text-blue-100'
            ]">
              {{ ticket.metodo_pago === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta' }}
            </span>
          </div>
        </div>

        <!-- Contenido del Card -->
        <div class="p-6 space-y-4">
          <!-- Items Count -->
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#f97316]" style="font-size: 1.5rem;">shopping_cart</span>
            <span class="text-gray-400 font-semibold">{{ ticket.cantidad_items }} {{ ticket.cantidad_items === 1 ? 'item' : 'items' }}</span>
          </div>

          <!-- Total Principal -->
          <div class="pt-4 border-t-2 border-[#2d2d2d]">
            <p style="color: #9ca3af;" class="text-sm font-semibold mb-2 uppercase tracking-wider">Total</p>
            <p class="text-4xl font-black text-white">
              {{ ticket.total.toFixed(2) }}<span style="color: #f97316; font-size: 0.6em; margin-left: 4px;">€</span>
            </p>
          </div>

          <!-- Descuento (si hay) -->
          <div v-if="ticket.descuento > 0" class="pt-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-green-500">check_circle</span>
            <span style="color: #22c55e;" class="text-sm font-bold">Descuento: -{{ ticket.descuento.toFixed(2) }}€</span>
          </div>
        </div>

        <!-- Footer del Card -->
        <div class="px-6 pb-6">
          <button
            class="w-full py-3 rounded-xl font-bold uppercase tracking-wider transition-all text-white flex items-center justify-center gap-2"
            style="background-color: rgba(249, 115, 22, 0.2); color: #f97316; border: 2px solid #f97316;"
            @click.stop="abrirModalTicket(ticket)"
            @mouseenter="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.3)'"
            @mouseleave="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.2)'"
          >
            <span class="material-symbols-outlined text-sm">receipt_long</span>
            Ver Detalle
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <span class="material-symbols-outlined text-6xl mb-4 block" style="color: #4b5563;">receipt_long</span>
      <p class="text-xl" style="color: #6b7280;">No hay tickets registrados con los filtros aplicados</p>
    </div>

    <!-- Modal Detalle Ticket -->
    <div v-if="mostrarModalTicket && ticketSeleccionado" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-[#0f1115] rounded-2xl border-2 border-[#2d2d2d] max-w-lg w-full shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#f97316] to-[#d97706] px-8 py-8">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-white/80 text-sm font-bold uppercase tracking-widest">TICKET</p>
              <h2 class="text-3xl font-black text-white tracking-tight mt-1">Mesa {{ ticketSeleccionado.mesa }}</h2>
              <p class="text-white/90 text-sm mt-2">{{ formatearFecha(ticketSeleccionado.created_at) }} · {{ formatearHora(ticketSeleccionado.created_at) }}</p>
            </div>
            <button
              @click="cerrarModalTicket"
              class="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <span class="material-symbols-outlined text-white text-2xl">close</span>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-8 max-h-[70vh] overflow-y-auto">
          <!-- Método de pago -->
          <div class="mb-6 flex items-center justify-center">
            <span class="text-4xl">{{ ticketSeleccionado.metodo_pago === 'efectivo' ? '💵' : '💳' }}</span>
            <span class="ml-3 text-lg font-bold" :style="{
              color: ticketSeleccionado.metodo_pago === 'efectivo' ? '#22c55e' : '#3b82f6'
            }">
              {{ ticketSeleccionado.metodo_pago === 'efectivo' ? 'PAGO EN EFECTIVO' : 'PAGO CON TARJETA' }}
            </span>
          </div>

          <!-- Detalle de items -->
          <div class="mb-8 pb-8 border-b-2 border-[#2d2d2d]">
            <h3 class="text-sm font-bold uppercase tracking-widest text-[#9ca3af] mb-4">Artículos Pedidos</h3>
            <div v-if="ticketSeleccionado.items && ticketSeleccionado.items.length > 0" class="space-y-3">
              <div
                v-for="(item, index) in ticketSeleccionado.items"
                :key="index"
                class="flex justify-between items-start p-4 rounded-xl bg-[#1f1f1f] border border-[#2d2d2d] hover:border-[#f97316]/50 transition-colors"
              >
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xl font-black text-[#f97316]">{{ item.cantidad }}x</span>
                    <p class="text-white font-bold">{{ item.nombre }}</p>
                  </div>
                  <p v-if="item.opciones" class="text-xs text-gray-400 mt-1 ml-6">{{ item.opciones }}</p>
                </div>
                <p class="text-white font-bold ml-4 text-lg">{{ (item.precio * item.cantidad).toFixed(2) }}€</p>
              </div>
            </div>
          </div>

          <!-- Resumen SOLO TOTAL -->
          <div class="bg-gradient-to-br from-[#1f1f1f] to-[#0a0a0a] rounded-xl p-6 border-2 border-[#2d2d2d]">
            <p style="color: #9ca3af;" class="text-xs font-bold uppercase tracking-widest mb-3">Monto a pagar</p>
            <div class="flex items-baseline justify-between">
              <span class="text-white text-sm font-semibold">TOTAL</span>
              <p class="text-5xl font-black text-white">
                {{ ticketSeleccionado.total.toFixed(2) }}<span style="color: #f97316; font-size: 0.4em; margin-left: 4px;">€</span>
              </p>
            </div>

            <!-- Descuento (si hay) -->
            <div v-if="ticketSeleccionado.descuento > 0" class="mt-4 pt-4 border-t border-[#2d2d2d] flex items-center justify-between">
              <span style="color: #22c55e;" class="font-bold text-sm">DESCUENTO APLICADO</span>
              <span style="color: #22c55e;" class="font-black text-lg">-{{ ticketSeleccionado.descuento.toFixed(2) }}€</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-[#0a0a0a] border-t-2 border-[#2d2d2d] flex gap-3">
          <button
            @click="cerrarModalTicket"
            class="flex-1 px-4 py-4 bg-[#1f1f1f] hover:bg-[#2d2d2d] text-white font-bold rounded-xl transition-colors uppercase tracking-wider"
          >
            Cerrar
          </button>
          <button
            class="flex-1 px-4 py-4 font-bold rounded-xl transition-all uppercase tracking-wider text-white flex items-center justify-center gap-2"
            style="background: linear-gradient(135deg, #f97316 0%, #d97706 100%);"
            @mouseenter="$event.target.style.opacity = '0.9'"
            @mouseleave="$event.target.style.opacity = '1'"
          >
            <span class="material-symbols-outlined text-lg">print</span>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabase'

const loading = ref(true)
const tickets = ref([])
const mostrarModalTicket = ref(false)
const ticketSeleccionado = ref(null)

// Filtros
const filtroId = ref('')
const fechaInicio = ref('')
const fechaFin = ref('')

let subscription = null

// Cargar tickets
const cargarTickets = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    tickets.value = data || []
  } catch (e) {
    console.error('Error cargando tickets:', e)
  } finally {
    loading.value = false
  }
}

// Filtrar tickets
const ticketsFiltrados = computed(() => {
  return tickets.value.filter(ticket => {
    // Filtro por búsqueda (ID o Mesa)
    if (filtroId.value) {
      const busqueda = filtroId.value.toLowerCase()
      const idCoincide = ticket.id.toLowerCase().includes(busqueda)
      const mesaCoincide = ticket.mesa.toString().includes(busqueda)
      if (!idCoincide && !mesaCoincide) return false
    }

    // Filtro por fechas
    if (fechaInicio.value) {
      const inicio = new Date(fechaInicio.value)
      const ticketFecha = new Date(ticket.created_at)
      if (ticketFecha < inicio) return false
    }

    if (fechaFin.value) {
      const fin = new Date(fechaFin.value)
      const ticketFecha = new Date(ticket.created_at)
      // Agregar 1 día para incluir todo el día
      fin.setDate(fin.getDate() + 1)
      if (ticketFecha > fin) return false
    }

    return true
  })
})

// Formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Formatear hora
const formatearHora = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// Limpiar filtros
const limpiarFiltros = () => {
  filtroId.value = ''
  fechaInicio.value = ''
  fechaFin.value = ''
}

// Abrir modal
const abrirModalTicket = (ticket) => {
  ticketSeleccionado.value = ticket
  mostrarModalTicket.value = true
}

// Cerrar modal
const cerrarModalTicket = () => {
  mostrarModalTicket.value = false
  ticketSeleccionado.value = null
}

// Suscripción en tiempo real
const iniciarSuscripcion = () => {
  subscription = supabase
    .channel('tickets-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
      cargarTickets()
    })
    .subscribe()
}

onMounted(() => {
  cargarTickets()
  iniciarSuscripcion()
})

onUnmounted(() => {
  if (subscription) supabase.removeChannel(subscription)
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

<template>
  <div class="bg-[#0f1115] text-white min-h-screen p-6">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-4xl font-black tracking-tight mb-2">Archivo de Tickets</h2>
      <p style="color: #9ca3af; font-size: 1.1rem;">Base de datos completa de todas las transacciones y pedidos anteriores del restaurante.</p>
    </div>

    <!-- Container Principal - Dos Columnas -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      <!-- COLUMNA IZQUIERDA - TABLA Y FILTROS -->
      <div class="lg:col-span-2 flex flex-col">
        <!-- Panel de Filtros -->
        <div class="mb-6 p-6 rounded-2xl" style="background: linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%); border: 1px solid #2d2d2d;">
          <!-- Búsqueda -->
          <div class="mb-4">
            <label class="text-sm font-bold mb-2 block uppercase tracking-wider" style="color: #f97316;">Buscar por ID de Ticket, Mesa o Camarero...</label>
            <input
              v-model="filtroId"
              type="text"
              placeholder="Ingrese búsqueda..."
              class="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border-2 border-[#2d2d2d] text-white placeholder-gray-600 focus:border-[#f97316] focus:outline-none transition-all"
            />
          </div>

          <!-- Filtros Secundarios -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <!-- Rango de Fechas -->
            <div>
              <label class="text-xs font-bold mb-2 block uppercase tracking-wider" style="color: #f97316;">Rango de Fechas</label>
              <div class="flex gap-2">
                <input
                  v-model="fechaInicio"
                  type="date"
                  class="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0a] border-2 border-[#2d2d2d] text-white text-sm focus:border-[#f97316] focus:outline-none transition-all"
                />
                <input
                  v-model="fechaFin"
                  type="date"
                  class="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0a] border-2 border-[#2d2d2d] text-white text-sm focus:border-[#f97316] focus:outline-none transition-all"
                />
              </div>
            </div>

            <!-- Método de Pago -->
            <div>
              <label class="text-xs font-bold mb-2 block uppercase tracking-wider" style="color: #f97316;">Método de Pago</label>
              <select
                v-model="filtroMetodo"
                class="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border-2 border-[#2d2d2d] text-white text-sm focus:border-[#f97316] focus:outline-none transition-all"
              >
                <option value="">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>

            <!-- Rango de Monto -->
            <div>
              <label class="text-xs font-bold mb-2 block uppercase tracking-wider" style="color: #f97316;">Rango de Monto</label>
              <input
                v-model.number="montoMax"
                type="number"
                placeholder="Monto máximo..."
                class="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border-2 border-[#2d2d2d] text-white text-sm placeholder-gray-600 focus:border-[#f97316] focus:outline-none transition-all"
              />
            </div>
          </div>

          <!-- Botón Aplicar Filtros -->
          <button
            @click="limpiarFiltros"
            class="w-full py-3 rounded-xl font-bold uppercase tracking-wider transition-all text-white"
            style="background: linear-gradient(135deg, #f97316 0%, #d97706 100%);"
          >
            Aplicar Filtros
          </button>
        </div>

        <!-- Tabla de Tickets -->
        <div class="flex-1 overflow-hidden rounded-2xl border-2 border-[#2d2d2d]" style="background: linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%);">
          <div v-if="loading" class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="animate-spin w-12 h-12 border-4 border-[#f97316] border-t-transparent rounded-full mx-auto"></div>
              <p class="mt-4" style="color: #6b7280;">Cargando tickets...</p>
            </div>
          </div>

          <div v-else-if="ticketsFiltrados.length > 0" class="overflow-x-auto h-full flex flex-col">
            <!-- Header de la Tabla -->
            <div class="grid grid-cols-6 gap-4 p-4 bg-[#0a0a0a] border-b-2 border-[#2d2d2d] font-bold uppercase tracking-widest text-xs sticky top-0" style="color: #f97316;">
              <div>ID Ticket</div>
              <div>Fecha y Hora</div>
              <div>Mesa</div>
              <div>Camarero</div>
              <div>Método</div>
              <div class="text-right">Monto</div>
            </div>

            <!-- Filas de la Tabla -->
            <div class="overflow-y-auto flex-1">
              <div
                v-for="ticket in ticketsFiltrados"
                :key="ticket.id"
                @click="abrirDetalleTicket(ticket)"
                class="grid grid-cols-6 gap-4 p-4 border-b border-[#2d2d2d] items-center cursor-pointer transition-all hover:bg-[#1f1f1f]"
                :style="{ backgroundColor: ticketSeleccionado?.id === ticket.id ? '#1f1f1f' : 'transparent' }"
              >
                <div class="text-sm font-bold text-[#f97316]">#{{ ticket.id.slice(-6) }}</div>
                <div class="text-sm">{{ formatearFecha(ticket.created_at) }} · {{ formatearHora(ticket.created_at) }}</div>
                <div class="text-sm font-semibold">T-{{ String(ticket.mesa).padStart(2, '0') }}</div>
                <div class="text-sm">{{ ticket.camarero || '-' }}</div>
                <div>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-bold',
                    ticket.metodo_pago === 'efectivo'
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-blue-900/30 text-blue-400'
                  ]">
                    {{ ticket.metodo_pago === 'efectivo' ? 'EFECTIVO' : 'TARJETA' }}
                  </span>
                </div>
                <div class="text-right font-bold text-[#f97316]">€{{ ticket.total.toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center justify-center h-full">
            <div class="text-center">
              <span class="material-symbols-outlined text-6xl mb-4 block" style="color: #4b5563;">receipt_long</span>
              <p class="text-lg" style="color: #6b7280;">No hay tickets registrados con los filtros aplicados</p>
            </div>
          </div>

          <!-- Paginación -->
          <div v-if="ticketsFiltrados.length > 0" class="p-4 border-t-2 border-[#2d2d2d] flex items-center justify-between" style="color: #9ca3af;">
            <span class="text-sm">Mostrando {{ ticketsFiltrados.length }} de {{ tickets.length }} tickets</span>
            <div class="flex gap-2">
              <button class="p-2 hover:bg-[#1f1f1f] rounded-lg transition-colors">
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <button class="p-2 hover:bg-[#1f1f1f] rounded-lg transition-colors">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- COLUMNA DERECHA - DETALLES DEL TICKET -->
      <div v-if="ticketSeleccionado" class="lg:col-span-1 flex flex-col rounded-2xl border-2 border-[#2d2d2d] overflow-hidden" style="background: linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%);">
        <!-- Header Detalles -->
        <div class="bg-gradient-to-r from-[#f97316] to-[#d97706] px-6 py-6 border-b-2 border-[#2d2d2d]">
          <p class="text-white/80 text-xs font-bold uppercase tracking-widest">{{ config?.restaurant?.name }}</p>
          <p class="text-white/70 text-xs mt-1">{{ config?.restaurant?.address }}</p>
          <p class="text-white/70 text-xs">{{ config?.restaurant?.phone }}</p>
        </div>

        <!-- Content Detalles -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <!-- ID y Fecha -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span style="color: #9ca3af;">Ticket ID:</span>
              <span class="font-bold text-[#f97316;">#{{ ticketSeleccionado.id.slice(-6) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span style="color: #9ca3af;">Fecha:</span>
              <span class="font-bold">{{ formatearFecha(ticketSeleccionado.created_at) }} - {{ formatearHora(ticketSeleccionado.created_at) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span style="color: #9ca3af;">Mesa / Camarero:</span>
              <span class="font-bold">T-{{ String(ticketSeleccionado.mesa).padStart(2, '0') }} / {{ ticketSeleccionado.camarero || 'No asignado' }}</span>
            </div>
          </div>

          <div class="border-t-2 border-[#2d2d2d]"></div>

          <!-- Items -->
          <div class="space-y-2">
            <p class="text-xs font-bold uppercase tracking-widest" style="color: #f97316;">Artículos</p>
            <div v-if="ticketSeleccionado.items && ticketSeleccionado.items.length > 0" class="space-y-2">
              <div
                v-for="(item, idx) in ticketSeleccionado.items"
                :key="idx"
                class="flex justify-between text-sm"
              >
                <div>
                  <span class="text-[#f97316] font-bold">{{ item.cantidad }}x</span>
                  <span class="ml-2">{{ item.nombre }}</span>
                </div>
                <span class="font-bold">€{{ (item.precio * item.cantidad).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="border-t-2 border-[#2d2d2d]"></div>

          <!-- Resumen de Monto -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span style="color: #9ca3af;">Subtotal:</span>
              <span class="font-bold">€{{ (ticketSeleccionado.total + ticketSeleccionado.descuento - ticketSeleccionado.impuestos).toFixed(2) }}</span>
            </div>
            <div v-if="ticketSeleccionado.descuento > 0" class="flex justify-between">
              <span style="color: #22c55e;">Descuento (10%):</span>
              <span style="color: #22c55e;" class="font-bold">-€{{ ticketSeleccionado.descuento.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color: #9ca3af;">Impuestos (5%):</span>
              <span class="font-bold">€{{ ticketSeleccionado.impuestos.toFixed(2) }}</span>
            </div>
            <div class="border-t-2 border-[#2d2d2d] pt-2 flex justify-between">
              <span class="font-bold uppercase">Total:</span>
              <span class="text-xl font-black text-[#f97316]">€{{ ticketSeleccionado.total.toFixed(2) }}</span>
            </div>
          </div>

          <div class="border-t-2 border-[#2d2d2d]"></div>

          <!-- Footer Message -->
          <p class="text-center text-xs italic" style="color: #9ca3af;">*** Copia del Cliente ***<br>¡Gracias por disfrutar con nosotros!</p>
        </div>

        <!-- Botones Acciones -->
        <div class="p-4 bg-[#0a0a0a] border-t-2 border-[#2d2d2d] flex gap-2">
          <button
            class="flex-1 px-4 py-3 rounded-xl font-bold transition-all text-white flex items-center justify-center gap-2 border-2"
            style="border-color: #f97316; color: #f97316; background-color: rgba(249, 115, 22, 0.1);"
            @mouseenter="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.2)'"
            @mouseleave="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.1)'"
          >
            <span class="material-symbols-outlined text-sm">share</span>
            Compartir
          </button>
          <button
            class="flex-1 px-4 py-3 rounded-xl font-bold transition-all text-white flex items-center justify-center gap-2"
            style="background: linear-gradient(135deg, #f97316 0%, #d97706 100%);"
            @mouseenter="$event.target.style.opacity = '0.9'"
            @mouseleave="$event.target.style.opacity = '1'"
          >
            <span class="material-symbols-outlined text-sm">print</span>
            Re-imprimir
          </button>
        </div>
      </div>

      <!-- Placeholder cuando no hay ticket seleccionado -->
      <div v-else class="lg:col-span-1 rounded-2xl border-2 border-[#2d2d2d] flex items-center justify-center" style="background: linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%);">
        <div class="text-center">
          <span class="material-symbols-outlined text-5xl mb-4 block" style="color: #4b5563;">receipt_long</span>
          <p style="color: #6b7280;">Selecciona un ticket para ver los detalles</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabase'
import { loadConfig } from '../services/configService'

const loading = ref(true)
const tickets = ref([])
const ticketSeleccionado = ref(null)
const config = ref(null)

// Filtros
const filtroId = ref('')
const fechaInicio = ref('')
const fechaFin = ref('')
const filtroMetodo = ref('')
const montoMax = ref(null)

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
    // Filtro por búsqueda (ID, Mesa o Camarero)
    if (filtroId.value) {
      const busqueda = filtroId.value.toLowerCase()
      const idCoincide = ticket.id.toLowerCase().includes(busqueda)
      const mesaCoincide = ticket.mesa.toString().includes(busqueda)
      const camareroCoincide = (ticket.camarero || '').toLowerCase().includes(busqueda)
      if (!idCoincide && !mesaCoincide && !camareroCoincide) return false
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
      fin.setDate(fin.getDate() + 1)
      if (ticketFecha > fin) return false
    }

    // Filtro por método de pago
    if (filtroMetodo.value && ticket.metodo_pago !== filtroMetodo.value) {
      return false
    }

    // Filtro por monto máximo
    if (montoMax.value && ticket.total > montoMax.value) {
      return false
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
  filtroMetodo.value = ''
  montoMax.value = null
}

// Abrir detalle del ticket
const abrirDetalleTicket = (ticket) => {
  ticketSeleccionado.value = ticket
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

onMounted(async () => {
  config.value = await loadConfig()
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

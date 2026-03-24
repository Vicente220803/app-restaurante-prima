<template>
  <div class="bg-[#0f1115] text-white min-h-screen p-6">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-4xl font-black tracking-tight mb-2">Archivo de Tickets</h2>
      <p style="color: #9ca3af; font-size: 1.1rem;">Base de datos completa de todas las transacciones y pedidos anteriores del restaurante.</p>
    </div>

    <!-- Container Principal - Dos Columnas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
      <!-- COLUMNA IZQUIERDA - TABLA Y FILTROS -->
      <div class="flex flex-col">
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

      <!-- COLUMNA DERECHA - VISTA PREVIA DEL TICKET (FORMATO IMPRESORA TÉRMICA) -->
      <div v-if="ticketSeleccionado" class="flex flex-col rounded-2xl border-2 border-[#2d2d2d] overflow-hidden" style="background: linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%);">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#f97316] to-[#d97706] px-6 py-4 border-b-2 border-[#2d2d2d]">
          <p class="text-white text-sm font-bold">VISTA PREVIA DE IMPRESIÓN</p>
          <p class="text-white/70 text-xs">Esto es lo que saldrá por la impresora térmica</p>
        </div>

        <!-- Ticket Printer Component -->
        <div class="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <TicketPrinter :ticket="ticketSeleccionado" :config="config" />
        </div>

        <!-- Botones Acciones -->
        <div class="p-4 bg-[#0a0a0a] border-t-2 border-[#2d2d2d] flex gap-2">
          <button
            class="flex-1 px-4 py-3 rounded-xl font-bold transition-all text-white flex items-center justify-center gap-2 border-2"
            style="border-color: #f97316; color: #f97316; background-color: rgba(249, 115, 22, 0.1);"
            @mouseenter="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.2)'"
            @mouseleave="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.1)'"
            @click="abrirEdicion"
          >
            <span class="material-symbols-outlined text-sm">edit</span>
            Editar
          </button>
          <button
            class="flex-1 px-4 py-3 rounded-xl font-bold transition-all text-white flex items-center justify-center gap-2 border-2"
            style="border-color: #f97316; color: #f97316; background-color: rgba(249, 115, 22, 0.1);"
            @mouseenter="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.2)'"
            @mouseleave="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.1)'"
            @click="imprimirTicket"
          >
            <span class="material-symbols-outlined text-sm">print</span>
            Imprimir
          </button>
          <button
            class="flex-1 px-4 py-3 rounded-xl font-bold transition-all text-white flex items-center justify-center gap-2"
            style="background: linear-gradient(135deg, #f97316 0%, #d97706 100%);"
            @mouseenter="$event.target.style.opacity = '0.9'"
            @mouseleave="$event.target.style.opacity = '1'"
            @click="descargarPDF"
          >
            <span class="material-symbols-outlined text-sm">download</span>
            PDF
          </button>
        </div>
      </div>

      <!-- Placeholder cuando no hay ticket seleccionado -->
      <div v-else class="rounded-2xl border-2 border-[#2d2d2d] flex items-center justify-center" style="background: linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%);">
        <div class="text-center">
          <span class="material-symbols-outlined text-5xl mb-4 block" style="color: #4b5563;">receipt_long</span>
          <p style="color: #6b7280;">Selecciona un ticket para ver los detalles</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Edición -->
  <EditTicketModal
    v-if="mostrarModalEdicion && ticketSeleccionado"
    :ticket="ticketSeleccionado"
    @close="cerrarEdicion"
    @save="guardarCambiosTicket"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabase'
import { loadConfig } from '../services/configService'
import TicketPrinter from '../components/TicketPrinter.vue'
import EditTicketModal from '../components/EditTicketModal.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toastService } from '../services/toastService'

const loading = ref(true)
const tickets = ref([])
const ticketSeleccionado = ref(null)
const config = ref(null)
const mostrarModalEdicion = ref(false)

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
    console.log('Tickets cargados:', tickets.value) // Debug
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
  // Asegurar que los items se parseen correctamente
  const ticketCopia = { ...ticket }
  if (typeof ticketCopia.items === 'string') {
    try {
      ticketCopia.items = JSON.parse(ticketCopia.items)
    } catch (e) {
      console.error('Error parseando items:', e)
      ticketCopia.items = []
    }
  }
  ticketSeleccionado.value = ticketCopia
  console.log('Ticket seleccionado:', ticketSeleccionado.value) // Debug
}

// Imprimir ticket
const imprimirTicket = () => {
  const printWindow = window.open('', '', 'width=400,height=600')
  const ticketHTML = document.querySelector('[style*="font-family"]')?.outerHTML || ''
  printWindow.document.write(`
    <html>
      <head>
        <style>
          body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; }
          .ticket-content { width: 280px; margin: 0 auto; font-size: 12px; line-height: 1.4; }
        </style>
      </head>
      <body>
        ${ticketHTML}
      </body>
    </html>
  `)
  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

// Editar ticket
const abrirEdicion = () => {
  mostrarModalEdicion.value = true
}

const cerrarEdicion = () => {
  mostrarModalEdicion.value = false
}

// Guardar cambios del ticket
const guardarCambiosTicket = async (datosActualizados) => {
  try {
    console.log('Guardando ticket:', ticketSeleccionado.value.id)
    console.log('Datos a guardar:', datosActualizados)

    // Validar que hay un ticket seleccionado
    if (!ticketSeleccionado.value?.id) {
      throw new Error('No hay ticket seleccionado')
    }

    // Preparar items - asegurarse de que tiene la estructura correcta
    const itemsProcesados = (datosActualizados.items || []).map(item => ({
      nombre: String(item.nombre || ''),
      cantidad: Number(item.cantidad) || 1,
      precio: Number(item.precio) || 0
    }))

    console.log('Items procesados:', itemsProcesados)

    // Preparar datos para actualizar
    const datosParaGuardar = {
      items: itemsProcesados,
      subtotal: Number(datosActualizados.subtotal) || 0,
      descuento: Number(datosActualizados.descuento) || 0,
      total: Number(datosActualizados.total) || 0
    }

    console.log('Datos finales a guardar:', JSON.stringify(datosParaGuardar))

    const { data, error } = await supabase
      .from('tickets')
      .update(datosParaGuardar)
      .eq('id', ticketSeleccionado.value.id)
      .select()

    if (error) {
      console.error('Error de Supabase completo:', error)
      console.error('Detalles:', error.details || error.message)
      throw new Error(error.message || 'Error desconocido de Supabase')
    }

    console.log('Respuesta de Supabase:', data)

    // Actualizar el ticket seleccionado con los nuevos datos
    ticketSeleccionado.value = {
      ...ticketSeleccionado.value,
      items: itemsProcesados,
      subtotal: datosActualizados.subtotal,
      descuento: datosActualizados.descuento,
      total: datosActualizados.total
    }

    // Recargar lista de tickets
    await cargarTickets()

    cerrarEdicion()
    console.log('✅ Cambios guardados correctamente')
    toastService.success('✅ Ticket actualizado correctamente')
  } catch (e) {
    console.error('Error guardando cambios:', e)
    toastService.error('❌ Error: ' + (e.message || 'Error desconocido'))
  }
}

// Descargar como PDF
const descargarPDF = async () => {
  try {
    const ticketElement = document.querySelector('.font-mono.text-xs.bg-black')
    if (!ticketElement) {
      toastService.error('❌ Error: No se pudo encontrar el ticket')
      return
    }

    toastService.loading('⏳ Generando PDF...')

    // Crear canvas del elemento
    const canvas = await html2canvas(ticketElement, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#000000'
    })

    // Crear PDF con tamaño de papel térmico (80mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200] // 80mm ancho, 200mm alto
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 80
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

    // Descargar
    const nombreArchivo = `ticket-${ticketSeleccionado.value.id.slice(-6)}-${new Date().getTime()}.pdf`
    pdf.save(nombreArchivo)

    toastService.success('✅ PDF descargado correctamente')
  } catch (e) {
    console.error('Error descargando PDF:', e)
    toastService.error('❌ Error al descargar PDF: ' + e.message)
  }
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

<template>
  <div class="font-mono text-xs bg-black text-white p-4 rounded-lg" style="font-family: 'Courier New', monospace; line-height: 1.5; max-width: 380px; width: 100%;">
    <!-- Contenido del ticket -->
    <div class="ticket-content" style="width: 280px; margin: 0 auto; word-break: break-word;">
      <!-- Header del Restaurante -->
      <div class="text-center mb-2">
        <div class="font-bold" style="font-size: 11px;">{{ restaurantName }}</div>
        <div style="font-size: 9px; color: #ccc;">{{ restaurantAddress }}</div>
        <div style="font-size: 9px; color: #ccc;">{{ restaurantPhone }}</div>
      </div>

      <!-- Línea separadora -->
      <div class="text-center" style="font-size: 9px; letter-spacing: 1px;">- - - - - - - - - - - - - -</div>

      <!-- Fecha, Hora y Ticket ID -->
      <div class="text-center" style="font-size: 10px; margin: 4px 0;">
        <div>{{ formatDate(ticket?.created_at) }} {{ formatTime(ticket?.created_at) }}</div>
        <div>Ticket: #{{ ticketId }}</div>
      </div>

      <!-- Mesa y Camarero -->
      <div class="text-center" style="font-size: 10px; margin-bottom: 4px;">
        <div>Mesa: {{ tableName }}</div>
        <div>Camarero: {{ ticket?.camarero || '-' }}</div>
      </div>

      <!-- Línea separadora -->
      <div class="text-center" style="font-size: 9px; letter-spacing: 1px;">- - - - - - - - - - - - - -</div>

      <!-- Items -->
      <div style="margin: 4px 0; font-size: 10px;">
        <div v-if="hasItems">
          <div v-for="(item, idx) in ticket?.items" :key="idx" style="margin-bottom: 2px;">
            <div>{{ item?.cantidad || 1 }}x {{ item?.nombre || 'Artículo' }}</div>
            <div style="text-align: right;">€{{ ((item?.precio || 0) * (item?.cantidad || 1)).toFixed(2) }}</div>
          </div>
        </div>
        <div v-else style="color: #aaa;">Sin artículos</div>
      </div>

      <!-- Línea separadora -->
      <div class="text-center" style="font-size: 9px; letter-spacing: 1px;">- - - - - - - - - - - - - -</div>

      <!-- Totales -->
      <div style="font-size: 10px; margin: 4px 0;">
        <div style="display: flex; justify-content: space-between;">
          <span>SUBTOTAL</span>
          <span>€{{ (ticket?.subtotal || 0).toFixed(2) }}</span>
        </div>
        <div v-if="(ticket?.descuento || 0) > 0" style="display: flex; justify-content: space-between; color: #0f0;">
          <span>DESCUENTO</span>
          <span>-€{{ (ticket?.descuento || 0).toFixed(2) }}</span>
        </div>
      </div>

      <!-- Línea separadora -->
      <div class="text-center" style="font-size: 9px; letter-spacing: 1px;">= = = = = = = = = = = = = =</div>

      <!-- Total Final -->
      <div class="text-center" style="font-size: 12px; font-weight: bold; margin: 4px 0;">
        <div>TOTAL</div>
        <div style="font-size: 14px;">€{{ (ticket?.total || 0).toFixed(2) }}</div>
      </div>

      <!-- Línea separadora -->
      <div class="text-center" style="font-size: 9px; letter-spacing: 1px;">- - - - - - - - - - - - - -</div>

      <!-- Método de Pago -->
      <div class="text-center" style="font-size: 10px; margin: 4px 0; font-weight: bold;">
        {{ paymentMethod }}
      </div>

      <!-- Footer -->
      <div class="text-center" style="font-size: 9px; color: #aaa; margin-top: 6px;">
        <div>*** Copia del Cliente ***</div>
        <div>¡Gracias por su visita!</div>
        <div>Vuelva pronto</div>
      </div>

      <!-- Espacio -->
      <div style="height: 20px;"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  ticket: {
    type: Object,
    default: null
  },
  config: {
    type: Object,
    default: null
  }
})

// Computed properties
const restaurantName = computed(() => props.config?.restaurant?.name || 'TU RESTAURANTE')
const restaurantAddress = computed(() => props.config?.restaurant?.address || '-')
const restaurantPhone = computed(() => props.config?.restaurant?.phone || '-')

const ticketId = computed(() => {
  if (!props.ticket?.id) return '000000'
  return String(props.ticket.id).slice(-6)
})

const tableName = computed(() => {
  const mesa = props.ticket?.mesa
  if (!mesa && mesa !== 0) return 'N/A'
  return String(mesa).padStart(2, '0')
})

const hasItems = computed(() => {
  return Array.isArray(props.ticket?.items) && props.ticket.items.length > 0
})

const paymentMethod = computed(() => {
  const metodo = props.ticket?.metodo_pago
  if (metodo === 'efectivo') return 'PAGO EN EFECTIVO'
  if (metodo === 'tarjeta') return 'PAGO CON TARJETA'
  return 'PAGO'
})

// Methods
const formatDate = (fecha) => {
  if (!fecha) return 'Fecha desconocida'
  try {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch (e) {
    return 'Fecha desconocida'
  }
}

const formatTime = (fecha) => {
  if (!fecha) return '00:00'
  try {
    const date = new Date(fecha)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return '00:00'
  }
}
</script>

<style scoped>
.ticket-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

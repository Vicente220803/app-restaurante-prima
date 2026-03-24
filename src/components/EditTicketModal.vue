<template>
  <div v-if="mostrarModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div class="bg-[#0a0a0a] rounded-2xl border-2 border-[#2d2d2d] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="bg-gradient-to-r from-[#f97316] to-[#d97706] px-6 py-4 sticky top-0 border-b-2 border-[#2d2d2d]">
        <h2 class="text-white font-bold text-lg">Editar Ticket #{{ ticketId }}</h2>
        <p class="text-white/70 text-xs mt-1">Modifica los artículos, descuentos y precios</p>
      </div>

      <!-- Contenido -->
      <div class="p-6 space-y-6">
        <!-- Items Editables -->
        <div class="space-y-3">
          <h3 class="text-white font-bold uppercase tracking-widest text-sm" style="color: #f97316;">Artículos</h3>

          <div v-for="(item, idx) in itemsEditables" :key="idx" class="bg-[#1f1f1f] p-4 rounded-lg border border-[#2d2d2d] space-y-3">
            <div class="flex justify-between items-start gap-4">
              <div class="flex-1">
                <input
                  v-model="item.nombre"
                  type="text"
                  placeholder="Nombre del artículo"
                  :class="[
                    'w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border text-white text-sm focus:outline-none transition-colors',
                    !item.nombre || item.nombre.trim() === ''
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-[#2d2d2d] focus:border-[#f97316]'
                  ]"
                />
              </div>
              <button
                @click="eliminarItem(idx)"
                class="px-3 py-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors text-sm font-bold"
              >
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="text-xs font-bold text-gray-400 block mb-1">Cantidad</label>
                <input
                  v-model.number="item.cantidad"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#2d2d2d] text-white text-sm focus:border-[#f97316] focus:outline-none"
                />
              </div>
              <div>
                <label class="text-xs font-bold text-gray-400 block mb-1">Precio Unit.</label>
                <input
                  v-model.number="item.precio"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#2d2d2d] text-white text-sm focus:border-[#f97316] focus:outline-none"
                />
              </div>
              <div>
                <label class="text-xs font-bold text-gray-400 block mb-1">Subtotal</label>
                <div class="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#2d2d2d] text-white text-sm font-bold">
                  €{{ (item.cantidad * item.precio).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Botón Agregar Item -->
          <button
            @click="agregarItem"
            class="w-full py-3 rounded-lg border-2 border-dashed border-[#f97316] text-[#f97316] font-bold hover:bg-[#1f1f1f] transition-colors"
          >
            <span class="material-symbols-outlined mr-2 align-middle">add</span>
            Agregar Artículo
          </button>
        </div>

        <!-- Descuento -->
        <div class="space-y-3">
          <h3 class="text-white font-bold uppercase tracking-widest text-sm" style="color: #f97316;">Descuento</h3>
          <input
            v-model.number="descuentoEditado"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ingrese descuento en euros"
            class="w-full px-4 py-3 rounded-lg bg-[#1f1f1f] border border-[#2d2d2d] text-white focus:border-[#f97316] focus:outline-none"
          />
        </div>

        <!-- Resumen de Totales -->
        <div class="bg-[#1f1f1f] p-4 rounded-lg border border-[#2d2d2d] space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Subtotal:</span>
            <span class="text-white font-bold">€{{ subtotalCalculado.toFixed(2) }}</span>
          </div>
          <div v-if="descuentoEditado > 0" class="flex justify-between text-sm">
            <span class="text-green-400">Descuento:</span>
            <span class="text-green-400 font-bold">-€{{ descuentoEditado.toFixed(2) }}</span>
          </div>
          <div class="border-t border-[#2d2d2d] pt-2 flex justify-between text-base">
            <span class="text-white font-bold">Total:</span>
            <span class="text-[#f97316] font-black text-lg">€{{ totalCalculado.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Mensaje de error (si aplica) -->
        <div v-if="hayErrores" class="p-3 bg-red-900/20 border border-red-500 rounded-lg flex gap-2 items-start">
          <span class="material-symbols-outlined text-red-400 mt-0.5">error</span>
          <span class="text-red-400 text-sm">{{ mensajeError }}</span>
        </div>
      </div>

      <!-- Botones Acción -->
      <div class="p-6 bg-[#0a0a0a] border-t-2 border-[#2d2d2d] flex gap-3 sticky bottom-0">
        <button
          @click="cerrarModal"
          class="flex-1 px-4 py-3 rounded-lg font-bold transition-all text-white border-2"
          style="border-color: #f97316; color: #f97316; background-color: rgba(249, 115, 22, 0.1);"
          @mouseenter="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.2)'"
          @mouseleave="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.1)'"
        >
          Cancelar
        </button>
        <button
          @click="guardarCambios"
          :disabled="hayErrores || cargando"
          class="flex-1 px-4 py-3 rounded-lg font-bold transition-all text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style="background: linear-gradient(135deg, #f97316 0%, #d97706 100%);"
          @mouseenter="!hayErrores && !cargando && ($event.target.style.opacity = '0.9')"
          @mouseleave="!hayErrores && !cargando && ($event.target.style.opacity = '1')"
          :title="hayErrores ? 'Corrige los errores antes de guardar' : ''"
        >
          <span class="material-symbols-outlined text-sm">{{ cargando ? 'refresh' : 'save' }}</span>
          {{ cargando ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>

    <!-- Modal de confirmación (dentro del overlay para que aparezca al frente) -->
    <ConfirmDialog
      :mostrar="mostrarConfirmacion"
      titulo="Confirmar cambios"
      :mensaje="`¿Guardar los cambios en este ticket?`"
      :mostrarComparacion="true"
      :comparacion="comparacionCambios"
      mensajeAlerta="Una vez guardado, no se puede deshacer. Asegúrate de que todo esté correcto."
      @confirmar="guardarSinConfirmacion"
      @cancelar="mostrarConfirmacion = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { toastService } from '../services/toastService'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const mostrarModal = ref(true)
const mostrarConfirmacion = ref(false)
const itemsEditables = ref([])
const descuentoEditado = ref(0)
const itemsOriginales = ref([])
const descuentoOriginal = ref(0)
const cargando = ref(false)

// Inicializar datos
watch(
  () => props.ticket,
  (newTicket) => {
    if (newTicket) {
      const itemsProcesados = (newTicket.items || []).map(item => ({
        ...item,
        cantidad: Number(item.cantidad) || 1,
        precio: Number(item.precio) || 0
      }))
      itemsEditables.value = itemsProcesados
      itemsOriginales.value = JSON.parse(JSON.stringify(itemsProcesados))
      descuentoEditado.value = Number(newTicket.descuento) || 0
      descuentoOriginal.value = Number(newTicket.descuento) || 0
    }
  },
  { immediate: true }
)

// Computados
const subtotalCalculado = computed(() => {
  return itemsEditables.value.reduce((sum, item) => {
    return sum + ((item.precio || 0) * (item.cantidad || 1))
  }, 0)
})

const totalCalculado = computed(() => {
  return subtotalCalculado.value - descuentoEditado.value
})

const ticketId = computed(() => {
  return props.ticket?.id?.slice(-6) || 'N/A'
})

// Validación
const hayErrores = computed(() => {
  // Verificar items vacíos o con precios negativos
  return itemsEditables.value.some(item =>
    !item.nombre ||
    item.nombre.trim() === '' ||
    item.cantidad <= 0 ||
    item.precio < 0
  )
})

const mensajeError = computed(() => {
  const itemConError = itemsEditables.value.find(item =>
    !item.nombre || item.nombre.trim() === ''
  )
  if (itemConError) return 'Todos los artículos deben tener un nombre'

  const itemConCantidadInvalida = itemsEditables.value.find(item => item.cantidad <= 0)
  if (itemConCantidadInvalida) return 'La cantidad debe ser mayor que 0'

  const itemConPrecioNegativo = itemsEditables.value.find(item => item.precio < 0)
  if (itemConPrecioNegativo) return 'El precio no puede ser negativo'

  return ''
})

// Comparación de cambios
const comparacionCambios = computed(() => {
  const subtotalOriginal = (itemsOriginales.value || []).reduce((sum, item) => {
    return sum + ((Number(item.precio) || 0) * (Number(item.cantidad) || 1))
  }, 0)

  const descOriginal = Number(descuentoOriginal.value) || 0
  const descEditado = Number(descuentoEditado.value) || 0

  return [
    {
      label: 'Subtotal',
      antes: '€' + subtotalOriginal.toFixed(2),
      despues: '€' + subtotalCalculado.value.toFixed(2)
    },
    {
      label: 'Descuento',
      antes: '€' + descOriginal.toFixed(2),
      despues: '€' + descEditado.toFixed(2)
    },
    {
      label: 'Total',
      antes: '€' + (subtotalOriginal - descOriginal).toFixed(2),
      despues: '€' + totalCalculado.value.toFixed(2)
    }
  ]
})

// Métodos
const eliminarItem = (idx) => {
  itemsEditables.value.splice(idx, 1)
}

const agregarItem = () => {
  console.log('Agregando item')
  itemsEditables.value.push({
    nombre: '',
    cantidad: 1,
    precio: 0
  })
}

const debugInfo = () => {
  console.log('=== DEBUG INFO ===')
  console.log('hayErrores:', hayErrores.value)
  console.log('mensajeError:', mensajeError.value)
  console.log('itemsEditables:', itemsEditables.value)
  console.log('descuentoEditado:', descuentoEditado.value, typeof descuentoEditado.value)
  console.log('totalCalculado:', totalCalculado.value)
}

const cerrarModal = () => {
  mostrarModal.value = false
  emit('close')
}

const guardarCambios = () => {
  console.log('guardarCambios() llamado')
  debugInfo()

  // Validar antes de mostrar confirmación
  if (hayErrores.value) {
    console.log('Hay errores, mostrando toast')
    toastService.error('❌ ' + mensajeError.value)
    return
  }

  console.log('Sin errores, mostrando modal de confirmación')
  // Mostrar modal de confirmación
  mostrarConfirmacion.value = true
}

const guardarSinConfirmacion = async () => {
  cargando.value = true
  try {
    // Calcular nuevos valores
    const subtotal = subtotalCalculado.value
    const descuento = descuentoEditado.value
    const total = totalCalculado.value

    // Emitir evento con datos actualizados
    emit('save', {
      items: itemsEditables.value,
      subtotal,
      descuento,
      total
    })

    cerrarModal()
    toastService.success('✅ Cambios guardados correctamente')
  } catch (e) {
    toastService.error('❌ Error al guardar: ' + e.message)
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>

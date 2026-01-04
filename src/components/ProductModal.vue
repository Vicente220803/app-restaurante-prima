<template>
  <!-- Overlay -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      @click="closeModal"
    >
      <!-- Modal -->
      <div
        class="w-full max-w-md bg-white rounded-t-3xl shadow-2xl transform transition-all duration-300 ease-out"
        :class="{ 'translate-y-0': isOpen, 'translate-y-full': !isOpen }"
        @click.stop
      >
        <!-- Header con imagen -->
        <div class="relative">
          <div class="aspect-square rounded-t-3xl overflow-hidden bg-neutral-100 flex items-center justify-center">
            <IconChefHat class="w-24 h-24 text-neutral-300" />
          </div>

          <!-- Botón cerrar -->
          <button
            @click="closeModal"
            class="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          >
            <IconX class="w-5 h-5 text-neutral-700" />
          </button>

          <!-- Badge de categoría -->
          <div class="absolute top-4 left-4">
            <span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-neutral-700">
              {{ producto.categoria }}
            </span>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 pb-24">
          <!-- Información básica -->
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-neutral-900 mb-2">{{ producto.nombre }}</h2>
            <p class="text-neutral-600 text-sm leading-relaxed">{{ producto.descripcion }}</p>
            <div class="flex items-center justify-between mt-4">
              <span class="text-2xl font-bold text-primary-600">{{ precioTotal.toFixed(2) }}€</span>
            </div>
          </div>

          <!-- Grupos de opciones -->
          <div v-if="opciones.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold text-neutral-900 mb-4">Personalizar</h3>
            <div class="space-y-4">
              <div v-for="grupo in opciones" :key="grupo.id" class="bg-neutral-50 rounded-2xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <span class="font-medium text-neutral-900">{{ grupo.nombre }}</span>
                  <span v-if="grupo.es_obligatorio" class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    Obligatorio
                  </span>
                </div>

                <!-- Opciones del grupo -->
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="opcion in grupo.opciones"
                    :key="opcion.id"
                    @click="seleccionarOpcion(grupo.id, opcion)"
                    :class="[
                      'py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 text-left',
                      opcionSeleccionada[grupo.id]?.id === opcion.id
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                    ]"
                  >
                    <div class="flex justify-between items-center">
                      <span>{{ opcion.nombre }}</span>
                      <span v-if="opcion.precio_adicional > 0" class="text-xs">
                        +{{ opcion.precio_adicional }}€
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Cantidad -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-neutral-900 mb-4">Cantidad</h3>
            <div class="flex items-center justify-center space-x-4">
              <button
                @click="disminuirCantidad"
                class="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center transition-colors"
              >
                <IconMinus class="w-5 h-5 text-neutral-700" />
              </button>
              <span class="text-xl font-bold text-neutral-900 min-w-[3rem] text-center">{{ cantidad }}</span>
              <button
                @click="aumentarCantidad"
                class="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center transition-colors"
              >
                <IconPlus class="w-5 h-5 text-neutral-700" />
              </button>
            </div>
          </div>
        </div>

        <!-- Botón de agregar (fixed bottom) -->
        <div class="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-neutral-100">
          <button
            @click="agregarAlCarrito"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 px-6 rounded-3xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Añadir al pedido • {{ (precioTotal * cantidad).toFixed(2) }}€
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCarritoStore } from '../store/carrito'

const props = defineProps({
  producto: {
    type: Object,
    default: null
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'addToCart'])

const carritoStore = useCarritoStore()
const cantidad = ref(1)
const opcionSeleccionada = ref({})

const opciones = computed(() => {
  return props.producto?.grupos_opciones || []
})

const precioTotal = computed(() => {
  let precio = props.producto?.precio_base || 0

  // Sumar precios adicionales de opciones seleccionadas
  Object.values(opcionSeleccionada.value).forEach(opcion => {
    if (opcion && opcion.precio_adicional) {
      precio += opcion.precio_adicional
    }
  })

  return precio
})

const seleccionarOpcion = (grupoId, opcion) => {
  opcionSeleccionada.value[grupoId] = opcion
}

const aumentarCantidad = () => {
  cantidad.value++
}

const disminuirCantidad = () => {
  if (cantidad.value > 1) {
    cantidad.value--
  }
}

const agregarAlCarrito = () => {
  const itemPersonalizado = {
    ...props.producto,
    cantidad: cantidad.value,
    precio_unitario: precioTotal.value,
    opciones_seleccionadas: opcionSeleccionada.value,
    precio_total: precioTotal.value * cantidad.value
  }

  emit('addToCart', itemPersonalizado)
  closeModal()
}

const closeModal = () => {
  emit('close')
  // Reset state
  cantidad.value = 1
  opcionSeleccionada.value = {}
}

watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    closeModal()
  }
})
</script>
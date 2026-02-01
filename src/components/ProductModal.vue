<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../supabase'
import { useCartStore } from '../store/cart'

const props = defineProps(['product', 'isOpen'])
const emit = defineEmits(['close'])

const cartStore = useCartStore()
const grupos = ref([])
const selecciones = ref({})
const extrasSeleccionados = ref({})
const loading = ref(true)
const cantidad = ref(1)
const instrucciones = ref('')

// Detectar si es pizza por el nombre de la categoría
const esPizza = computed(() => {
  const categoria = props.product?.categorias?.nombre || props.product?.categoria_nombre || ''
  return categoria.toLowerCase().includes('pizza')
})

// Precio total calculado
const precioTotal = computed(() => {
  let total = props.product?.precio_base || 0

  // Sumar opciones de tamaño/obligatorias
  grupos.value.forEach(g => {
    if (g.es_obligatorio) {
      const opcionId = selecciones.value[g.id]
      const opcion = g.opciones?.find(o => o.id === opcionId)
      if (opcion) {
        total += opcion.precio_adicional || 0
      }
    }
  })

  // Sumar extras
  grupos.value.forEach(g => {
    if (!g.es_obligatorio) {
      g.opciones?.forEach(opcion => {
        if (extrasSeleccionados.value[opcion.id]) {
          total += opcion.precio_adicional || 0
        }
      })
    }
  })

  return total * cantidad.value
})

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.product) {
    await cargarOpciones()
  }
})

onMounted(async () => {
  if (props.product && props.isOpen) {
    await cargarOpciones()
  }
})

async function cargarOpciones() {
  loading.value = true
  selecciones.value = {}
  extrasSeleccionados.value = {}
  cantidad.value = 1
  instrucciones.value = ''

  try {
    const { data, error } = await supabase
      .from('grupos_opciones')
      .select('*, opciones(*)')
      .eq('producto_id', props.product.id)
      .order('nombre', { ascending: true })

    if (!error && data) {
      // Ordenar opciones dentro de cada grupo por precio_adicional (más barato primero)
      data.forEach(g => {
        if (g.opciones) {
          g.opciones.sort((a, b) => (a.precio_adicional || 0) - (b.precio_adicional || 0))
        }
      })
      // Ordenar grupos: Tamaño primero, Base segundo, luego el resto
      const ordenGrupos = { 'Tamaño': 1, 'Base': 2 }
      data.sort((a, b) => {
        const ordenA = ordenGrupos[a.nombre] || (a.es_obligatorio ? 10 : 100)
        const ordenB = ordenGrupos[b.nombre] || (b.es_obligatorio ? 10 : 100)
        return ordenA - ordenB
      })
      grupos.value = data
      // Inicializar selecciones obligatorias con la primera opción (la más barata)
      data.forEach(g => {
        if (g.es_obligatorio && g.opciones?.length > 0) {
          selecciones.value[g.id] = g.opciones[0].id
        }
      })
    } else {
      grupos.value = []
    }
  } catch (e) {
    console.error('Error cargando opciones:', e)
    grupos.value = []
  } finally {
    loading.value = false
  }
}

function incrementarCantidad() {
  cantidad.value++
}

function decrementarCantidad() {
  if (cantidad.value > 1) {
    cantidad.value--
  }
}

function handleAdd() {
  let precioExtra = 0
  const opcionesElegidas = []

  // Recoger opciones obligatorias (tamaño)
  grupos.value.forEach(g => {
    if (g.es_obligatorio) {
      const opcionId = selecciones.value[g.id]
      const opcion = g.opciones?.find(o => o.id === opcionId)
      if (opcion) {
        precioExtra += opcion.precio_adicional || 0
        opcionesElegidas.push({ nombre: opcion.nombre, precio: opcion.precio_adicional })
      }
    }
  })

  // Recoger extras
  grupos.value.forEach(g => {
    if (!g.es_obligatorio) {
      g.opciones?.forEach(opcion => {
        if (extrasSeleccionados.value[opcion.id]) {
          precioExtra += opcion.precio_adicional || 0
          opcionesElegidas.push({ nombre: opcion.nombre, precio: opcion.precio_adicional })
        }
      })
    }
  })

  // Obtener categoría del producto
  const categoria = props.product?.categorias?.nombre || props.product?.categoria_nombre || ''
  const grupo = props.product?.categorias?.grupo || ''

  // Añadir al carrito
  for (let i = 0; i < cantidad.value; i++) {
    cartStore.addToCart({
      id: props.product.id,
      nombre: props.product.nombre,
      imagen: props.product.imagen_url || props.product.imagen || null,
      precioBase: props.product.precio_base,
      precioTotal: props.product.precio_base + precioExtra,
      opcionesIds: { ...selecciones.value },
      opcionesResumen: opcionesElegidas,
      instrucciones: instrucciones.value,
      categoria: categoria,
      grupo: grupo
    })
  }

  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end justify-center">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal -->
        <div class="relative bg-[#fcfaf8] w-full max-w-[640px] h-[92vh] rounded-t-3xl shadow-2xl flex flex-col animate-slide-up">
          <!-- Close Button -->
          <button
            @click="$emit('close')"
            class="absolute top-4 right-4 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2 transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <!-- Hero Image -->
            <div class="relative h-72 w-full">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <div
                class="h-full w-full bg-cover bg-center bg-gray-200"
                :style="product?.imagen_url ? `background-image: url('${product.imagen_url}')` : ''"
              >
                <div v-if="!product?.imagen_url" class="w-full h-full flex items-center justify-center">
                  <span class="material-symbols-outlined text-8xl text-gray-400">restaurant</span>
                </div>
              </div>
              <div class="absolute bottom-6 left-6 right-6 z-20">
                <h2 class="text-white text-3xl font-bold tracking-tight">{{ product?.nombre }}</h2>
                <p class="text-white/90 text-sm mt-2 line-clamp-2">{{ product?.descripcion }}</p>
              </div>
            </div>

            <div class="px-6 pb-32">
              <!-- Loading -->
              <div v-if="loading" class="py-12 text-center">
                <div class="animate-spin w-8 h-8 border-4 border-[#e27246] border-t-transparent rounded-full mx-auto"></div>
                <p class="mt-4 text-gray-500">Cargando opciones...</p>
              </div>

              <template v-else>
                <!-- Grupos obligatorios (Tamaño) -->
                <section v-for="grupo in grupos.filter(g => g.es_obligatorio)" :key="grupo.id" class="mt-8">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold tracking-tight text-[#1a120e]">{{ grupo.nombre }}</h3>
                    <span class="bg-[#e27246]/10 text-[#e27246] text-[10px] font-bold uppercase px-2 py-1 rounded">Obligatorio</span>
                  </div>
                  <div class="flex flex-col gap-3">
                    <label
                      v-for="opcion in grupo.opciones"
                      :key="opcion.id"
                      class="group flex items-center justify-between p-4 rounded-xl border-2 border-[#e6d7d1] hover:border-[#e27246]/50 cursor-pointer transition-all"
                      :class="selecciones[grupo.id] === opcion.id ? 'border-[#e27246] bg-[#e27246]/5' : ''"
                    >
                      <div class="flex flex-col">
                        <span class="font-semibold text-base" :class="selecciones[grupo.id] === opcion.id ? 'text-[#e27246]' : 'text-[#1a120e]'">
                          {{ opcion.nombre }}
                        </span>
                        <span v-if="opcion.descripcion" class="text-sm text-[#946451]">{{ opcion.descripcion }}</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="font-bold text-[#e27246]">
                          {{ opcion.precio_adicional > 0 ? `+${opcion.precio_adicional.toFixed(2)}€` : 'Incluido' }}
                        </span>
                        <input
                          type="radio"
                          :name="`grupo-${grupo.id}`"
                          v-model="selecciones[grupo.id]"
                          :value="opcion.id"
                          class="w-6 h-6 text-[#e27246] border-[#e6d7d1] focus:ring-[#e27246] focus:ring-offset-0 bg-transparent"
                        />
                      </div>
                    </label>
                  </div>
                </section>

                <!-- Grupos opcionales (Extras) -->
                <section v-for="grupo in grupos.filter(g => !g.es_obligatorio)" :key="grupo.id" class="mt-10">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold tracking-tight text-[#1a120e]">{{ grupo.nombre }}</h3>
                    <span class="text-xs text-[#946451] font-medium">Opcional</span>
                  </div>
                  <div class="flex flex-col gap-1">
                    <label
                      v-for="opcion in grupo.opciones"
                      :key="opcion.id"
                      class="flex items-center justify-between py-3 px-1 border-b border-[#f2ebe8] cursor-pointer group"
                    >
                      <div class="flex items-center gap-4">
                        <input
                          type="checkbox"
                          v-model="extrasSeleccionados[opcion.id]"
                          class="w-6 h-6 rounded border-[#e6d7d1] text-[#e27246] focus:ring-[#e27246] focus:ring-offset-0 bg-transparent"
                        />
                        <span class="font-medium group-hover:text-[#e27246] transition-colors">{{ opcion.nombre }}</span>
                      </div>
                      <span class="font-bold text-[#6BBF5B]">+{{ opcion.precio_adicional?.toFixed(2) }}€</span>
                    </label>
                  </div>
                </section>

                <!-- Instrucciones Especiales -->
                <section class="mt-10">
                  <h3 class="text-xl font-bold tracking-tight text-[#1a120e] mb-4">Instrucciones Especiales</h3>
                  <textarea
                    v-model="instrucciones"
                    class="w-full h-24 p-4 rounded-xl border-2 border-[#e6d7d1] bg-white focus:border-[#e27246] focus:ring-0 text-sm placeholder:text-[#946451]/50 resize-none"
                    placeholder="Ej. Sin cebolla, bien cocida, sin sal..."
                  ></textarea>
                </section>

                <!-- Mensaje si no hay opciones -->
                <div v-if="grupos.length === 0" class="mt-8 text-center py-8">
                  <span class="material-symbols-outlined text-4xl text-gray-300">tune</span>
                  <p class="mt-2 text-gray-500">Este producto no tiene opciones de personalizacion</p>
                </div>
              </template>
            </div>
          </div>

          <!-- Sticky Footer -->
          <div class="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-[#f2ebe8] px-6 py-5 flex items-center justify-between gap-4 z-40">
            <!-- Quantity Counter -->
            <div class="flex items-center bg-[#f2ebe8] rounded-xl p-1">
              <button
                @click="decrementarCantidad"
                class="w-10 h-10 flex items-center justify-center text-[#1a120e] hover:bg-white/50 rounded-lg transition-colors"
              >
                <span class="material-symbols-outlined font-bold">remove</span>
              </button>
              <span class="w-10 text-center font-bold text-lg">{{ cantidad }}</span>
              <button
                @click="incrementarCantidad"
                class="w-10 h-10 flex items-center justify-center text-[#e27246] hover:bg-white/50 rounded-lg transition-colors"
              >
                <span class="material-symbols-outlined font-bold">add</span>
              </button>
            </div>

            <!-- Add Button -->
            <button
              @click="handleAdd"
              class="flex-1 bg-[#e27246] hover:bg-[#e27246]/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#e27246]/20 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
            >
              <span>Añadir al pedido</span>
              <span class="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
              <span>{{ precioTotal.toFixed(2) }}€</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e6d7d1;
  border-radius: 10px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../store/cart'
import { supabase } from '../supabase'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const restaurantSlug = route.params.restaurantSlug || 'la-toscana'
const tableNumber = route.query.table || '1'
const enviandoPedido = ref(false)

// Calcular total (sin IVA separado)
const total = computed(() => cartStore.totalCart)

const goBack = () => {
  router.push(`/${restaurantSlug}/menu?table=${tableNumber}`)
}

const removeItem = (cartItemId) => {
  cartStore.removeFromCart(cartItemId)
}

const updateQuantity = (cartItemId, delta) => {
  cartStore.updateQuantity(cartItemId, delta)
}

const pedidoConfirmado = ref(false)
const errorPedido = ref(null)

const confirmarPedido = async () => {
  if (enviandoPedido.value || cartStore.items.length === 0) return

  enviandoPedido.value = true
  errorPedido.value = null

  try {
    // Preparar los items para guardar en Supabase
    const ahora = new Date().toISOString()
    const itemsParaGuardar = cartStore.items.map(item => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precioTotal,
      opciones: item.opcionesResumen?.map(o => o.nombre).join(', ') || null,
      instrucciones: item.instrucciones || null,
      categoria: item.categoria || null,
      grupo: item.grupo || null,
      added_at: ahora
    }))

    // Guardar el pedido en Supabase
    const { error } = await supabase
      .from('pedidos')
      .insert({
        mesa: tableNumber,
        items: itemsParaGuardar,
        total: cartStore.totalCart,
        estado: 'pendiente'
      })

    if (error) throw error

    // Mostrar confirmación
    pedidoConfirmado.value = true

    // Limpiar carrito después de 4 segundos y volver al menú
    setTimeout(() => {
      cartStore.clearCart()
      router.push(`/${restaurantSlug}/menu?table=${tableNumber}`)
    }, 4000)

  } catch (e) {
    console.error('Error guardando pedido:', e)
    errorPedido.value = 'Error al enviar el pedido. Inténtalo de nuevo.'
    enviandoPedido.value = false
  }
}
</script>

<template>
  <div class="bg-[#fafaf9] dark:bg-[#21242c] text-[#1a120e] dark:text-gray-100 min-h-screen font-display">

    <!-- Overlay de confirmación -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="pedidoConfirmado" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div class="bg-white dark:bg-[#2d313a] rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
            <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="material-symbols-outlined text-5xl text-green-500">check_circle</span>
            </div>
            <h2 class="text-3xl font-black mb-3">¡Pedido Confirmado!</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-2">Tu pedido ha sido enviado a cocina</p>
            <p class="text-sm text-gray-400">Mesa {{ tableNumber }}</p>
            <div class="mt-6 flex items-center justify-center gap-2 text-[#e27246]">
              <span class="material-symbols-outlined animate-spin">progress_activity</span>
              <span class="text-sm font-medium">Volviendo al menú...</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8">
      <!-- Top Navigation -->
      <header class="flex items-center justify-between mb-8 md:mb-10">
        <div class="flex items-center gap-3">
          <div class="bg-[#e27246] p-2 rounded-lg text-white">
            <span class="material-symbols-outlined block">restaurant_menu</span>
          </div>
          <h1 class="text-xl font-extrabold tracking-tight">La Toscana</h1>
        </div>
        <button
          @click="goBack"
          class="flex items-center gap-2 text-sm font-semibold text-[#e27246] hover:opacity-80 transition-opacity"
        >
          <span class="material-symbols-outlined text-lg">arrow_back</span>
          Volver al Menú
        </button>
      </header>

      <!-- Main Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <!-- Left Column: Order Items -->
        <div class="lg:col-span-8 flex flex-col gap-6">
          <div class="flex flex-col gap-1">
            <h2 class="text-3xl md:text-4xl font-black tracking-tight">Tu Pedido</h2>
            <p class="text-[#946451] dark:text-gray-400 font-medium">Mesa {{ tableNumber }} - Revisa tu selección</p>
          </div>

          <!-- Empty Cart State -->
          <div v-if="cartStore.items.length === 0" class="bg-white dark:bg-[#2d313a] rounded-xl shadow-sm border border-[#f2ebe8] dark:border-gray-700 p-12 text-center">
            <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">shopping_cart</span>
            <h3 class="text-xl font-bold mb-2">Tu carrito está vacío</h3>
            <p class="text-gray-500 mb-6">Añade algunos platos deliciosos del menú</p>
            <button
              @click="goBack"
              class="bg-[#e27246] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#e27246]/90 transition-colors"
            >
              Ver Menú
            </button>
          </div>

          <!-- Order List Card -->
          <div v-else class="bg-white dark:bg-[#2d313a] rounded-xl shadow-sm border border-[#f2ebe8] dark:border-gray-700 overflow-hidden">
            <div class="p-4 md:p-6 border-b border-[#f2ebe8] dark:border-gray-700 flex justify-between items-center">
              <h3 class="font-bold text-lg">Productos en tu pedido</h3>
              <span class="bg-[#e27246]/10 text-[#e27246] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {{ cartStore.countItems }} Items
              </span>
            </div>

            <div class="divide-y divide-[#f2ebe8] dark:divide-gray-700">
              <!-- Cart Items -->
              <div
                v-for="item in cartStore.items"
                :key="item.cartItemId"
                class="p-4 md:p-6 flex items-center justify-between group"
              >
                <div class="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
                  <div
                    class="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-xl shrink-0 bg-cover bg-center"
                    :style="item.imagen ? `background-image: url('${item.imagen}')` : ''"
                  >
                    <div v-if="!item.imagen" class="w-full h-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-3xl text-gray-300">restaurant</span>
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-base md:text-lg leading-tight group-hover:text-[#e27246] transition-colors truncate">
                      {{ item.nombre }}
                    </h4>
                    <p v-if="item.opcionesResumen?.length" class="text-sm text-[#946451] dark:text-gray-400 mt-1 italic truncate">
                      {{ item.opcionesResumen.map(o => o.nombre).join(', ') }}
                    </p>
                    <div class="flex gap-4 mt-2 md:mt-3">
                      <button
                        @click="removeItem(item.cartItemId)"
                        class="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span class="material-symbols-outlined text-sm">delete</span>
                        <span class="hidden sm:inline">QUITAR</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-end gap-2 md:gap-3 ml-4">
                  <span class="font-extrabold text-lg md:text-xl">{{ (item.precioTotal * item.cantidad).toFixed(2) }}€</span>
                  <div class="flex items-center gap-2 md:gap-3 bg-[#f7f5f3] dark:bg-[#21242c] p-1 rounded-full border border-[#f2ebe8] dark:border-gray-700">
                    <button
                      @click="updateQuantity(item.cartItemId, -1)"
                      class="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#2d313a] shadow-sm text-[#e27246] hover:bg-[#e27246] hover:text-white transition-all"
                    >
                      <span class="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span class="font-bold text-sm w-4 text-center">{{ item.cantidad }}</span>
                    <button
                      @click="updateQuantity(item.cartItemId, 1)"
                      class="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#2d313a] shadow-sm text-[#e27246] hover:bg-[#e27246] hover:text-white transition-all"
                    >
                      <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>

        <!-- Right Column: Summary & Payment -->
        <div class="lg:col-span-4 lg:sticky lg:top-8">
          <div v-if="cartStore.items.length > 0" class="bg-white dark:bg-[#2d313a] rounded-xl shadow-lg border border-[#f2ebe8] dark:border-gray-700 p-6 md:p-8 flex flex-col gap-5 md:gap-6">
            <h3 class="font-black text-xl md:text-2xl">Resumen</h3>

            <!-- Lista de artículos -->
            <div class="flex flex-col gap-2 max-h-48 overflow-y-auto">
              <div
                v-for="item in cartStore.items"
                :key="item.cartItemId"
                class="flex justify-between text-sm"
              >
                <span class="text-[#946451] dark:text-gray-400 truncate flex-1 mr-2">
                  {{ item.cantidad }}x {{ item.nombre }}
                </span>
                <span class="font-semibold whitespace-nowrap">{{ (item.precioTotal * item.cantidad).toFixed(2) }}€</span>
              </div>
            </div>

            <!-- Total -->
            <div class="flex justify-between items-center pt-4 border-t border-[#f2ebe8] dark:border-gray-700">
              <span class="text-lg font-bold">Total</span>
              <span class="text-2xl md:text-3xl font-black text-[#e27246]">{{ total.toFixed(2) }}€</span>
            </div>

            <!-- Error message -->
            <div v-if="errorPedido" class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl text-center">
              {{ errorPedido }}
            </div>

            <!-- Main CTA -->
            <button
              @click="confirmarPedido"
              :disabled="enviandoPedido"
              :class="[
                'w-full bg-gradient-to-br from-[#e27246] to-[#D06921] text-white rounded-xl py-4 md:py-5 flex items-center justify-center gap-3 shadow-xl shadow-[#e27246]/20 transition-all group',
                enviandoPedido ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
              ]"
            >
              <span v-if="enviandoPedido" class="material-symbols-outlined animate-spin">progress_activity</span>
              <span class="font-black text-base md:text-lg tracking-wide">
                {{ enviandoPedido ? 'ENVIANDO...' : 'CONFIRMAR PEDIDO' }}
              </span>
              <span v-if="!enviandoPedido" class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>

            <!-- Safety Guarantee -->
            <p class="text-[10px] text-center text-gray-400 font-medium uppercase tracking-[0.1em]">
              <span class="material-symbols-outlined text-xs align-middle mr-1">lock</span>
              Pago seguro en mesa
            </p>
          </div>

          <!-- Assistance Card -->
          <div class="mt-6 p-4 md:p-6 bg-[#e27246]/5 dark:bg-[#e27246]/10 rounded-xl border border-[#e27246]/10 flex items-center gap-4">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-[#2d313a] rounded-full flex items-center justify-center text-[#e27246] shadow-sm shrink-0">
              <span class="material-symbols-outlined">support_agent</span>
            </div>
            <div>
              <p class="font-bold text-sm">¿Necesitas ayuda?</p>
              <p class="text-xs text-[#e27246] font-bold">Llama al camarero</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.font-display {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Spinner animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

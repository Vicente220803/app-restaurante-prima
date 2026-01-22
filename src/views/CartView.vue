<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../store/cart'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const restaurantSlug = route.params.restaurantSlug || 'la-toscana'
const tableNumber = route.query.table || '1'

// Calcular totales
const subtotal = computed(() => cartStore.totalCart)
const tax = computed(() => subtotal.value * 0.10) // 10% IVA
const total = computed(() => subtotal.value + tax.value)

// Productos sugeridos (upselling)
const sugeridos = [
  { id: 's1', nombre: 'Pan de Ajo', precio: 3.50, imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXqeIErObYHVaRQFrJ-_Si0ErK58U_gviryKdWwxdnoSQXUUyFb4mAoXRbiRvQZXw8-5l7CMJfxV-gUiCbDJT_k-VQQZKEbFJjDs-7kxuxeNzJ6aVk3jqbl03dCcmI2xPE55TOgCZGTPEfgpgRpnZLm61UZenFeWJHBmfGvKWHEN3FyZQWsIybay7yZnnHD6cqxkKZxyZmhHW5JcVtvGVLSscNxTH7f6p8jcyI3MdfwaUfDjdS_78sX78rFJaGWMmrQDYCIKBO6Kfv' },
  { id: 's2', nombre: 'Refresco', precio: 2.50, imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuDbw7twzqiadtfUpntkzleVAWWtFsw2GdyeM-BeDiT2lzHBGzeIfaSg36QHDDqamplglwoBt-tQHhgJxo2APeMGZ94OixfSrvBKGXLPLRX0ZQHRVfHY9WyTXZDuVmxhbDNfapr4sDp843-nFxMr6NKsohXTP87-3u18kP05M4oB-IU13JzAJfu7u5rCiD94bcPOUO2D7cI8wt_8dToaPaNcFxNdoS94fsD1Gs-JuFCKHDG82TQSiF4Vm5wFBn4GGA2XKkyxaVnjdC' },
  { id: 's3', nombre: 'Salsa Picante', precio: 1.50, imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAr9Vjokp3GYnt8ZC2NypIJUQeTYO0o2b5sMeYBgrr-YvFDe1rMJLcXIdvllka0f3D95Gb33fPFtCHl4ZQEF3Az0-EsTgZ6HpGZj9Du-q9Tb-OOzMNmSkXyL8wL5HG2xGd_YH-knh0qCC710_MSl10lv0iBan4gMmUWTQN1EwQ1bKOuN6R0kpzWlVTRFDnLLGH5BFgpVd2bor8_swzsZOqpntAWUgly73NFhBD8ogtkcI9mFeYccWHsGWM7REWX3RwKZA9pDAGVE71m' },
  { id: 's4', nombre: 'Tiramisú', precio: 5.50, imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKpXAL86vemvyIRnegXUT2BJhGdj_fv9Ofg0DJkPv25evhsGIAOseN1X5aT3AeVQZKRfQy4pz0iasplV5hElalDYrZLQQBkXjyhX_T78VYwp_Kapvy61trmY9n8C8g68ILjqcuxrvLQrqte_uvD-wumvkdr8ZqfXYm4zOV06y9OA49-ktZ-HKt85gXTlfqsRb9PY59mOZdOBnokMKlDkdi69ij7WEZdREo6WnxaEs60S2-Z9PclghSCbHeOWQMQ9CXAKd7hZ5G0gaP' }
]

const goBack = () => {
  router.push(`/${restaurantSlug}/menu?table=${tableNumber}`)
}

const removeItem = (cartItemId) => {
  cartStore.removeFromCart(cartItemId)
}

const updateQuantity = (cartItemId, delta) => {
  cartStore.updateQuantity(cartItemId, delta)
}

const addSugerido = (item) => {
  cartStore.addToCart({
    id: item.id,
    nombre: item.nombre,
    precioBase: item.precio,
    precioTotal: item.precio,
    opcionesIds: {},
    opcionesResumen: []
  })
}

const confirmarPedido = () => {
  // TODO: Enviar pedido a Supabase
  alert('Pedido confirmado! (En desarrollo)')
}
</script>

<template>
  <div class="bg-[#fafaf9] dark:bg-[#21242c] text-[#1a120e] dark:text-gray-100 min-h-screen font-display">
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
                  <div class="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-3xl text-gray-300">restaurant</span>
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

          <!-- Upselling Carousel Section -->
          <div v-if="cartStore.items.length > 0" class="mt-2 md:mt-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg md:text-xl font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-[#e27246]">auto_awesome</span>
                Combina con:
              </h3>
            </div>

            <div class="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              <div
                v-for="item in sugeridos"
                :key="item.id"
                class="min-w-[160px] md:min-w-[200px] bg-white dark:bg-[#2d313a] rounded-xl p-3 shadow-sm border border-[#f2ebe8] dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div
                  class="w-full aspect-square bg-center bg-no-repeat bg-cover rounded-lg mb-3"
                  :style="`background-image: url('${item.imagen}')`"
                ></div>
                <h5 class="font-bold text-sm">{{ item.nombre }}</h5>
                <div class="flex items-center justify-between mt-2">
                  <span class="font-bold text-[#e27246]">{{ item.precio.toFixed(2) }}€</span>
                  <button
                    @click="addSugerido(item)"
                    class="w-8 h-8 bg-[#e27246]/10 text-[#e27246] rounded-full flex items-center justify-center hover:bg-[#e27246] hover:text-white transition-colors"
                  >
                    <span class="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Summary & Payment -->
        <div class="lg:col-span-4 lg:sticky lg:top-8">
          <div v-if="cartStore.items.length > 0" class="bg-white dark:bg-[#2d313a] rounded-xl shadow-lg border border-[#f2ebe8] dark:border-gray-700 p-6 md:p-8 flex flex-col gap-5 md:gap-6">
            <h3 class="font-black text-xl md:text-2xl">Resumen</h3>

            <div class="flex flex-col gap-3 md:gap-4">
              <div class="flex justify-between text-[#946451] dark:text-gray-400 font-medium">
                <span>Subtotal</span>
                <span>{{ subtotal.toFixed(2) }}€</span>
              </div>
              <div class="flex justify-between text-[#946451] dark:text-gray-400 font-medium border-b border-[#f2ebe8] dark:border-gray-700 pb-4">
                <span>IVA (10%)</span>
                <span>{{ tax.toFixed(2) }}€</span>
              </div>
              <div class="flex justify-between items-center pt-2">
                <span class="text-lg font-bold">Total</span>
                <span class="text-2xl md:text-3xl font-black">{{ total.toFixed(2) }}€</span>
              </div>
            </div>

            <!-- Main CTA -->
            <button
              @click="confirmarPedido"
              class="w-full bg-gradient-to-br from-[#e27246] to-[#D06921] text-white rounded-xl py-4 md:py-5 flex items-center justify-center gap-3 shadow-xl shadow-[#e27246]/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
              <span class="font-black text-base md:text-lg tracking-wide">CONFIRMAR PEDIDO</span>
              <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
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
</style>

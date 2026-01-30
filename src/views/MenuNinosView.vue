<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../store/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const restaurantSlug = route.params.restaurantSlug
const tableNumber = route.query.table || '1'

// Los 4 productos del menú infantil
const productosNinos = ref([
  {
    id: 'ninos-pizza',
    nombre: 'Pizza Infantil',
    emoji: '🍕',
    descripcion: 'Nuestra famosa pizza en forma de corazón con mucho queso y amor.',
    precio_base: 8.50,
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzR014-zUiyEUdf06-n3WQ7UBEyK_DpgVatHXlOrLRSerqBQeOMucR6wrq4B9n9w0Hu1dMUQBbUzbY5eyYTN0dkgUe-dju2-P1Sxm0ee_sytuZpDQiL4-btOEb94bvd4Zpo7fP8dR-XHEgK4rufkVoId59A2biRHyNsiEFX9CW9UQfIT10K15ZZIT8zespXd7ZplkdbnK-w1k1EtVcX23gXk2-LJ7AfrWK1CQWHmkZ4b7GTFLMsKzhxKyZfpa-a6LJPBZ5AxKYW-py',
    color: 'orange',
    disponible: true
  },
  {
    id: 'ninos-hamburguesa',
    nombre: 'Monster Burger',
    emoji: '🍔',
    descripcion: 'Una pequeña hamburguesa con ojos de queso. ¡No muerde!',
    precio_base: 9.50,
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8Jm3ZQY0KKqs9rL67kMGzYVyy9aa1NBK5tNPkCk5wxY1ky1Ycb0iFb8LGDex2gUqfrOQxtvC3qGy1LfpZytUrFfSdAy7gSn2PbjSrjnULvRF9VZ3eDtJRRUouQskrYGs5MT0OZlJVQKu9GuuOd-SQG3-Cmm2Sb1yayK4aJFiW_lwqljxyC1mzZfSMIT3o9u7sAvmxRZCcu-gQIywrLkSX1Rj7EVKW25rEQHgLNGHfisCzJyAiDTjuLKABZOFkUkwPU5e7FXy5t0w3',
    color: 'pink',
    disponible: true
  },
  {
    id: 'ninos-nuggets',
    nombre: 'Estrellas de Pollo',
    emoji: '⭐',
    descripcion: 'Crujientes trozos de pechuga de pollo en forma de estrellas espaciales.',
    precio_base: 9.00,
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApCJf9jFpRd2gkMpEFuPNANUzJbxFREDCPwI6_9Q8Nu7Cb99iVQAUl32ikFq-cQJoubStjFkPHrQx8mVuLqpbFlZv5D-KO-loFw-S_ExHM59gN4fSPW2uRY1_byE9llZsNiyOb7shNyigguUPXL0u3gkwgT6rAxZWrXMkveQSFrUYGSMTQdNVPp-sLDkm3bZVgMBxGkpxBnOSrdtKjaF-FukFSP_u1US-O5oPaeC3TGAqztfLiUplD3c_eQu51U4u2hfGB_X1DhyNc',
    color: 'yellow',
    disponible: true
  },
  {
    id: 'ninos-longanizas',
    nombre: 'Longanizas Divertidas',
    emoji: '🌭',
    descripcion: 'Deliciosas longanizas con patatas fritas en forma de caritas.',
    precio_base: 8.00,
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK1E84XYtyEGqRaV98tt-14epJId891CWkKKNAoYH7EpjgidiLYZWjTx8J1zeSRPiALGpZnilfO0mEPVZvTSK40Bqkqiq51y5-ubXrDOsRjeP_XLCooKB4NAwewvw5uK57CVUJCP4iKAOMEVtAcbjY5UxtSkEQLX1toIRsLzeyNyJATBVKS-wkHoTSThz6GD84mJVZ3ibJpzzTUcch6kcxK-GddMFRQQzrvl-td-QVqyzbFWLbGk0RSQT_D4xOlYQRsrKN0KzBz9g6',
    color: 'blue',
    disponible: true
  }
])

// Bebidas disponibles para el combo
const bebidas = ref([
  { id: 'agua', nombre: 'Agua', emoji: '💧', precio: 0 },
  { id: 'cocacola', nombre: 'Coca-Cola', emoji: '🥤', precio: 0 },
  { id: 'fanta-naranja', nombre: 'Fanta Naranja', emoji: '🍊', precio: 0 },
  { id: 'fanta-limon', nombre: 'Fanta Limón', emoji: '🍋', precio: 0 },
  { id: 'zumo-naranja', nombre: 'Zumo de Naranja', emoji: '🧃', precio: 0 },
  { id: 'zumo-manzana', nombre: 'Zumo de Manzana', emoji: '🍎', precio: 0 }
])

// Modal de bebidas
const showBebidaModal = ref(false)
const productoSeleccionado = ref(null)
const bebidaSeleccionada = ref(null)

const colorClasses = {
  orange: {
    border: 'border-orange-400',
    bg: 'bg-orange-400/20',
    bgHover: 'group-hover:bg-orange-400/40',
    hoverBorder: 'hover:border-orange-400'
  },
  pink: {
    border: 'border-pink-400',
    bg: 'bg-pink-400/20',
    bgHover: 'group-hover:bg-pink-400/40',
    hoverBorder: 'hover:border-pink-400'
  },
  yellow: {
    border: 'border-yellow-400',
    bg: 'bg-yellow-400/20',
    bgHover: 'group-hover:bg-yellow-400/40',
    hoverBorder: 'hover:border-yellow-400'
  },
  blue: {
    border: 'border-blue-400',
    bg: 'bg-blue-400/20',
    bgHover: 'group-hover:bg-blue-400/40',
    hoverBorder: 'hover:border-blue-400'
  }
}

const abrirModalBebida = (producto) => {
  productoSeleccionado.value = producto
  bebidaSeleccionada.value = null
  showBebidaModal.value = true
}

const seleccionarBebida = (bebida) => {
  bebidaSeleccionada.value = bebida
}

const confirmarCombo = () => {
  if (!productoSeleccionado.value || !bebidaSeleccionada.value) return

  const comboItem = {
    id: `${productoSeleccionado.value.id}-${bebidaSeleccionada.value.id}-${Date.now()}`,
    producto_id: productoSeleccionado.value.id,
    nombre: `${productoSeleccionado.value.nombre} ${productoSeleccionado.value.emoji}`,
    precio_base: productoSeleccionado.value.precio_base,
    cantidad: 1,
    opciones_seleccionadas: [
      {
        grupo: 'Bebida incluida',
        opcion: `${bebidaSeleccionada.value.nombre} ${bebidaSeleccionada.value.emoji}`,
        precio_adicional: 0
      }
    ],
    comentarios: '',
    precio_total: productoSeleccionado.value.precio_base
  }

  cartStore.addItem(comboItem)
  showBebidaModal.value = false
  productoSeleccionado.value = null
  bebidaSeleccionada.value = null
}

const volverAlMenu = () => {
  router.push({
    name: 'Menu',
    params: { restaurantSlug },
    query: { table: tableNumber }
  })
}

const irAlCarrito = () => {
  router.push({
    name: 'Cart',
    params: { restaurantSlug },
    query: { table: tableNumber }
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#222210] font-sans text-white">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#494922] sticky top-0 bg-[#222210] z-50">
      <div class="flex items-center gap-4">
        <button
          @click="volverAlMenu"
          class="size-10 flex items-center justify-center rounded-full bg-[#494922] text-white hover:bg-[#5a5a2a] transition-colors"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="flex items-center gap-3">
          <div class="size-8 flex items-center justify-center bg-[#f2f20d] text-black rounded-full">
            <span class="material-symbols-outlined">child_care</span>
          </div>
          <h1 class="text-xl font-extrabold">Menú <span class="text-[#f2f20d]">Niños</span></h1>
        </div>
      </div>

      <button
        @click="irAlCarrito"
        class="relative size-10 flex items-center justify-center rounded-full bg-[#494922] text-white hover:bg-[#f2f20d] hover:text-black transition-all"
      >
        <span class="material-symbols-outlined">shopping_cart</span>
        <span
          v-if="cartStore.itemCount > 0"
          class="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold size-5 rounded-full flex items-center justify-center"
        >
          {{ cartStore.itemCount }}
        </span>
      </button>
    </header>

    <!-- Hero Section -->
    <div class="px-6 md:px-10 pt-8 pb-6">
      <h2 class="text-3xl md:text-4xl font-black mb-2">¡Hola pequeño! 🎈</h2>
      <p class="text-[#cbcb90] text-lg">Elige tu comida favorita. ¡Incluye bebida gratis!</p>
    </div>

    <!-- Products Grid -->
    <main class="px-6 md:px-10 pb-32">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="producto in productosNinos"
          :key="producto.id"
          class="bg-[#2d2d18] rounded-3xl p-6 flex flex-col items-center group cursor-pointer border-2 border-transparent transition-all duration-300"
          :class="colorClasses[producto.color].hoverBorder"
        >
          <!-- Imagen circular -->
          <div class="relative w-full max-w-[250px] aspect-square mb-6">
            <div
              class="absolute inset-0 rounded-full blur-2xl transition-all"
              :class="[colorClasses[producto.color].bg, colorClasses[producto.color].bgHover]"
            ></div>
            <div
              class="relative z-10 w-full h-full rounded-full overflow-hidden border-4 shadow-xl"
              :class="colorClasses[producto.color].border"
            >
              <img
                :src="producto.imagen"
                :alt="producto.nombre"
                class="w-full h-full object-cover"
              />
            </div>
          </div>

          <!-- Info del producto -->
          <div class="text-center w-full">
            <h3 class="text-2xl font-black mb-2">{{ producto.nombre }} {{ producto.emoji }}</h3>
            <p class="text-[#cbcb90] text-sm mb-4 line-clamp-2">{{ producto.descripcion }}</p>

            <div class="flex items-center justify-between max-w-[220px] mx-auto">
              <span class="text-[#f2f20d] text-2xl font-black">{{ producto.precio_base.toFixed(2) }}€</span>
              <button
                @click="abrirModalBebida(producto)"
                class="bg-[#f2f20d] text-black size-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold"
              >
                <span class="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Floating Cart Bar -->
    <div
      v-if="cartStore.itemCount > 0"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-40"
    >
      <div class="flex items-center gap-3">
        <span class="bg-pink-500 text-white text-sm font-bold size-8 rounded-full flex items-center justify-center">
          {{ cartStore.itemCount }}
        </span>
        <span class="font-bold">en tu bolsa</span>
      </div>
      <div class="w-px h-6 bg-black/10"></div>
      <button
        @click="irAlCarrito"
        class="bg-[#f2f20d] text-black font-extrabold px-5 py-2 rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <span>Ver Pedido</span>
        <span class="material-symbols-outlined text-sm">arrow_forward_ios</span>
      </button>
    </div>

    <!-- Modal de selección de bebida -->
    <Teleport to="body">
      <div
        v-if="showBebidaModal"
        class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        @click.self="showBebidaModal = false"
      >
        <div class="bg-[#2d2d18] rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <!-- Header del modal -->
          <div class="p-6 border-b border-[#494922]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-2xl font-black">Elige tu bebida 🥤</h3>
              <button
                @click="showBebidaModal = false"
                class="size-10 rounded-full bg-[#494922] flex items-center justify-center hover:bg-[#5a5a2a] transition-colors"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <p class="text-[#cbcb90]">
              Con tu <span class="text-[#f2f20d] font-bold">{{ productoSeleccionado?.nombre }}</span> incluye una bebida gratis
            </p>
          </div>

          <!-- Lista de bebidas -->
          <div class="p-6 space-y-3">
            <button
              v-for="bebida in bebidas"
              :key="bebida.id"
              @click="seleccionarBebida(bebida)"
              class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all"
              :class="bebidaSeleccionada?.id === bebida.id
                ? 'border-[#f2f20d] bg-[#f2f20d]/10'
                : 'border-[#494922] hover:border-[#5a5a2a] bg-[#222210]'"
            >
              <span class="text-3xl">{{ bebida.emoji }}</span>
              <span class="font-bold text-lg flex-1 text-left">{{ bebida.nombre }}</span>
              <span
                v-if="bebidaSeleccionada?.id === bebida.id"
                class="size-6 rounded-full bg-[#f2f20d] flex items-center justify-center"
              >
                <span class="material-symbols-outlined text-black text-sm">check</span>
              </span>
            </button>
          </div>

          <!-- Footer con botón de confirmar -->
          <div class="p-6 border-t border-[#494922]">
            <button
              @click="confirmarCombo"
              :disabled="!bebidaSeleccionada"
              class="w-full py-4 rounded-full font-extrabold text-lg transition-all flex items-center justify-center gap-2"
              :class="bebidaSeleccionada
                ? 'bg-[#f2f20d] text-black hover:scale-[1.02]'
                : 'bg-[#494922] text-[#cbcb90] cursor-not-allowed'"
            >
              <span class="material-symbols-outlined">add_shopping_cart</span>
              <span>Añadir al pedido - {{ productoSeleccionado?.precio_base.toFixed(2) }}€</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

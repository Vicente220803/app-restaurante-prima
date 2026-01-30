<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useCartStore } from '../store/cart'
import ProductModal from '../components/ProductModal.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const restaurantSlug = route.params.restaurantSlug
const tableNumber = route.query.table || '1'

// Modal para productos
const isModalOpen = ref(false)
const selectedProduct = ref(null)

// Platos especiales del chef (destacados en el carrusel)
const platosDestacados = ref([
  {
    id: 'chef-truffle-pizza',
    nombre: 'Pizza Trufa Negra',
    descripcion: 'Setas silvestres de temporada, trufa negra recién rallada, fior di latte y un toque de miel orgánica.',
    precio_base: 28.00,
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-h1UhfwblNo6LdXt9SIWceLxiDr10j9FgAm4ZyqfOiMEGlq2ojMEG94XbBzsajSRqEhMe9xHozzXQvIisZlC2EJkKN02j9zga6iwT8tr4pC_VFUCfU50kfnkKzgc-lT9GWynNWKWATrJ_qJzGY0qVO5xNoaOkT69RgTvgJ3BUZtqYaluTzCCFmp4FVjaCCiFtUyK9ysl_xH4eU9PGcKq4O-ETzemjClUlaicMsXaFDn9rgfmX_qn2FBrq9QkBi6zOt-PwwfnDxgb7',
    badge: "Chef's Pick",
    badgeIcon: 'star',
    badgeColor: 'text-primary',
    disponible: true
  },
  {
    id: 'chef-ribeye',
    nombre: 'Chuletón con Tuétano',
    descripcion: 'Cortes madurados 45 días, servidos con escamas de sal marina, tuétano asado y reducción de vino tinto.',
    precio_base: 45.00,
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxdpaCrCQgDAt8aKinVCjn7r4lYoMz5SHyKk8aoaIcyjM5_--whsmReBy1W2_ik7Seo4t2yCmpjdCISz6-n4l8ucTP9VMVzfJkT-Y2dSF_JS25bw5_ujJI-q9RVqEbxzim-iezg7vyAjECdXW3q49BDl_RH40QQoERwPNamW0NkeUSQ5yxry2d1p3VhnxVSDxdUa6bw7xdGM6jQLkA_IXbmDCIZw_npI-X6_3HwjnYhjwb5Nm0BG-0qbT3xH22XSt8u-yN26VNNvN7',
    badge: 'Disponibilidad Limitada',
    badgeIcon: 'timer',
    badgeColor: 'text-emerald-500',
    disponible: true
  }
])

// Platos trending
const platosTrending = ref([
  {
    id: 'chef-vodka-pasta',
    nombre: 'Pasta Vodka Picante',
    descripcion: 'Rigatoni artesanal, crema de tomate sedosa, chile calabrés y parmesano añejo.',
    precio_base: 22.00,
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAdaQcQ1zRW-wOU1_iBMER2BHvLJEEJN38PYN2blchdI0xqvKgsJrJkGtVlTe9RZOUYQlpBD45u7Uk4aa9VBsLiqKyWXBtHY3qBWuU-Hyg-M2VlIzWFrCoIgq8VuUGbFZuEZ52dUXk-HtehZmiWFTub3Xkg63ULE5crWlcxiQGOtnJcR43U2c01sx6GktSzuUMHWMGeNLRFmSTdKZZHO09Zandm26L6-6_-31IXsIpGJtyO3bSVjPFY6KZXypduri0QKbd_lysiRfO',
    badge: '80+ Pedidos Hoy',
    badgeColor: 'bg-emerald-500',
    tagIcon: 'local_fire_department',
    tagText: 'Elección Popular',
    disponible: true
  },
  {
    id: 'chef-brussels',
    nombre: 'Coles de Bruselas Crujientes',
    descripcion: 'Glaseado de miel balsámico, nueces tostadas y trocitos de panceta crujiente.',
    precio_base: 14.00,
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO1vm4lRjVWEcsYksFiF839PlINBRpJSQYR_cA4rPTJasdduYTyHNxXLVnYl2mQ2hOAwMurOE3fdTtL7M7W1Igtxo07AgvFiUZWemZ7r80q4BBrSwRPdSg5MQulPzXe_1FeeDUTZ9v0yfRR5VibV0iynbnRBXSb1LfoEvnBSUu2izVEAKyzD9wTDMKYEYnzcxCmFX5vlmfPrn_Ct-EIap9ntEHNi3UN8EPD_6e38DHIHGupUn29BxURe-RmMEBKBA8PcpqngQE1PtF',
    badge: 'Más Vendido',
    badgeColor: 'bg-primary',
    tagIcon: 'groups',
    tagText: 'Favorito del Público',
    disponible: true
  },
  {
    id: 'chef-burrata',
    nombre: 'Burrata & Tomate',
    descripcion: 'Corazón cremoso de burrata, mezcla de tomates heritage, aceite de albahaca prensado en frío.',
    precio_base: 18.00,
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOZaIQOHuivjrclE57ifRcx7oFvQa_5EL6DF4fMAp3SqY0xsZvlIaBZbM5mtBEkxTAZVXkLRG4boBIny5JD1vZFwmF5LRCC0dWOD-XY-SUGB-rSuPdu4V6pr0ru5A4GCLZS9t8zO1cyDO1o4yzzpp6WGIr4IrUSE-x0-OYRPu19KVau1--jmVXfV3jvTxPGXBa3AaZstgYNrlH1Y9dEcd1X38VfpHi7kZePA4V33HL8C1w6zMCjWiABvzgthDiwebsjpBSDD3wUSsL',
    badge: 'Fresco del Día',
    badgeColor: 'bg-emerald-500',
    tagIcon: 'eco',
    tagText: 'Recién Cosechado',
    disponible: true
  },
  {
    id: 'chef-tuna',
    nombre: 'Tartar de Atún',
    descripcion: 'Atún ahi, mousse de aguacate, ponzu cítrico y crackers de sésamo tostado.',
    precio_base: 24.00,
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG4qKsFazIKDsQ8MBCip5-LzOl5L4e0e70-fWhHH-_WQnXbSp4W5aKqqKJo7AHuJRuhXODF8J8om5Dc0Y8xYNXVLZYzljbTY-Fyev8F-de7S_lnolbOyVyDDtsj4qw0JWnYscSz3lwinkVAa-V1V7TOszX3oEGoCOuV8Ke0jR_eSP46_VYgtHymvGrbAjxtr06Ld1jM4jgD7JxJCFJVHaZLrvf7C3Hup0l5NUs608lHW-swPJgxgQVqEbf_dLXkSQq4VDLy65j5y-a',
    badge: '98% Valoración',
    badgeColor: 'bg-primary',
    tagIcon: 'thumb_up',
    tagText: 'Mejor Valorado',
    disponible: true
  }
])

const openProduct = (producto) => {
  selectedProduct.value = producto
  isModalOpen.value = true
}

const addToCart = (producto) => {
  const item = {
    id: `${producto.id}-${Date.now()}`,
    producto_id: producto.id,
    nombre: producto.nombre,
    precio_base: producto.precio_base,
    cantidad: 1,
    opciones_seleccionadas: [],
    comentarios: '',
    precio_total: producto.precio_base
  }
  cartStore.addItem(item)
}

const handleAddToCart = (item) => {
  cartStore.addItem(item)
  isModalOpen.value = false
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
  <div class="min-h-screen bg-[#f8f6f6] dark:bg-[#201612] font-sans text-[#1a120e] dark:text-[#fbf9f8]">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b border-[#f2ebe8] dark:border-[#3a2d27] bg-[#f8f6f6]/80 dark:bg-[#201612]/80 backdrop-blur-md px-6 md:px-10 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="volverAlMenu"
            class="size-10 flex items-center justify-center rounded-full bg-[#f2ebe8] dark:bg-[#322520] text-[#946451] hover:bg-primary hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <div class="flex items-center gap-2 text-primary">
            <span class="material-symbols-outlined text-2xl font-bold">workspace_premium</span>
            <h1 class="text-xl font-black tracking-tight">Chef's Specials</h1>
          </div>
        </div>

        <button
          @click="irAlCarrito"
          class="relative p-2 rounded-lg bg-[#f2ebe8] dark:bg-[#322520] hover:bg-primary/10 transition-colors"
        >
          <span class="material-symbols-outlined">shopping_bag</span>
          <span
            v-if="cartStore.itemCount > 0"
            class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
          >
            {{ cartStore.itemCount }}
          </span>
        </button>
      </div>
    </header>

    <main class="px-4 md:px-10 py-8 pb-32">
      <!-- Page Heading -->
      <div class="mb-10">
        <span class="text-primary font-bold uppercase tracking-widest text-xs">Selección Exclusiva</span>
        <h2 class="mt-2 text-4xl md:text-5xl font-black leading-tight tracking-tighter">Especiales del Chef</h2>
        <p class="mt-4 text-lg text-[#946451] dark:text-[#b08e7f] leading-relaxed max-w-2xl">
          Obras maestras artesanales de la cocina de nuestro chef principal, utilizando solo ingredientes de temporada de artesanos locales.
        </p>
      </div>

      <!-- Hero Specials Carousel -->
      <section class="mb-12">
        <div class="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar">
          <div
            v-for="plato in platosDestacados"
            :key="plato.id"
            class="group relative min-w-[320px] md:min-w-[500px] aspect-[16/10] flex-shrink-0 snap-start overflow-hidden rounded-xl bg-[#201612] cursor-pointer"
            @click="addToCart(plato)"
          >
            <div
              class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80"
              :style="`background-image: url('${plato.imagen}');`"
            ></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            <!-- Badge -->
            <div class="absolute top-4 left-4 glass-label px-3 py-1.5 rounded-full flex items-center gap-2">
              <span class="material-symbols-outlined text-sm font-bold" :class="plato.badgeColor">{{ plato.badgeIcon }}</span>
              <span class="text-xs font-bold text-white uppercase tracking-wider">{{ plato.badge }}</span>
            </div>

            <!-- Content -->
            <div class="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div class="max-w-md">
                <h3 class="text-2xl md:text-3xl font-bold text-white">{{ plato.nombre }}</h3>
                <p class="mt-2 text-white/80 text-sm line-clamp-2">{{ plato.descripcion }}</p>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-2xl font-black text-white">{{ plato.precio_base.toFixed(2) }}€</span>
                <button
                  @click.stop="addToCart(plato)"
                  class="flex items-center justify-center rounded-lg bg-primary px-5 py-3 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trending Now Section -->
      <section>
        <div class="mb-6 flex items-center gap-3">
          <div class="h-8 w-1.5 bg-emerald-500 rounded-full"></div>
          <h2 class="text-2xl font-black tracking-tight uppercase">Tendencias</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="plato in platosTrending"
            :key="plato.id"
            class="group flex flex-col bg-white dark:bg-[#2a1e19] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300"
          >
            <!-- Image -->
            <div class="relative h-48 overflow-hidden">
              <div
                class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                :style="`background-image: url('${plato.imagen}');`"
              ></div>
              <div
                class="absolute top-3 right-3 text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase"
                :class="plato.badgeColor"
              >
                {{ plato.badge }}
              </div>
            </div>

            <!-- Content -->
            <div class="p-5 flex flex-col flex-1">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{{ plato.nombre }}</h4>
                <span class="font-black text-primary">{{ plato.precio_base.toFixed(2) }}€</span>
              </div>
              <p class="text-sm text-[#946451] dark:text-[#b08e7f] line-clamp-2 mb-4">{{ plato.descripcion }}</p>

              <div class="mt-auto flex items-center justify-between pt-2">
                <div class="flex items-center gap-1 text-emerald-500">
                  <span class="material-symbols-outlined text-sm">{{ plato.tagIcon }}</span>
                  <span class="text-[11px] font-bold uppercase">{{ plato.tagText }}</span>
                </div>
                <button
                  @click="addToCart(plato)"
                  class="h-10 w-10 flex items-center justify-center rounded-lg bg-[#f2ebe8] dark:bg-[#3a2d27] hover:bg-primary hover:text-white transition-all"
                >
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Floating Cart Bar -->
    <div
      v-if="cartStore.itemCount > 0"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md"
    >
      <div class="flex items-center justify-between gap-4 rounded-full bg-[#1a120e] dark:bg-[#fbf9f8] p-2 pl-6 shadow-2xl transition-all hover:scale-[1.02]">
        <div class="flex flex-col">
          <span class="text-[10px] uppercase tracking-widest text-[#946451] font-bold">Tu Pedido</span>
          <span class="font-bold text-white dark:text-[#1a120e]">{{ cartStore.itemCount }} Items • {{ cartStore.total.toFixed(2) }}€</span>
        </div>
        <button
          @click="irAlCarrito"
          class="flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-black text-white hover:bg-primary/90 transition-colors"
        >
          <span>Ver Pedido</span>
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>

    <!-- Product Modal -->
    <ProductModal
      v-if="isModalOpen && selectedProduct"
      :producto="selectedProduct"
      @close="isModalOpen = false"
      @add-to-cart="handleAddToCart"
    />
  </div>
</template>

<style scoped>
.glass-label {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .glass-label {
  background: rgba(32, 22, 18, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

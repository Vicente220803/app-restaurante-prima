<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'
import { useCartStore } from '../store/cart'
import ProductModal from '../components/ProductModal.vue'

const route = useRoute()
const cartStore = useCartStore()

const productos = ref([])
const categorias = ref([])
const restaurante = ref({})
const loading = ref(true)
const categoriaActiva = ref(null)
const searchQuery = ref('')

// Categorías por defecto con iconos
const categoriasDefault = [
  { id: 'pizzas', nombre: 'Pizzas', icon: 'local_pizza' },
  { id: 'pasta', nombre: 'Pasta', icon: 'dinner_dining' },
  { id: 'entrantes', nombre: 'Entrantes', icon: 'tapas' },
  { id: 'bebidas', nombre: 'Bebidas', icon: 'local_bar' },
  { id: 'postres', nombre: 'Postres', icon: 'icecream' }
]

// Productos de demo
const productosDemo = [
  { id: 1, nombre: 'Margherita Speciale', descripcion: 'Tomate San Marzano, mozzarella di bufala, albahaca fresca y aceite de oliva virgen extra.', precio_base: 12.50, categoria_id: 'pizzas', imagen_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApvGMQjB1ycA0LWbYRoTpO-Pa3vJW0RGpK6PHHRvHgFbmDtdSOHdGUIDmN0AihXDIqOvrEW8o2wsDDt-qCllPzzHIyz-m0xdjQaWdLN-QyuWSXknixU6R0rEqZafZ_zOnAJ0OwmIJuOH4ty47WaZG1Lqci-jOLKN2ngHC1So8chH7emDGSp4MyXuSfE0ldN6ffzXJcQ7KJocXR1Z7W39SBaUpflUcw7u0JXYeykdVK624Z38Yxk0DnGpUsEsig5A0rdxOALzJIQL3r', destacado: true, disponible: true },
  { id: 2, nombre: 'Diavola Pepperoni', descripcion: 'Pepperoni picante, mozzarella ahumada, peperoncino y nuestra salsa secreta.', precio_base: 14.00, categoria_id: 'pizzas', imagen_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCW-7dThejtfMuCYrCeZSZfOXyYLAmXPg5Q0RYXH4E9xll_YAT_EwZekkE9vmzvHtT4gY3N2DYNlx6u-1RZ9I61mtnnuw457EzftX3D2Cg4tjNpGaBRrhJjqYUR7xQCO2jw3ajqW2EXFLVJaBkO6VhCqHMsqUw09lcHJuCRot5UXn4PiNmaaRLs-9fn6pefXx1K7OBuOUFZUpijiQK7JuEksJpqFyQCiCYVF62DwjX0Yo4J7Jb6zKsuF-CewKtgjiUVFBiWlFqLA4VR', disponible: true },
  { id: 3, nombre: 'Quattro Formaggi', descripcion: 'Mezcla cremosa de Gorgonzola, Parmigiano, Fontina y Mozzarella con nueces.', precio_base: 13.50, categoria_id: 'pizzas', imagen_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9E-LZZsYj7HLtbEs6UGZJ_WwpA9TPO3QfFXyFcnbHQOio6Q5js_NzkoK6Wz4p24AGd0LqXZ-oWcuSQPXWZRm1PidrCUm0uRiZLwGlKfUO02vciZDuilLPv6y7jdZnFC7xQYVsgrwHCQb_0CY1Ve9pfkU4a6vU7Swm65nQ02bxC93Pi6orNeu2zWGraQL6A39I2u5FeEUWADIUFCcY2myfnYMv-2Le3u-uik_1NlayxuAvz2UrQFOFfVQ-1vY-xEcf7nCoWjHs1JUW', disponible: true },
  { id: 4, nombre: 'Vegetariana Zen', descripcion: 'Verduras de temporada asadas, pesto de albahaca, piñones y rúcula fresca.', precio_base: 12.00, categoria_id: 'pizzas', imagen_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo2EEHBivTTHb5N5fYcoFBvRZJ8eRZc1-9GU-9PrMFhSynM_X8J2mAcAbHhv5wvFd1q9IGQZ5Bf2E1o6kkCgmch52ShdResTULjCywyvDVn8O5L6kV6ZBFSTk02_-Ddd4kFTucKwJno0id_SujCSPJFsA2JKVylVwGk3HHLHvnEj30DESiT-iN4PGwT5EalbbfhuuhDelJUcsMGnwrM8GzNZKk3Y3HUXrrm4bn9gWSOxKrsfJ4VOgFa4xhrzvMNMthdf-eaqqdqmUX', disponible: true },
  { id: 5, nombre: 'Spaghetti Carbonara', descripcion: 'Pasta fresca con guanciale crujiente, yema de huevo, pecorino y pimienta negra.', precio_base: 11.50, categoria_id: 'pasta', imagen_url: '', disponible: true },
  { id: 6, nombre: 'Penne Arrabbiata', descripcion: 'Penne al dente con salsa de tomate picante, ajo y perejil fresco.', precio_base: 9.50, categoria_id: 'pasta', imagen_url: '', disponible: true },
  { id: 7, nombre: 'Bruschetta Clásica', descripcion: 'Pan tostado con tomate fresco, albahaca, ajo y aceite de oliva virgen.', precio_base: 6.50, categoria_id: 'entrantes', imagen_url: '', destacado: true, disponible: true },
  { id: 8, nombre: 'Carpaccio di Manzo', descripcion: 'Finas láminas de ternera con rúcula, parmesano y vinagreta de limón.', precio_base: 12.00, categoria_id: 'entrantes', imagen_url: '', disponible: true },
  { id: 9, nombre: 'Limonada Artesana', descripcion: 'Con hierbabuena y jengibre fresco.', precio_base: 3.50, categoria_id: 'bebidas', imagen_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYMADpffNb0D-89kD9eWWajc866m-YkRoFqBQo5tURT7f6WxN7EP0h5T-Eu_p40LZE9dSGjnVl-N2LTTLjieVXMpJWncS6cgQb9aplS_P1czPuWbWgP0OoVBm2ARTq0unLhWYJ-_UURWnxCGsZjS_jGb2RqxALtB-ll77n7kpi7nxQSdh_G905U_Y7j0rWg8BP44wcupVj1pLr0TKLq0eJ1sgjLRoxW1OGDYgx7CTcfsPGrzRzfvE83BdfjatU9DNUUpxtlXrouraG', disponible: true },
  { id: 10, nombre: 'Chianti DOCG', descripcion: 'Copa de tinto Toscana reserva.', precio_base: 4.50, categoria_id: 'bebidas', imagen_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCILJT2A6DFL4K-6u7XLmKAOYjJbUoW3lcMfzckPzpFnsHGEZWs9lVrV3q728SjFAZPZimhfA0WKe1BDRJL2KbuLEptx684LBRu9nrhqIZ5FWwuj-O82LxLlpYbfWPwfnK_BQ_uh38JERnFeuXTvQ3w8z4iWcLBjVQKALGuQU7uauegyunCN7Uj1QlJTPfEXW_oYhW8r7PmrTRF-81TfdJapcWf3xkUgT5dVBZenbw-SRu4VgogU5s3Qm14V3uzvzbkgh4wXH8xWHUp', disponible: true },
  { id: 11, nombre: 'Tiramisú', descripcion: 'Clásico postre italiano con mascarpone, café y cacao.', precio_base: 6.00, categoria_id: 'postres', imagen_url: '', destacado: true, disponible: true },
  { id: 12, nombre: 'Panna Cotta', descripcion: 'Crema de vainilla con coulis de frutos rojos.', precio_base: 5.50, categoria_id: 'postres', imagen_url: '', disponible: true }
]

// Modal
const isModalOpen = ref(false)
const selectedProduct = ref(null)

// Obtener slug del restaurante
const restaurantSlug = route.params.restaurantSlug
const tableNumber = route.query.table || '1'

// Productos filtrados por categoría
const productosFiltrados = computed(() => {
  let filtered = productos.value

  if (categoriaActiva.value) {
    filtered = filtered.filter(p => p.categoria_id === categoriaActiva.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.nombre.toLowerCase().includes(query) ||
      p.descripcion?.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Cargar datos
onMounted(async () => {
  try {
    // 1. Cargar restaurante
    const { data: resData } = await supabase
      .from('restaurantes')
      .select('*')
      .eq('slug', restaurantSlug)
      .single()

    restaurante.value = resData || { nombre: 'La Toscana' }

    if (resData) {
      // 2. Cargar categorías
      const { data: catData } = await supabase
        .from('categorias')
        .select('*')
        .eq('restaurant_id', resData.id)
        .order('orden')

      // 3. Cargar productos
      const { data: prodData } = await supabase
        .from('productos')
        .select('*')
        .eq('restaurant_id', resData.id)
        .eq('activa', true)

      // Usar datos de Supabase si existen, sino usar demo
      categorias.value = catData?.length ? catData : categoriasDefault
      productos.value = prodData?.length ? prodData : productosDemo
    } else {
      // Si no hay restaurante en Supabase, usar datos demo
      categorias.value = categoriasDefault
      productos.value = productosDemo
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
    // En caso de error, usar datos demo
    categorias.value = categoriasDefault
    productos.value = productosDemo
  } finally {
    loading.value = false
  }
})

const selectCategoria = (catId) => {
  categoriaActiva.value = categoriaActiva.value === catId ? null : catId
}

const openProduct = (producto) => {
  selectedProduct.value = producto
  isModalOpen.value = true
}

const addToCart = (producto) => {
  cartStore.addToCart({
    id: producto.id,
    nombre: producto.nombre,
    precioBase: producto.precio_base,
    precioTotal: producto.precio_base,
    opcionesIds: {},
    opcionesResumen: []
  })
}

// Iconos por categoría
const getCategoryIcon = (nombre) => {
  const icons = {
    'pizzas': 'local_pizza',
    'pasta': 'dinner_dining',
    'entrantes': 'tapas',
    'bebidas': 'local_bar',
    'postres': 'icecream',
    'ensaladas': 'eco',
    'carnes': 'kebab_dining',
    'pescados': 'set_meal'
  }
  return icons[nombre?.toLowerCase()] || 'restaurant'
}
</script>

<template>
  <div class="bg-[#fcfaf8] dark:bg-[#1a1a1a] min-h-screen font-display text-[#1a120e] dark:text-gray-100">
    <!-- Top Navigation Bar -->
    <header class="bg-[#fcfaf8]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#f2ebe8] dark:border-gray-800 sticky top-0 z-50">
      <div class="max-w-[960px] mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-[#e27246]/10 p-2 rounded-lg">
            <span class="material-symbols-outlined text-[#e27246] text-2xl">restaurant_menu</span>
          </div>
          <div>
            <h1 class="text-xl font-extrabold tracking-tight leading-none">{{ restaurante.nombre || 'La Toscana' }}</h1>
            <p class="text-[10px] uppercase tracking-widest text-[#e27246] font-bold">Mesa {{ tableNumber }}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <!-- Search -->
          <div class="hidden md:flex items-center bg-[#f2ebe8] dark:bg-gray-800 rounded-xl px-3 py-1.5 gap-2 border border-transparent focus-within:border-[#e27246]/50 transition-all">
            <span class="material-symbols-outlined text-gray-400 text-sm">search</span>
            <input
              v-model="searchQuery"
              class="bg-transparent border-none focus:ring-0 text-sm p-0 w-32 placeholder:text-gray-400"
              placeholder="Buscar plato..."
              type="text"
            />
          </div>
          <!-- Cart Button -->
          <button
            class="bg-[#f2ebe8] dark:bg-gray-800 p-2 rounded-xl flex items-center justify-center relative"
            @click="$router.push(`/${restaurantSlug}/cart?table=${tableNumber}`)"
          >
            <span class="material-symbols-outlined text-gray-600 dark:text-gray-300">shopping_basket</span>
            <span
              v-if="cartStore.countItems > 0"
              class="absolute -top-1 -right-1 bg-[#e27246] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
            >
              {{ cartStore.countItems }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-[960px] mx-auto pb-32">
      <!-- Sticky Category Bar -->
      <div class="sticky top-16 bg-[#fcfaf8] dark:bg-[#1a1a1a] z-40 py-4 px-4 overflow-x-auto no-scrollbar flex gap-3">
        <button
          v-for="cat in categorias"
          :key="cat.id"
          @click="selectCategoria(cat.id)"
          :class="[
            'flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl px-5 transition-all',
            categoriaActiva === cat.id
              ? 'bg-[#e27246] text-white shadow-lg shadow-[#e27246]/20'
              : 'bg-[#f2ebe8] dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#e27246]/10'
          ]"
        >
          <span class="material-symbols-outlined text-sm">{{ cat.icon || getCategoryIcon(cat.nombre) }}</span>
          <p class="text-sm font-medium">{{ cat.nombre }}</p>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <span class="material-symbols-outlined text-4xl text-[#e27246] animate-spin">progress_activity</span>
          <p class="mt-4 text-gray-500">Cargando menú...</p>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else class="px-4 py-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-extrabold tracking-tight">
            {{ categoriaActiva ? categorias.find(c => c.id === categoriaActiva)?.nombre : 'Todos los platos' }}
          </h2>
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {{ productosFiltrados.length }} platos
          </span>
        </div>

        <!-- Empty State -->
        <div v-if="productosFiltrados.length === 0" class="text-center py-16">
          <span class="material-symbols-outlined text-6xl text-gray-300">restaurant</span>
          <p class="mt-4 text-gray-500">No hay productos disponibles</p>
        </div>

        <!-- Products Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="producto in productosFiltrados"
            :key="producto.id"
            class="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#e27246]/20"
          >
            <!-- Product Image -->
            <div class="relative h-48 w-full cursor-pointer" @click="openProduct(producto)">
              <div
                class="absolute inset-0 bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-110 bg-gray-100"
                :style="producto.imagen_url ? `background-image: url('${producto.imagen_url}')` : ''"
              >
                <div v-if="!producto.imagen_url" class="w-full h-full flex items-center justify-center">
                  <span class="material-symbols-outlined text-5xl text-gray-300">restaurant</span>
                </div>
              </div>
              <!-- Badges -->
              <div v-if="producto.destacado" class="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <span class="material-symbols-outlined text-[#e27246] text-xs font-bold">star</span>
                <span class="text-[10px] font-bold">POPULAR</span>
              </div>
              <div v-if="!producto.disponible" class="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg">
                <span class="text-[10px] font-bold">AGOTADO</span>
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-5">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold leading-tight">{{ producto.nombre }}</h3>
                <span class="material-symbols-outlined text-[#e27246]/40">restaurant</span>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                {{ producto.descripcion || 'Delicioso plato de nuestra cocina' }}
              </p>
              <div class="flex items-center justify-between">
                <span class="text-[#6BBF5B] font-extrabold text-lg">{{ producto.precio_base?.toFixed(2) }}€</span>
                <button
                  @click="addToCart(producto)"
                  :disabled="!producto.disponible"
                  class="bg-[#e27246] hover:bg-[#e27246]/90 text-white font-bold text-sm px-4 py-2 rounded-xl transition-transform active:scale-95 flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <span class="material-symbols-outlined text-sm">add</span>
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Floating Cart Bar -->
    <div
      v-if="cartStore.countItems > 0"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-50"
    >
      <div
        class="bg-[#e27246] text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform"
        @click="$router.push(`/${restaurantSlug}/cart?table=${tableNumber}`)"
      >
        <div class="flex items-center gap-4">
          <div class="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center font-bold">
            {{ cartStore.countItems }}
          </div>
          <div>
            <h5 class="font-extrabold text-sm leading-none">Ver Pedido</h5>
            <p class="text-[10px] text-white/80 uppercase tracking-tighter mt-1">
              {{ cartStore.items[0]?.nombre || 'Tu pedido' }}
              <span v-if="cartStore.items.length > 1">+{{ cartStore.items.length - 1 }} más</span>
            </p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-lg font-extrabold tracking-tight">{{ cartStore.totalCart.toFixed(2) }}€</span>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <ProductModal
      v-if="isModalOpen"
      :isOpen="isModalOpen"
      :product="selectedProduct"
      @close="isModalOpen = false"
    />
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.font-display {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>

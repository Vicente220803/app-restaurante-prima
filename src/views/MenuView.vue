<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useCartStore } from '../store/cart'
import ProductModal from '../components/ProductModal.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const productos = ref([])
const categorias = ref([])
const restaurante = ref({})
const loading = ref(true)

// Modo camarero - cuando el camarero está añadiendo productos
const modoCamarero = ref(false)
const camareroMesa = ref(null)
const camareroPedidoId = ref(null)
const guardandoPedido = ref(false)

// Navegación: grupo > subcategoría > productos
const grupoActivo = ref(null)
const subcategoriaActiva = ref(null)

// Los 7 grupos principales con imágenes
const gruposMenu = [
  {
    id: 'Comida',
    nombre: 'Comidas',
    icon: 'restaurant',
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaEOoZEd5bLfk4PmoyikWzMFmicuXEzYtCCfn1sOzr3aqOvgQCkT5R2t5dZizu5mmIKzHB06RdWOTGwUaDBNSIWcdFFetMIVWTpuf5s1xE_xR9hE7WfrhTV0KgmDBzULkL_TXgztq9UTV0qev6pZPSaeUgmfj7EXd_MkDtDfC2O8Zw-Wwu57bTo5xBek4mL43X56rIUXtgJEMVb6VJkqJTGm6VB_HW58M59xFx3CRuaEm7gw9YxF5Mii6vcqI2M5FwiUPhsP9F3fRQ'
  },
  {
    id: 'Pizzas',
    nombre: 'Pizzas',
    icon: 'local_pizza',
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB59XpHmCi3-cpzpqrZ6OuKYWQZewCfq3JS8A5B8gIvUTec8JZIK0cv05A56dTJ8APU52B8Z43-1cwDZMMT21lV88gmeqMgvEtt6Rak2bU5UCiQRopJE3Lvu_wara8sADpS5hKhgNFpGIheoWVwLLGzDPw1MRRxKRWTY7gKnbVgpFT-eQZZXcfUOMpP3yQEpEnPW6MBTZOoHAYEHoIAXEkGEc-nlgdQhV3FiKsFS5-AwX2SmaPskMIKeoB-evJ2ZYan4E2zDzVMofbo'
  },
  {
    id: 'Bebida',
    nombre: 'Bebidas',
    icon: 'local_bar',
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAISdJ6EeT6s1t859cyyWaX99W-WmVehl2d_Og0JOW55_zJHY7GRjLvlCrnAUiM-lSoOyt4YMM894AcXtD7rc1j4Xuzx2lcnipBuqhLY2ZLbLB3IO8dYNXaHWD_q0VCPK8chIveXY06DKbQ6m5g0FrrHnUjWZLaK55wDAO588lr2kyx0xCIW9PIY09d2BGm9Z6rNKEEVq9bwpoEcacfPVTxRbNXOAMN_H-nlEgP2cRjb8IY3lS7S3AkGEGLDBbTid2rvFUqJfhHqlUD'
  },
  {
    id: 'Postre',
    nombre: 'Postres',
    icon: 'icecream',
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZzT8fjeSBOwnMUNCDi0Cyx1gJBb39YUZnIOI63jb8-E9SgCwiPHcSGxkqa2Vrobs5ohGjXfu_CvclpgBfKUQj0S64CvaixgT6CQ879XiT-a2za7Ug8SbnBOpYdYktU3IEYyH_MDJeLF675y4NpgJ4-kGzkwbS-ni9aRORiW2qKXBxjK2HZ2XOZlpE8aQMVOfibW2m2_lBgufKg8GqhvaphVi2wokE9LrjCGPM5VGLDG0KraloJSWOekcofZc8EmFLmpD1JP5g_Ehs'
  },
  {
    id: 'Ninos',
    nombre: 'Niños',
    icon: 'child_care',
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuXtSzRJtt3oJVnziGhSS9iR22BwWg38XK9RNEWPN5wxDMUZvuUle1OpxkDjVp1MCN2X_FW5Q08lP_8ixXn8eznAeJcPRNEVzL3DbQvJZZYCOqeZ0coqfGoWJEasZNksi3nXU7sHteReCfMSH9y2CikLmdszAHvOm3wSPZFyTqLSYHez01enREwLIB9vS5YS5omdoxWYaIvwyQNjORP0Xq7EhwvC9S9ypd9Ne_X2xJV_ydPGLUchRDhYjPlz4XP1lzOBa52MkJqZ84'
  },
  {
    id: 'Menu del dia',
    nombre: 'Menú del Día',
    icon: 'calendar_today',
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGQSAyYSEZWEltvxHlZlg6iZVTpOV9SYdhmQwqu8XznvZLqajcUYgUXIYA5sHE-sdhqOrOj5C3n4mYSXhTh-sh9fcOkVRLX-VKXD7bkbAp28mq0dqTnS9fvhk0CSnv5Y2mK_aADsIRptGfZxn8-eNsJWZ32emctYGxS-ocuc52m596G7TMnIhsEl71D8taCkS7BeYqcg1syZlqVDzzclnulpSIPWdumjq7Kn3hYtrfnWIaFD4u8GAOuRl7gCoMvV1icS6Dv_wkeJIi',
    badge: 'Hoy',
    badgeColor: 'bg-primary'
  },
  {
    id: 'Promocion del chef',
    nombre: 'Promoción del Chef',
    icon: 'workspace_premium',
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbQ3_Rw3FU_YzBaMMcYBrF3b41lWVc7hMu8SnWVkuJe4DjyJjFJekXTHlN7gXqCio9poe3_t1yVOZF453lWzITaWPQNkjFLK90KjblMKiK7L-OvzJ3oMy8vDqYCvLqE2etT9fooVpeaajbb-mfT6y34PUPcaueGJEdtOL46U9xWaP6D3ot_QypGxQy5wJSq55grNzQFh96cc6g6150fispAouTRAD84Vct9o1rtAOVMVUdogtELGBQQaKYYiSEua3346tScepTM-tk',
    badge: 'Especial',
    badgeColor: 'bg-emerald-500',
    especial: true
  }
]

// Modal
const isModalOpen = ref(false)
const selectedProduct = ref(null)

// Image lightbox
const isImageOpen = ref(false)
const selectedImage = ref('')

// Panel de pedido en mobile
const mostrarPanelPedido = ref(false)

const openImage = (imageUrl) => {
  if (imageUrl) {
    selectedImage.value = imageUrl
    isImageOpen.value = true
  }
}

// Obtener slug del restaurante
const restaurantSlug = route.params.restaurantSlug
const tableNumber = route.query.table || '1'

// Subcategorías del grupo activo
const subcategoriasDelGrupo = computed(() => {
  if (!grupoActivo.value) return []
  return categorias.value.filter(c => c.grupo === grupoActivo.value)
})

// Productos filtrados y ordenados alfabéticamente
const productosFiltrados = computed(() => {
  let filtered = productos.value

  // Si hay subcategoría activa, filtrar por ella
  if (subcategoriaActiva.value) {
    filtered = filtered.filter(p => p.categoria_id === subcategoriaActiva.value)
  }
  // Si hay grupo activo pero no subcategoría, mostrar todos los productos del grupo
  else if (grupoActivo.value) {
    const catIds = subcategoriasDelGrupo.value.map(c => c.id)
    filtered = filtered.filter(p => catIds.includes(p.categoria_id))
  }

  // Ordenar alfabéticamente por nombre
  return [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
})

// Título de la sección actual
const tituloSeccion = computed(() => {
  if (subcategoriaActiva.value) {
    const cat = categorias.value.find(c => c.id === subcategoriaActiva.value)
    return cat?.nombre || ''
  }
  if (grupoActivo.value) {
    const grupo = gruposMenu.find(g => g.id === grupoActivo.value)
    return grupo?.nombre || ''
  }
  return 'Todos los platos'
})

// Cargar datos
onMounted(async () => {
  // Detectar modo camarero
  const modoParam = route.query.modo
  if (modoParam === 'camarero') {
    modoCamarero.value = true
    camareroMesa.value = sessionStorage.getItem('camarero_mesa')
    camareroPedidoId.value = sessionStorage.getItem('camarero_pedido_id')
    // Limpiar carrito al entrar en modo camarero para empezar limpio
    cartStore.clearCart()
  }

  try {
    // 1. Cargar restaurante
    const { data: resData } = await supabase
      .from('restaurantes')
      .select('*')
      .eq('slug', restaurantSlug)
      .single()

    restaurante.value = resData || { nombre: 'La Toscana' }

    // 2. Cargar categorías desde Supabase (con el campo grupo)
    const { data: catData } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre')

    // 3. Cargar productos desde Supabase
    const { data: prodData } = await supabase
      .from('productos')
      .select('*, categorias(id, nombre, grupo)')
      .eq('disponible', true)

    categorias.value = catData || []
    productos.value = prodData || []
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loading.value = false
  }
})

// Guardar productos añadidos por el camarero al pedido existente
const guardarProductosCamarero = async () => {
  if (!modoCamarero.value || cartStore.items.length === 0) return

  guardandoPedido.value = true

  try {
    // Preparar los nuevos items
    const ahora = new Date().toISOString()
    const nuevosItems = cartStore.items.map(item => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precioTotal,
      opciones: item.opcionesResumen?.map(o => o.nombre).join(', ') || null,
      instrucciones: item.instrucciones || null,
      categoria: item.categoria || null,
      grupo: item.grupo || null,
      added_at: ahora
    }))

    if (camareroPedidoId.value && camareroPedidoId.value !== 'null') {
      // Añadir al pedido existente
      const { data: pedidoActual } = await supabase
        .from('pedidos')
        .select('items, total')
        .eq('id', camareroPedidoId.value)
        .single()

      if (pedidoActual) {
        const itemsActualizados = [...(pedidoActual.items || []), ...nuevosItems]
        const nuevoTotal = itemsActualizados.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)

        await supabase
          .from('pedidos')
          .update({ items: itemsActualizados, total: nuevoTotal })
          .eq('id', camareroPedidoId.value)
      }
    } else {
      // Crear nuevo pedido para esta mesa
      await supabase
        .from('pedidos')
        .insert({
          mesa: camareroMesa.value,
          items: nuevosItems,
          total: cartStore.totalCart,
          estado: 'pendiente'
        })
    }

    // Limpiar y volver a la vista del camarero
    cartStore.clearCart()
    sessionStorage.removeItem('camarero_mesa')
    sessionStorage.removeItem('camarero_pedido_id')
    sessionStorage.removeItem('camarero_modo')

    // Redirigir según el rol del usuario
    const userData = JSON.parse(sessionStorage.getItem('adminUser') || '{}')
    const rol = userData.rol || 'camarero'
    const rutaPorRol = {
      'camarero': '/camarero',
      'gerente': '/admin/dashboard',
      'admin': '/admin/dashboard'
    }
    router.push(rutaPorRol[rol] || '/camarero')
  } catch (error) {
    console.error('Error guardando productos:', error)
  } finally {
    guardandoPedido.value = false
  }
}

// Cancelar modo camarero
const cancelarModoCamarero = () => {
  cartStore.clearCart()
  sessionStorage.removeItem('camarero_mesa')
  sessionStorage.removeItem('camarero_pedido_id')
  sessionStorage.removeItem('camarero_modo')

  // Redirigir según el rol del usuario
  const userData = JSON.parse(sessionStorage.getItem('adminUser') || '{}')
  const rol = userData.rol || 'camarero'
  const rutaPorRol = {
    'camarero': '/camarero',
    'gerente': '/admin/dashboard',
    'admin': '/admin/dashboard'
  }
  router.push(rutaPorRol[rol] || '/camarero')
}

// Seleccionar grupo
const selectGrupo = (grupoId) => {
  // Si es "Niños", navegar a la página especial del menú infantil
  if (grupoId === 'Ninos') {
    router.push({
      name: 'MenuNinos',
      params: { restaurantSlug },
      query: { table: tableNumber }
    })
    return
  }

  // Si es "Promoción del Chef", navegar a la página especial
  if (grupoId === 'Promocion del chef') {
    router.push({
      name: 'MenuChef',
      params: { restaurantSlug },
      query: { table: tableNumber }
    })
    return
  }

  grupoActivo.value = grupoId
  subcategoriaActiva.value = null
}

// Seleccionar subcategoría
const selectSubcategoria = (catId) => {
  subcategoriaActiva.value = subcategoriaActiva.value === catId ? null : catId
}

// Volver atrás
const volverAtras = () => {
  if (subcategoriaActiva.value) {
    subcategoriaActiva.value = null
  } else if (grupoActivo.value) {
    grupoActivo.value = null
  }
}

const openProduct = (producto) => {
  selectedProduct.value = producto
  isModalOpen.value = true
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
    'pescados': 'set_meal',
    'vinos': 'wine_bar',
    'cervezas': 'sports_bar',
    'refrescos': 'local_cafe',
    'cocktails': 'nightlife'
  }
  return icons[nombre?.toLowerCase()] || 'restaurant'
}
</script>

<template>
  <div class="bg-[#f8f6f5] dark:bg-[#221610] text-slate-900 dark:text-white min-h-screen flex flex-col items-center font-display">
    <!-- Main Container -->
    <div class="relative flex min-h-screen w-full max-w-[1200px] flex-col overflow-x-hidden">

      <!-- Header Section -->
      <header class="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-[#493022] px-6 md:px-10 py-4 sticky top-0 bg-[#f8f6f5]/80 dark:bg-[#221610]/80 backdrop-blur-md z-50">
        <div class="flex items-center gap-4">
          <!-- Botón volver cuando hay grupo activo -->
          <button
            v-if="grupoActivo"
            @click="volverAtras"
            class="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#493022] transition-colors"
          >
            <span class="material-symbols-outlined text-slate-600 dark:text-[#cba590]">arrow_back</span>
          </button>
          <!-- Logo -->
          <div v-else class="text-[#da540b]">
            <svg fill="none" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg">
              <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor"/>
              <path clip-rule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fill-rule="evenodd"/>
            </svg>
          </div>
          <h2 class="text-slate-900 dark:text-white text-xl font-extrabold leading-tight tracking-tight">
            {{ grupoActivo ? tituloSeccion : (restaurante.nombre || 'La Toscana') }}
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <!-- Modo Camarero -->
          <template v-if="modoCamarero">
            <div class="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-lg">
              <span class="material-symbols-outlined text-amber-500 text-sm">badge</span>
              <span class="text-xs font-bold text-amber-500">CAMARERO</span>
            </div>
            <div class="bg-[#da540b] text-white text-sm font-bold px-3 py-2 rounded-xl">
              Mesa {{ camareroMesa }}
            </div>
            <!-- Botón Cancelar -->
            <button
              @click="cancelarModoCamarero"
              class="flex items-center gap-2 bg-slate-200 dark:bg-gray-700 px-3 py-2 rounded-xl hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
            >
              <span class="material-symbols-outlined text-slate-600 dark:text-gray-300 text-sm">close</span>
              <span class="text-sm font-bold text-slate-700 dark:text-gray-300">Cancelar</span>
            </button>
            <!-- Botón Guardar -->
            <button
              @click="guardarProductosCamarero"
              :disabled="cartStore.countItems === 0 || guardandoPedido"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm',
                cartStore.countItems > 0
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                  : 'bg-slate-300 dark:bg-gray-700 text-slate-500 dark:text-gray-500 cursor-not-allowed'
              ]"
            >
              <span v-if="guardandoPedido" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              <span v-else class="material-symbols-outlined text-sm">save</span>
              <span>Guardar</span>
              <span
                v-if="cartStore.countItems > 0"
                class="bg-white/20 text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center font-bold"
              >
                {{ cartStore.countItems }}
              </span>
            </button>
          </template>

          <!-- Modo Cliente Normal -->
          <template v-else>
            <div class="hidden md:flex flex-col items-end">
              <span class="text-xs text-slate-500 dark:text-[#cba590] font-medium">Ubicación</span>
              <span class="text-sm font-bold text-[#da540b]">Mesa {{ tableNumber }}</span>
            </div>
            <button class="flex cursor-pointer items-center justify-center rounded-xl h-10 px-3 bg-[#da540b] text-white text-sm font-bold shadow-lg shadow-[#da540b]/20 hover:bg-[#da540b]/90 transition-all">
              <span>Mesa {{ tableNumber }}</span>
            </button>
            <!-- Cart button with Ver Pedido -->
            <button
              @click="$router.push(`/${restaurantSlug}/cart?table=${tableNumber}`)"
              class="flex items-center gap-2 bg-slate-100 dark:bg-[#493022] px-3 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-[#5a3a2a] transition-colors"
            >
              <span class="material-symbols-outlined text-slate-600 dark:text-[#cba590]">shopping_cart</span>
              <span v-if="cartStore.countItems > 0" class="text-sm font-bold text-slate-700 dark:text-white">
                Ver Pedido
              </span>
              <span
                v-if="cartStore.countItems > 0"
                class="bg-[#da540b] text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center font-bold"
              >
                {{ cartStore.countItems }}
              </span>
            </button>
          </template>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="flex-1 flex items-center justify-center py-20">
        <div class="text-center">
          <span class="material-symbols-outlined text-4xl text-[#da540b] animate-spin">progress_activity</span>
          <p class="mt-4 text-slate-500 dark:text-[#cba590]">Cargando menú...</p>
        </div>
      </div>

      <template v-else>
        <!-- ========== VISTA PRINCIPAL: Grupos ========== -->
        <template v-if="!grupoActivo">
          <!-- Hero Section -->
          <div class="px-6 md:px-10 pt-10 pb-24">
            <h1 class="text-slate-900 dark:text-white tracking-tight text-3xl md:text-4xl font-extrabold leading-tight">
              ¡Hola! Bienvenido a {{ restaurante.nombre || 'La Toscana' }}
            </h1>
          </div>

          <!-- Category Grid -->
          <main class="flex-1 px-6 md:px-10 pb-10">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              <div
                v-for="(grupo, index) in gruposMenu"
                :key="grupo.id"
                @click="selectGrupo(grupo.id)"
                :class="[
                  'group relative bg-cover bg-center flex flex-col gap-3 rounded-2xl justify-end p-5 aspect-square cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl',
                  grupo.especial ? 'border-2 border-emerald-500/50' : '',
                  index === gruposMenu.length - 1 ? 'col-span-2 md:col-span-1' : ''
                ]"
                :style="`background-image: linear-gradient(0deg, rgba(34, 22, 16, 0.9) 0%, rgba(34, 22, 16, 0.2) 50%, rgba(34, 22, 16, 0) 100%), url('${grupo.imagen}');`"
              >
                <!-- Badge -->
                <div
                  v-if="grupo.badge"
                  :class="[
                    'absolute top-4 right-4 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider',
                    grupo.badgeColor || 'bg-[#da540b]'
                  ]"
                >
                  {{ grupo.badge }}
                </div>
                <!-- Hover overlay -->
                <div :class="[
                  'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity',
                  grupo.especial ? 'bg-emerald-500/10' : 'bg-[#da540b]/10'
                ]"></div>
                <!-- Icon -->
                <span :class="[
                  'material-symbols-outlined mb-1',
                  grupo.especial ? 'text-emerald-400' : 'text-[#da540b]'
                ]">{{ grupo.icon }}</span>
                <!-- Name -->
                <p class="text-white text-xl font-bold leading-tight">{{ grupo.nombre }}</p>
              </div>
            </div>
          </main>
        </template>

        <!-- ========== VISTA DE GRUPO: Subcategorías y Productos ========== -->
        <template v-else-if="grupoActivo">
          <!-- Subcategories Bar -->
          <div v-if="subcategoriasDelGrupo.length > 0" class="px-6 md:px-10 mb-4">
            <div class="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              <button
                v-for="subcat in subcategoriasDelGrupo"
                :key="subcat.id"
                @click="selectSubcategoria(subcat.id)"
                :class="[
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0 transition-all text-sm font-medium',
                  subcategoriaActiva === subcat.id
                    ? 'bg-[#da540b] text-white shadow-lg shadow-[#da540b]/20'
                    : 'bg-white dark:bg-[#2d1e16] text-slate-700 dark:text-[#cba590] hover:bg-slate-100 dark:hover:bg-[#493022]'
                ]"
              >
                <span class="material-symbols-outlined text-sm">{{ getCategoryIcon(subcat.nombre) }}</span>
                <span>{{ subcat.nombre }}</span>
                <span class="text-xs opacity-60 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
                  {{ productos.filter(p => p.categoria_id === subcat.id).length }}
                </span>
              </button>
            </div>
          </div>

          <!-- Products Grid -->
          <main class="flex-1 px-6 md:px-10 pb-10">
            <!-- Empty State -->
            <div v-if="productosFiltrados.length === 0" class="text-center py-16">
              <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-[#493022]">restaurant</span>
              <p class="mt-4 text-slate-500 dark:text-[#cba590]">No hay productos disponibles</p>
            </div>

            <!-- Products -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="producto in productosFiltrados"
                :key="producto.id"
                class="group bg-white dark:bg-[#2d1e16] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-[#493022]"
              >
                <!-- Product Image -->
                <div class="relative h-48 w-full cursor-pointer" @click="openImage(producto.imagen_url)">
                  <div
                    class="absolute inset-0 bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-110 bg-slate-100 dark:bg-[#493022]"
                    :style="producto.imagen_url ? `background-image: url('${producto.imagen_url}')` : ''"
                  >
                    <div v-if="!producto.imagen_url" class="w-full h-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-[#493022]">restaurant</span>
                    </div>
                  </div>
                  <!-- Badge Popular -->
                  <div v-if="producto.destacado" class="absolute top-3 left-3 bg-white/90 dark:bg-[#221610]/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <span class="material-symbols-outlined text-[#da540b] text-xs">star</span>
                    <span class="text-[10px] font-bold text-slate-900 dark:text-white">POPULAR</span>
                  </div>
                </div>

                <!-- Product Info -->
                <div class="p-5">
                  <div class="flex justify-between items-start mb-2">
                    <h3
                      class="text-lg font-bold leading-tight cursor-pointer hover:text-[#da540b] transition-colors text-slate-900 dark:text-white"
                      @click="openProduct(producto)"
                    >{{ producto.nombre }}</h3>
                    <button
                      class="text-[#da540b]/40 hover:text-[#da540b] transition-colors"
                      @click="openProduct(producto)"
                    >
                      <span class="material-symbols-outlined">info</span>
                    </button>
                  </div>
                  <p class="text-slate-500 dark:text-[#cba590] text-sm leading-relaxed mb-4 line-clamp-2">
                    {{ producto.descripcion || 'Delicioso plato de nuestra cocina' }}
                  </p>
                  <div class="flex items-center justify-between">
                    <span class="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">{{ producto.precio_base?.toFixed(2) }}€</span>
                    <button
                      @click="openProduct(producto)"
                      :disabled="!producto.disponible"
                      class="bg-[#da540b] hover:bg-[#da540b]/90 text-white font-bold text-sm px-4 py-2 rounded-xl transition-transform active:scale-95 flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-[#da540b]/20"
                    >
                      <span class="material-symbols-outlined text-sm">add</span>
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </template>
      </template>

      <!-- Panel Mi Pedido - Sidebar derecho en desktop, drawer en mobile -->
      <aside :class="[
        'fixed md:relative inset-0 md:inset-auto w-full md:w-96 bg-slate-50 dark:bg-[#2a1810] border-l border-slate-200 dark:border-[#493022] flex flex-col z-40 transition-transform duration-300',
        !mostrarPanelPedido && 'md:translate-x-0 translate-x-full md:w-80'
      ]">
        <!-- Header del panel -->
        <div class="border-b border-slate-200 dark:border-[#493022] px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-[#da540b]">shopping_cart</span>
            Mi Pedido
          </h3>
          <button
            @click="mostrarPanelPedido = false"
            class="md:hidden p-2 hover:bg-slate-200 dark:hover:bg-[#493022] rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined text-slate-600 dark:text-[#cba590]">close</span>
          </button>
        </div>

        <!-- Contenido del carrito -->
        <div v-if="cartStore.countItems === 0" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-[#493022] mb-4">shopping_cart</span>
          <p class="text-slate-500 dark:text-[#cba590] font-medium">Tu carrito está vacío</p>
          <p class="text-sm text-slate-400 dark:text-[#a68070] mt-2">Selecciona productos para empezar</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto">
          <!-- Lista de items -->
          <div class="p-6 space-y-4">
            <div
              v-for="(item, index) in cartStore.items"
              :key="index"
              class="bg-white dark:bg-[#3a2618] rounded-lg p-4 border border-slate-200 dark:border-[#493022]"
            >
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="flex-1">
                  <h4 class="font-bold text-slate-900 dark:text-white">{{ item.nombre }}</h4>
                  <p v-if="item.opcionesResumen && item.opcionesResumen.length > 0" class="text-xs text-slate-500 dark:text-[#a68070] mt-1">
                    {{ item.opcionesResumen.map(o => o.nombre).join(', ') }}
                  </p>
                </div>
                <span class="text-[#da540b] font-bold">x{{ item.cantidad }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500 dark:text-[#a68070]">{{ (item.precioTotal / item.cantidad).toFixed(2) }}€ c/u</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ item.precioTotal.toFixed(2) }}€</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Totales y botones -->
        <div v-if="cartStore.countItems > 0" class="border-t border-slate-200 dark:border-[#493022] p-6 space-y-4">
          <!-- Resumen de totales -->
          <div class="space-y-2 pb-4 border-b border-slate-200 dark:border-[#493022]">
            <div class="flex justify-between text-sm text-slate-600 dark:text-[#a68070]">
              <span>Subtotal</span>
              <span>{{ cartStore.totalCart.toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between items-end">
              <span class="font-bold text-slate-900 dark:text-white">Total</span>
              <span class="text-2xl font-extrabold text-[#da540b]">{{ cartStore.totalCart.toFixed(2) }}€</span>
            </div>
          </div>

          <!-- Nota de confirmación si hay modo camarero -->
          <div v-if="modoCamarero" class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
            <p class="text-xs text-amber-800 dark:text-amber-200">
              <span class="font-bold">Pedido guardado:</span> Los productos se han añadido a la cuenta
            </p>
          </div>

          <!-- Botones -->
          <button
            v-if="!modoCamarero"
            @click="$router.push(`/${restaurantSlug}/cart?table=${tableNumber}`)"
            class="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-[#493022] hover:bg-slate-800 dark:hover:bg-[#5a3a2a] text-white font-bold py-3 rounded-xl transition-colors"
          >
            <span class="material-symbols-outlined">receipt</span>
            Ver Pedido Completo
          </button>
          <button
            @click="mostrarPanelPedido = false"
            class="w-full md:hidden bg-[#da540b] hover:bg-[#da540b]/90 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Seguir comprando
          </button>
        </div>
      </aside>

      <!-- Botón flotante para abrir panel en mobile (cuando no está abierto) -->
      <button
        v-if="!mostrarPanelPedido && cartStore.countItems > 0"
        @click="mostrarPanelPedido = true"
        class="md:hidden fixed bottom-6 right-6 bg-[#da540b] hover:bg-[#da540b]/90 text-white rounded-full p-4 shadow-lg shadow-[#da540b]/30 z-30 flex items-center justify-center"
      >
        <span class="material-symbols-outlined">shopping_cart</span>
        <span class="absolute -top-2 -right-2 bg-white text-[#da540b] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {{ cartStore.countItems }}
        </span>
      </button>

      </div>

    <!-- Product Modal -->
    <ProductModal
      v-if="isModalOpen"
      :isOpen="isModalOpen"
      :product="selectedProduct"
      @close="isModalOpen = false"
    />

    <!-- Image Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isImageOpen"
          class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          @click="isImageOpen = false"
        >
          <button
            class="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            @click="isImageOpen = false"
          >
            <span class="material-symbols-outlined text-3xl">close</span>
          </button>
          <img
            :src="selectedImage"
            class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
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

/* Lightbox transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #221610;
}
::-webkit-scrollbar-thumb {
  background: #493022;
  border-radius: 10px;
}
</style>

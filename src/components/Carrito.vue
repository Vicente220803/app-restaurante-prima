<template>
  <!-- Overlay para mobile -->
  <div
    v-if="isOpen && isMobile"
    @click="closeCarrito"
    class="fixed inset-0 bg-black/50 z-40 md:hidden"
  ></div>

  <!-- Carrito -->
  <div
    :class="[
      'fixed bg-white shadow-2xl border border-neutral-200 z-50 transition-all duration-300 ease-in-out',
      isMobile
        ? 'inset-x-0 bottom-0 rounded-t-2xl max-h-[80vh]'
        : 'bottom-4 right-4 w-96 max-h-[80vh] rounded-xl',
      isOpen ? 'translate-y-0 opacity-100' : (isMobile ? 'translate-y-full' : 'translate-x-full opacity-0')
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-neutral-200">
      <div class="flex items-center space-x-3">
        <div class="bg-primary-100 p-2 rounded-lg">
          <IconShoppingCart class="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-neutral-900">Tu Carrito</h3>
          <p class="text-sm text-neutral-600">{{ carritoStore.items.length }} items</p>
        </div>
      </div>
      <button
        @click="closeCarrito"
        class="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <IconX class="w-5 h-5 text-neutral-500" />
      </button>
    </div>

    <!-- Contenido -->
    <div class="flex-1 overflow-y-auto max-h-96">
      <div v-if="carritoStore.items.length === 0" class="p-6 text-center">
        <IconShoppingCart class="w-16 h-16 mx-auto text-neutral-300 mb-4" />
        <h4 class="text-lg font-medium text-neutral-900 mb-2">Tu carrito está vacío</h4>
        <p class="text-neutral-600 text-sm">Agrega algunos productos deliciosos</p>
      </div>

      <div v-else class="p-6 space-y-4">
        <div
          v-for="item in carritoStore.items"
          :key="item.id"
          class="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg"
        >
          <!-- Imagen -->
          <div class="w-16 h-16 bg-neutral-200 rounded-lg flex-shrink-0 overflow-hidden">
            <img
              v-if="item.imagen_url"
              :src="item.imagen_url"
              :alt="item.nombre"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <IconChefHat class="w-6 h-6 text-neutral-400" />
            </div>
          </div>

          <!-- Detalles -->
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-neutral-900 truncate">{{ item.nombre }}</h4>
            <p class="text-sm text-neutral-600">{{ item.precio_unitario }}€ cada uno</p>
            <!-- Mostrar opciones seleccionadas -->
            <div v-if="item.opciones_seleccionadas" class="text-xs text-neutral-500 mt-1">
              <div v-for="(valor, opcion) in item.opciones_seleccionadas" :key="opcion">
                {{ opcion }}: {{ valor }}
              </div>
            </div>
          </div>

          <!-- Controles de cantidad -->
          <div class="flex items-center space-x-2">
            <button
              @click="disminuirCantidad(item)"
              class="p-1 hover:bg-neutral-200 rounded transition-colors"
            >
              <IconMinus class="w-4 h-4 text-neutral-600" />
            </button>
            <span class="w-8 text-center font-medium">{{ item.cantidad }}</span>
            <button
              @click="aumentarCantidad(item)"
              class="p-1 hover:bg-neutral-200 rounded transition-colors"
            >
              <IconPlus class="w-4 h-4 text-neutral-600" />
            </button>
          </div>

          <!-- Subtotal -->
          <div class="text-right">
            <p class="font-semibold text-neutral-900">{{ item.precio_total.toFixed(2) }}€</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer con total y checkout -->
    <div v-if="carritoStore.items.length > 0" class="border-t border-neutral-200 p-6">
      <div class="space-y-4">
        <!-- Total -->
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold text-neutral-900">Total</span>
          <span class="text-2xl font-bold text-primary-600">{{ carritoStore.total.toFixed(2) }}€</span>
        </div>

        <!-- Botón de confirmar -->
        <button
          @click="confirmarPedido"
          :disabled="loading"
          class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <IconLoader v-if="loading" class="w-5 h-5 animate-spin" />
          <IconCheck v-else class="w-5 h-5" />
          <span>{{ loading ? 'Procesando...' : 'Confirmar Pedido' }}</span>
        </button>

        <!-- Nota -->
        <p class="text-xs text-neutral-500 text-center">
          El pedido será enviado a cocina inmediatamente
        </p>
      </div>
    </div>
  </div>

  <!-- Botón flotante para abrir carrito (mobile) -->
  <button
    v-if="!isOpen && carritoStore.items.length > 0 && isMobile"
    @click="openCarrito"
    class="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-30 animate-bounce-subtle"
  >
    <IconShoppingCart class="w-6 h-6" />
    <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
      {{ carritoStore.items.length }}
    </span>
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCarritoStore } from '../store/carrito'
import { supabase } from '../supabase'
import { useRoute } from 'vue-router'
import { ShoppingCart, X, ChefHat, Minus, Plus, Loader, Check } from 'lucide-vue-next'

const carritoStore = useCarritoStore()
const route = useRoute()
const isOpen = ref(false)
const loading = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const openCarrito = () => {
  isOpen.value = true
}

const closeCarrito = () => {
  isOpen.value = false
}

const aumentarCantidad = (item) => {
  item.cantidad++
  carritoStore.updateItem(item)
}

const disminuirCantidad = (item) => {
  if (item.cantidad > 1) {
    item.cantidad--
    carritoStore.updateItem(item)
  } else {
    carritoStore.removerProducto(item.id)
  }
}

const confirmarPedido = async () => {
  if (carritoStore.items.length === 0) return

  loading.value = true

  try {
    const restaurantId = route.params.restaurantId
    const pedido = {
      restaurant_id: restaurantId,
      items: carritoStore.items,
      estado: 'pendiente',
      total: carritoStore.total,
      created_at: new Date().toISOString()
    }

    const { error } = await supabase.from('pedidos').insert(pedido)

    if (error) throw error

    // Éxito
    carritoStore.vaciarCarrito()
    closeCarrito()

    // Notificación de éxito (podrías usar un toast aquí)
    alert('¡Pedido confirmado! Será preparado pronto.')

  } catch (error) {
    console.error('Error creando pedido:', error)
    alert('Error al confirmar el pedido. Inténtalo de nuevo.')
  } finally {
    loading.value = false
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Abrir carrito automáticamente cuando se agrega un item (desktop)
const unwatch = carritoStore.$subscribe(() => {
  if (carritoStore.items.length > 0 && !isMobile.value) {
    isOpen.value = true
  }
})
</script>
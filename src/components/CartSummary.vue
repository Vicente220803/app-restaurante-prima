<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" @click="close">
    <div class="w-full max-w-md bg-white rounded-t-3xl shadow-2xl transform transition-all duration-300 ease-out max-h-[80vh] overflow-hidden" @click.stop>
      <div class="p-6 pb-24">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-neutral-900">Tu Pedido</h2>
          <button @click="close" class="text-neutral-400 hover:text-neutral-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div v-if="items.length === 0" class="text-center py-8">
          <p class="text-neutral-600">Tu carrito está vacío</p>
        </div>

        <div v-else class="space-y-4 mb-6">
          <div v-for="item in items" :key="item.itemKey" class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div class="flex-1">
              <h3 class="font-medium text-neutral-900">{{ item.nombre }}</h3>
              <p class="text-sm text-neutral-600">{{ item.precio_unitario }}€ x {{ item.cantidad }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-neutral-900">{{ (item.precio_unitario * item.cantidad).toFixed(2) }}€</p>
              <button @click="removeItem(item)" class="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
            </div>
          </div>
        </div>

        <div v-if="items.length > 0" class="border-t pt-4">
          <div class="flex justify-between items-center text-xl font-bold text-neutral-900">
            <span>Total:</span>
            <span>{{ total.toFixed(2) }}€</span>
          </div>
        </div>
      </div>

      <div v-if="items.length > 0" class="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-neutral-100">
        <button class="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 px-6 rounded-3xl font-bold text-lg transition-all duration-200">
          Confirmar Pedido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCarritoStore } from '../store/carrito'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const carritoStore = useCarritoStore()

const { items, total } = carritoStore

const close = () => {
  emit('close')
}

const removeItem = (item) => {
  carritoStore.removerProducto(item.id)
}
</script>
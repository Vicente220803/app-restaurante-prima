<template>
  <div v-if="ordersStore.hasOrders" class="fixed bottom-0 left-0 right-0 md:fixed md:bottom-auto md:right-6 md:top-24 md:w-80 z-40">
    <!-- Mobile: Bottom sheet -->
    <div class="md:hidden bg-white dark:bg-[#2d313a] rounded-t-2xl shadow-2xl border border-[#f2ebe8] dark:border-gray-700 max-h-[40vh] overflow-hidden flex flex-col">
      <div class="p-4 border-b border-[#f2ebe8] dark:border-gray-700 bg-gradient-to-r from-[#e27246] to-[#d4603d] text-white">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-sm">📋 Tu Resumen</h3>
          <span class="text-xs bg-white/20 px-2 py-1 rounded-full">{{ itemCount }} items</span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-2">
        <div v-for="item in ordersStore.itemsWithQuantities" :key="`${item.id}-summary`" class="flex justify-between text-xs">
          <span class="text-[#946451] dark:text-gray-400 flex-1">
            {{ item.cantidad }}x {{ item.nombre }}
          </span>
          <span class="font-semibold whitespace-nowrap">{{ (item.precioTotal * item.cantidad).toFixed(2) }}€</span>
        </div>
      </div>

      <div class="border-t border-[#f2ebe8] dark:border-gray-700 p-4 bg-gray-50 dark:bg-[#21242c]">
        <div class="flex justify-between items-center mb-2">
          <span class="font-bold text-sm">Total</span>
          <span class="text-lg font-black text-[#e27246]">{{ ordersStore.totalAccumulated.toFixed(2) }}€</span>
        </div>
        <p class="text-[11px] text-gray-500 dark:text-gray-400">El camarero cobrará cuando termines</p>
      </div>
    </div>

    <!-- Desktop: Sidebar card -->
    <div class="hidden md:flex flex-col bg-white dark:bg-[#2d313a] rounded-xl shadow-lg border border-[#f2ebe8] dark:border-gray-700 overflow-hidden max-h-96">
      <div class="p-4 border-b border-[#f2ebe8] dark:border-gray-700 bg-gradient-to-r from-[#e27246] to-[#d4603d] text-white">
        <h3 class="font-bold">📋 Tu Resumen</h3>
        <p class="text-[11px] text-white/80 mt-1">Pedidos acumulados</p>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-2">
        <div v-for="item in ordersStore.itemsWithQuantities" :key="`${item.id}-summary`" class="flex justify-between text-xs">
          <span class="text-[#946451] dark:text-gray-400 flex-1 truncate">
            {{ item.cantidad }}x {{ item.nombre }}
          </span>
          <span class="font-semibold whitespace-nowrap ml-2">{{ (item.precioTotal * item.cantidad).toFixed(2) }}€</span>
        </div>
      </div>

      <div class="border-t border-[#f2ebe8] dark:border-gray-700 p-4 bg-gray-50 dark:bg-[#21242c]">
        <div class="flex justify-between items-center mb-3">
          <span class="font-bold">Total</span>
          <span class="text-xl font-black text-[#e27246]">{{ ordersStore.totalAccumulated.toFixed(2) }}€</span>
        </div>
        <p class="text-[10px] text-gray-500 dark:text-gray-400">El camarero cobrará cuando termines</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useOrdersStore } from '../store/orders'

const ordersStore = useOrdersStore()

const itemCount = computed(() => ordersStore.itemsWithQuantities.length)
</script>

<style scoped>
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #e27246;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d4603d;
}
</style>

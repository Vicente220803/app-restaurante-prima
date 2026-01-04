<template>
  <div class="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
    <!-- Imagen del producto -->
    <div class="relative">
      <div class="aspect-square bg-neutral-50 flex items-center justify-center">
        <ChefHat class="w-16 h-16 text-neutral-300" />
      </div>

      <!-- Badge de disponibilidad -->
      <div v-if="!producto.disponible" class="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
        No disponible
      </div>
    </div>

    <!-- Contenido -->
    <div class="p-6">
      <!-- Categoría -->
      <div v-if="producto.categoria_nombre" class="mb-3">
        <span class="inline-block bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
          {{ producto.categoria_nombre }}
        </span>
      </div>

      <!-- Nombre -->
      <h3 class="text-xl font-bold text-neutral-900 mb-2 line-clamp-2">
        {{ producto.nombre }}
      </h3>

      <!-- Descripción -->
      <p v-if="producto.descripcion" class="text-neutral-600 text-sm mb-4 line-clamp-2">
        {{ producto.descripcion }}
      </p>

      <!-- Precio y botón -->
      <div class="flex items-center justify-between">
        <span class="text-2xl font-bold text-green-600">
          {{ producto.precio_base }}€
        </span>
        <button
          @click="agregarProducto"
          class="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          Añadir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChefHat, Plus } from 'lucide-vue-next'
import { useCarritoStore } from '../store/carrito'

const props = defineProps({
  producto: {
    type: Object,
    required: true
  }
})

const carritoStore = useCarritoStore()

const agregarProducto = () => {
  if (!props.producto.disponible) return
  carritoStore.agregarProducto({
    ...props.producto,
    cantidad: 1,
    precio_unitario: props.producto.precio_base,
    opciones_seleccionadas: {}
  })
}

</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
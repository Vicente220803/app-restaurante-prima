<template>
  <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md mb-2 sm:mb-4 overflow-hidden border border-gray-100 h-full">
    <!-- Imagen del producto -->
    <div class="relative">
      <div class="aspect-square sm:aspect-video bg-neutral-50 flex items-center justify-center">
        <span class="material-symbols-outlined text-4xl sm:text-6xl text-neutral-300">restaurant</span>
      </div>

      <!-- Badge de disponibilidad -->
      <div v-if="!producto.disponible" class="absolute top-2 sm:top-4 right-2 sm:right-4 bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium shadow-lg">
        No disponible
      </div>
    </div>

    <!-- Contenido -->
    <div class="p-2 sm:p-4 flex flex-col h-full">
      <!-- Categoría -->
      <div v-if="producto.categoria_nombre" class="mb-1 sm:mb-2">
        <span class="inline-block bg-gray-200 text-gray-700 text-xs sm:text-sm font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          {{ producto.categoria_nombre }}
        </span>
      </div>

      <!-- Nombre -->
      <h3 class="text-sm sm:text-lg font-bold text-neutral-900 mb-0.5 sm:mb-1 line-clamp-2">
        {{ producto.nombre }}
      </h3>

      <!-- Descripción -->
      <p v-if="producto.descripcion" class="text-neutral-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2 h-auto sm:h-10">
        {{ producto.descripcion }}
      </p>

      <!-- Precio y botón -->
      <div class="flex items-center justify-between mt-auto gap-1 sm:gap-2">
        <span class="text-lg sm:text-xl font-bold text-green-600">
          {{ producto.precio_base }}€
        </span>
        <button
          @click.stop="manejarClickAñadir"
          :disabled="!producto.disponible"
          class="bg-orange-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-lg hover:bg-orange-600 transition-colors font-medium text-xs sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <span class="hidden sm:inline">Añadir</span>
          <span class="sm:hidden">+</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  producto: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const manejarClickAñadir = () => {
  if (!props.producto.disponible) return
  emit('click')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>


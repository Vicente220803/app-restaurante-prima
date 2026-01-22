<template>
  <div class="sticky top-[88px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
    <div class="max-w-2xl mx-auto px-4">
      <div class="flex space-x-2 py-3 overflow-x-auto scrollbar-hide">
        <button
          v-for="categoria in categorias"
          :key="categoria.id"
          @click="categoriaSeleccionada = categoria.id; $emit('categoriaChanged', categoria)"
          :class="[
            'flex-shrink-0 px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap',
            categoriaSeleccionada === categoria.id
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ categoria.nombre }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  categorias: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['categoriaChanged'])

const categoriaSeleccionada = ref(null)
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
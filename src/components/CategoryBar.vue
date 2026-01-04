<template>
  <div class="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-100 shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex space-x-1 py-4 overflow-x-auto scrollbar-hide">
        <button
          v-for="categoria in categorias"
          :key="categoria"
          @click="categoriaSeleccionada = categoria; $emit('categoriaChanged', categoria)"
          :class="[
            'flex-shrink-0 px-6 py-3 rounded-3xl font-medium text-sm transition-all duration-200 whitespace-nowrap',
            categoriaSeleccionada === categoria
              ? 'bg-primary-600 text-white shadow-lg transform scale-105'
              : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:text-primary-600'
          ]"
        >
          {{ categoria }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  categorias: {
    type: Array,
    default: () => []
  },
  categoriaInicial: {
    type: String,
    default: 'Todos'
  }
})

const emit = defineEmits(['categoriaChanged'])

const categoriaSeleccionada = ref(props.categoriaInicial)

watch(() => props.categoriaInicial, (newVal) => {
  categoriaSeleccionada.value = newVal
})
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
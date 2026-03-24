<template>
  <div v-if="mostrar" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div class="bg-[#0a0a0a] rounded-2xl border-2 border-[#2d2d2d] max-w-md w-full overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-[#f97316] to-[#d97706] px-6 py-4 border-b-2 border-[#2d2d2d]">
        <h2 class="text-white font-bold text-lg flex items-center gap-2">
          <span class="material-symbols-outlined">warning</span>
          {{ titulo }}
        </h2>
      </div>

      <!-- Contenido -->
      <div class="p-6 space-y-4">
        <p class="text-gray-300">{{ mensaje }}</p>

        <!-- Comparación de valores (si aplica) -->
        <div v-if="mostrarComparacion" class="bg-[#1f1f1f] p-4 rounded-lg border border-[#2d2d2d] space-y-3">
          <div v-for="(item, idx) in comparacion" :key="idx" class="space-y-1">
            <p class="text-xs font-bold text-gray-400 uppercase">{{ item.label }}</p>
            <div class="flex gap-2 items-center">
              <div class="flex-1 px-2 py-1 bg-red-900/20 rounded text-red-400 text-sm">
                {{ item.antes }}
              </div>
              <span class="text-gray-500">→</span>
              <div class="flex-1 px-2 py-1 bg-green-900/20 rounded text-green-400 text-sm">
                {{ item.despues }}
              </div>
            </div>
          </div>
        </div>

        <p v-if="mensajeAlerta" class="text-sm text-yellow-400 flex gap-2 items-start">
          <span class="material-symbols-outlined text-base mt-0.5">info</span>
          {{ mensajeAlerta }}
        </p>
      </div>

      <!-- Botones -->
      <div class="p-4 bg-[#0a0a0a] border-t-2 border-[#2d2d2d] flex gap-3">
        <button
          @click="cancelar"
          class="flex-1 px-4 py-3 rounded-lg font-bold transition-all text-white border-2"
          style="border-color: #f97316; color: #f97316; background-color: rgba(249, 115, 22, 0.1);"
          @mouseenter="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.2)'"
          @mouseleave="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.1)'"
        >
          Cancelar
        </button>
        <button
          @click="confirmar"
          :disabled="cargando"
          class="flex-1 px-4 py-3 rounded-lg font-bold transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style="background: linear-gradient(135deg, #f97316 0%, #d97706 100%);"
          @mouseenter="!cargando && ($event.target.style.opacity = '0.9')"
          @mouseleave="!cargando && ($event.target.style.opacity = '1')"
        >
          <span v-if="cargando" class="material-symbols-outlined animate-spin text-sm">refresh</span>
          {{ cargando ? 'Guardando...' : 'Confirmar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  mostrar: {
    type: Boolean,
    default: false
  },
  titulo: {
    type: String,
    default: '¿Confirmar acción?'
  },
  mensaje: {
    type: String,
    default: '¿Estás seguro de que deseas continuar?'
  },
  mensajeAlerta: {
    type: String,
    default: ''
  },
  comparacion: {
    type: Array,
    default: null
  },
  mostrarComparacion: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirmar', 'cancelar'])

const cargando = ref(false)

const confirmar = async () => {
  cargando.value = true
  try {
    emit('confirmar')
  } finally {
    cargando.value = false
  }
}

const cancelar = () => {
  emit('cancelar')
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

<template>
  <div class="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg font-bold text-sm min-w-64 pointer-events-auto shadow-lg animate-slide-in',
          {
            'bg-green-900/30 border border-green-500 text-green-400': toast.type === 'success',
            'bg-red-900/30 border border-red-500 text-red-400': toast.type === 'error',
            'bg-blue-900/30 border border-blue-500 text-blue-400': toast.type === 'info',
            'bg-yellow-900/30 border border-yellow-500 text-yellow-400': toast.type === 'loading'
          }
        ]"
      >
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-base">
            {{ getIcon(toast.type) }}
          </span>
          {{ toast.message }}
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

const getIcon = (type) => {
  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    loading: 'refresh'
  }
  return icons[type] || 'notifications'
}

const addToast = (message, type = 'info', duration = 3000) => {
  const id = ++toastId
  const toast = { id, message, type }

  toasts.value.push(toast)

  if (duration > 0 && type !== 'loading') {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Exponer métodos globales
window.__toastContainer = {
  success: (msg) => addToast(msg, 'success', 3000),
  error: (msg) => addToast(msg, 'error', 4000),
  info: (msg) => addToast(msg, 'info', 3000),
  loading: (msg) => addToast(msg, 'loading', 0),
  dismiss: (id) => removeToast(id)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(400px);
  opacity: 0;
}

@keyframes slide-in {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease;
}

.material-symbols-outlined {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

[type="loading"] .material-symbols-outlined {
  animation: spin 1s linear infinite;
}

[type="success"] .material-symbols-outlined,
[type="error"] .material-symbols-outlined,
[type="info"] .material-symbols-outlined {
  animation: none;
}
</style>

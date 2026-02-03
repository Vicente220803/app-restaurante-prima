<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

// Estado
const pinDiario = ref('0000')
const exigirPin = ref(true)
const loading = ref(false)
const ultimaActualizacion = ref(null)

// Generar PIN aleatorio de 4 dígitos
const generarPinAleatorio = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Regenerar PIN
const regenerarPin = async () => {
  loading.value = true
  try {
    const nuevoPin = generarPinAleatorio()
    pinDiario.value = nuevoPin
    ultimaActualizacion.value = new Date()

    // Guardar en localStorage (en producción sería en Supabase)
    localStorage.setItem('pinDiarioClientes', nuevoPin)
    localStorage.setItem('pinDiarioFecha', ultimaActualizacion.value.toISOString())
    localStorage.setItem('exigirPinPedidos', exigirPin.value.toString())
  } catch (e) {
    console.error('Error regenerando PIN:', e)
  } finally {
    loading.value = false
  }
}

// Toggle exigir PIN
const toggleExigirPin = () => {
  exigirPin.value = !exigirPin.value
  localStorage.setItem('exigirPinPedidos', exigirPin.value.toString())
}

// Formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const d = new Date(fecha)
  const hoy = new Date()
  const esHoy = d.toDateString() === hoy.toDateString()
  const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return esHoy ? `Hoy, ${hora}` : d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) + ` ${hora}`
}

// Cerrar sesión
const cerrarSesion = () => {
  sessionStorage.removeItem('adminAuth')
  sessionStorage.removeItem('adminUser')
  router.push('/admin/login')
}

// Cargar configuración guardada
onMounted(() => {
  const pinGuardado = localStorage.getItem('pinDiarioClientes')
  const fechaGuardada = localStorage.getItem('pinDiarioFecha')
  const exigirGuardado = localStorage.getItem('exigirPinPedidos')

  if (pinGuardado) {
    pinDiario.value = pinGuardado
  } else {
    // Generar PIN inicial si no existe
    pinDiario.value = generarPinAleatorio()
    localStorage.setItem('pinDiarioClientes', pinDiario.value)
  }

  if (fechaGuardada) {
    ultimaActualizacion.value = new Date(fechaGuardada)
  } else {
    ultimaActualizacion.value = new Date()
    localStorage.setItem('pinDiarioFecha', ultimaActualizacion.value.toISOString())
  }

  if (exigirGuardado !== null) {
    exigirPin.value = exigirGuardado === 'true'
  }
})
</script>

<template>
  <div class="bg-[#0a0b0d] font-sans text-white min-h-screen flex">
    <!-- Sidebar de Navegación -->
    <aside class="w-64 border-r border-gray-800/50 bg-[#0f1115] flex flex-col shrink-0">
      <!-- Logo -->
      <div class="p-5 border-b border-gray-800/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e27246] to-[#c25f38] flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-xl">restaurant</span>
          </div>
          <div>
            <h1 class="font-black text-lg tracking-tight">La Toscana</h1>
            <p class="text-[10px] text-gray-500 uppercase tracking-widest">Sistema TPV</p>
          </div>
        </div>
      </div>

      <!-- Navegación -->
      <nav class="flex-1 p-4 space-y-2">
        <router-link
          to="/camarero"
          class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-xl transition-all"
        >
          <span class="material-symbols-outlined">table_restaurant</span>
          <span>SALÓN</span>
        </router-link>

        <router-link
          to="/admin/productos"
          class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-xl transition-all"
        >
          <span class="material-symbols-outlined">restaurant_menu</span>
          <span>PRODUCTOS</span>
        </router-link>

        <router-link
          to="/cocina"
          class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-xl transition-all"
        >
          <span class="material-symbols-outlined">soup_kitchen</span>
          <span>Cocina</span>
        </router-link>

        <router-link
          to="/gestion"
          class="flex items-center gap-3 px-4 py-3 bg-[#e27246]/10 text-[#e27246] rounded-xl font-semibold"
        >
          <span class="material-symbols-outlined">admin_panel_settings</span>
          <span>GESTIÓN</span>
        </router-link>
      </nav>

      <!-- Footer del sidebar -->
      <div class="p-4 border-t border-gray-800/50">
        <button
          @click="cerrarSesion"
          class="w-full py-3 border border-gray-700 text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-800 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-sm">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Contenido Principal -->
    <main class="flex-1 p-8 overflow-auto">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-black tracking-tight">Gestión de Seguridad</h1>
          <p class="text-gray-500 mt-1">Configura el acceso de clientes al menú digital</p>
        </div>

        <!-- Tarjeta PIN de Acceso Diario -->
        <div class="bg-gradient-to-br from-[#e27246] to-[#c25f38] rounded-2xl p-8 mb-6 relative overflow-hidden">
          <!-- Decoración de fondo -->
          <div class="absolute right-0 top-0 w-64 h-64 opacity-10">
            <span class="material-symbols-outlined text-[200px] -rotate-12">pin</span>
          </div>

          <div class="relative z-10">
            <p class="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">PIN de Acceso Diario</p>

            <div class="flex items-end justify-between">
              <div>
                <!-- PIN Display -->
                <div class="flex gap-3 mb-4">
                  <span
                    v-for="(digit, index) in pinDiario.split('')"
                    :key="index"
                    class="w-16 h-20 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-5xl font-black text-white"
                  >
                    {{ digit }}
                  </span>
                </div>

                <p class="text-white/80 text-sm max-w-md">
                  Este código es obligatorio para validar cada pedido desde el código QR si la restricción está activa. Se recomienda cambiarlo cada mañana.
                </p>
              </div>

              <div class="text-right">
                <button
                  @click="regenerarPin"
                  :disabled="loading"
                  class="px-6 py-3 bg-white text-[#e27246] font-bold rounded-xl hover:bg-white/90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <span class="material-symbols-outlined" :class="{ 'animate-spin': loading }">{{ loading ? 'progress_activity' : 'refresh' }}</span>
                  Regenerar PIN
                </button>
                <p v-if="ultimaActualizacion" class="text-white/60 text-xs mt-2">
                  Última actualización: {{ formatearFecha(ultimaActualizacion) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuraciones -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Toggle Exigir PIN -->
          <div class="bg-[#1a1d23] rounded-xl p-6 border border-gray-800/50">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                :class="exigirPin ? 'bg-[#e27246]/20' : 'bg-gray-800'">
                <span class="material-symbols-outlined text-2xl" :class="exigirPin ? 'text-[#e27246]' : 'text-gray-500'">
                  {{ exigirPin ? 'verified_user' : 'shield' }}
                </span>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-lg">Exigir PIN para pedidos</h3>
                <p class="text-gray-500 text-sm mt-1">Los clientes deben ingresar el PIN diario para confirmar su comanda.</p>
              </div>
              <button
                @click="toggleExigirPin"
                :class="[
                  'w-14 h-8 rounded-full transition-all relative',
                  exigirPin ? 'bg-[#e27246]' : 'bg-gray-700'
                ]"
              >
                <span
                  :class="[
                    'absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md',
                    exigirPin ? 'right-1' : 'left-1'
                  ]"
                ></span>
              </button>
            </div>
          </div>

          <!-- Estado del Sistema -->
          <div class="bg-[#1a1d23] rounded-xl p-6 border border-gray-800/50">
            <p class="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Estado del Sistema</p>
            <div class="flex items-center gap-3">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  :class="exigirPin ? 'bg-green-500' : 'bg-yellow-500'"></span>
                <span class="relative inline-flex rounded-full h-3 w-3"
                  :class="exigirPin ? 'bg-green-500' : 'bg-yellow-500'"></span>
              </span>
              <span :class="exigirPin ? 'text-green-500' : 'text-yellow-500'" class="font-bold">
                {{ exigirPin ? 'Seguridad Activa' : 'Seguridad Desactivada' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Info adicional -->
        <div class="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-blue-400">info</span>
            <div>
              <p class="text-blue-400 font-medium">¿Para qué sirve el PIN?</p>
              <p class="text-gray-400 text-sm mt-1">
                El PIN diario evita que personas fuera del restaurante puedan realizar pedidos fraudulentos escaneando códigos QR compartidos en redes sociales o fotos. Solo los clientes presentes en el local tendrán acceso al PIN actual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

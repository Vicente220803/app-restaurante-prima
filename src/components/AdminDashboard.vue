<template>
  <div class="flex flex-col min-h-screen" style="background-color: #0a0b0d; color: #f3f4f6;">
    <!-- Header con Logo y Usuario -->
    <header class="border-b" style="background-color: #0f1115; border-color: #1f1f1f;">
      <div class="flex items-center justify-between px-8 py-4">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg" style="background-color: #f97316;">
            <span class="material-symbols-outlined text-white text-2xl">dashboard_customize</span>
          </div>
          <div>
            <h1 class="text-lg font-extrabold tracking-tight">La Toscana</h1>
            <p class="text-[10px] uppercase tracking-widest font-bold" style="color: #f97316;">Sistema TPV</p>
          </div>
        </div>

        <!-- User Profile -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style="background-color: rgba(249, 115, 22, 0.2); color: #f97316;">
              {{ iniciales }}
            </div>
            <div>
              <p class="text-sm font-bold">{{ adminStore.nombre }}</p>
              <p class="text-xs capitalize" style="color: #6b7280;">{{ adminStore.rol }}</p>
            </div>
          </div>
          <button @click="cerrarSesion" class="text-gray-500 hover:text-red-400 transition-colors p-2" title="Cerrar sesion">
            <span class="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="px-8 border-t" style="border-color: #1f1f1f;">
        <div class="flex gap-1 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="tabActiva = tab.id"
            :class="[
              'flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
              tabActiva === tab.id
                ? 'border-[#f97316] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            ]"
          >
            <span class="material-symbols-outlined text-lg">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <!-- PANEL Tab -->
      <div v-if="tabActiva === 'panel'" class="p-8">
        <div class="max-w-7xl mx-auto">
          <!-- Header -->
          <header class="flex justify-between items-center mb-10">
            <div>
              <h2 class="text-3xl font-extrabold tracking-tight">Panel de Control</h2>
              <p style="color: #9ca3af;">Resumen de actividad en tiempo real</p>
            </div>
            <div class="flex items-center px-4 py-2 rounded-xl border" style="background-color: #1f1f1f; border-color: #2d2d2d;">
              <span class="material-symbols-outlined mr-2 text-xl" style="color: #9ca3af;">calendar_today</span>
              <span class="text-sm font-semibold">{{ fechaHoy }}</span>
            </div>
          </header>

          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Sales Card -->
            <div class="p-6 rounded-2xl relative overflow-hidden" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
              <div class="flex justify-between items-start mb-4">
                <div class="p-3 rounded-xl" style="background-color: rgba(249, 115, 22, 0.1);">
                  <span class="material-symbols-outlined" style="color: #f97316;">payments</span>
                </div>
                <span class="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1" style="background-color: rgba(34, 197, 94, 0.1); color: #22c55e;">
                  <span class="material-symbols-outlined text-sm">trending_up</span> +12.5%
                </span>
              </div>
              <p class="text-sm font-medium" style="color: #9ca3af;">Ventas Totales</p>
              <h3 class="text-2xl font-extrabold mt-1">2.450,80€</h3>
            </div>

            <!-- Active Orders Card -->
            <div class="p-6 rounded-2xl" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
              <div class="flex justify-between items-start mb-4">
                <div class="p-3 rounded-xl" style="background-color: rgba(34, 197, 94, 0.1);">
                  <span class="material-symbols-outlined" style="color: #22c55e;">receipt_long</span>
                </div>
                <span class="text-xs font-bold px-2 py-1 rounded-lg" style="background-color: #1f1f1f; color: #9ca3af;">En curso</span>
              </div>
              <p class="text-sm font-medium" style="color: #9ca3af;">Pedidos Activos</p>
              <h3 class="text-2xl font-extrabold mt-1">18</h3>
            </div>

            <!-- Table Occupancy Card -->
            <div class="p-6 rounded-2xl" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
              <div class="flex justify-between items-start mb-4">
                <div class="p-3 rounded-xl" style="background-color: rgba(59, 130, 246, 0.1);">
                  <span class="material-symbols-outlined" style="color: #3b82f6;">deck</span>
                </div>
              </div>
              <p class="text-sm font-medium" style="color: #9ca3af;">Ocupacion Mesas</p>
              <div class="flex items-end justify-between mt-1">
                <h3 class="text-2xl font-extrabold">85%</h3>
                <p class="text-xs pb-1" style="color: #6b7280;">22 de 26 mesas</p>
              </div>
            </div>
          </div>

          <!-- Recent Orders Table -->
          <div class="rounded-2xl overflow-hidden mb-8" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
            <div class="p-6 flex justify-between items-center" style="border-bottom: 1px solid #1f1f1f;">
              <h4 class="font-bold text-lg">Pedidos Recientes</h4>
              <button class="text-sm font-bold hover:underline" style="color: #f97316;">Ver todos</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="text-xs uppercase tracking-wider" style="color: #6b7280; border-bottom: 1px solid #1f1f1f;">
                    <th class="px-6 py-4 font-semibold">Pedido</th>
                    <th class="px-6 py-4 font-semibold">Mesa</th>
                    <th class="px-6 py-4 font-semibold">Estado</th>
                    <th class="px-6 py-4 font-semibold">Total</th>
                    <th class="px-6 py-4 font-semibold">Tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="transition-colors hover:bg-[#1f1f1f]/50" style="border-bottom: 1px solid #1f1f1f;">
                    <td class="px-6 py-4 font-medium">#1294</td>
                    <td class="px-6 py-4">Mesa 04</td>
                    <td class="px-6 py-4">
                      <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide" style="background-color: rgba(249, 115, 22, 0.1); color: #f97316;">
                        Preparando
                      </span>
                    </td>
                    <td class="px-6 py-4 font-bold">42,50€</td>
                    <td class="px-6 py-4 text-sm" style="color: #9ca3af;">12 min</td>
                  </tr>
                  <tr class="transition-colors hover:bg-[#1f1f1f]/50" style="border-bottom: 1px solid #1f1f1f;">
                    <td class="px-6 py-4 font-medium">#1293</td>
                    <td class="px-6 py-4">Mesa 12</td>
                    <td class="px-6 py-4">
                      <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide" style="background-color: rgba(34, 197, 94, 0.1); color: #22c55e;">
                        Listo
                      </span>
                    </td>
                    <td class="px-6 py-4 font-bold">28,00€</td>
                    <td class="px-6 py-4 text-sm" style="color: #9ca3af;">25 min</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- SALÓN Tab -->
      <div v-if="tabActiva === 'salon'" class="p-8">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-extrabold tracking-tight mb-6">Salón</h2>
          <CamareroView />
        </div>
      </div>

      <!-- PRODUCTOS Tab -->
      <div v-if="tabActiva === 'productos'" class="p-8">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-extrabold tracking-tight mb-6">Productos</h2>
          <AdminProductosView />
        </div>
      </div>

      <!-- COCINA Tab -->
      <div v-if="tabActiva === 'cocina'" class="p-8">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-extrabold tracking-tight mb-6">Cocina</h2>
          <CocinaView />
        </div>
      </div>

      <!-- GESTIÓN Tab -->
      <div v-if="tabActiva === 'gestion'" class="p-8">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-extrabold tracking-tight mb-6">Gestión</h2>
          <GestionView />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../store/admin'
import CamareroView from '../views/CamareroView.vue'
import AdminProductosView from '../views/AdminProductosView.vue'
import CocinaView from '../views/CocinaView.vue'
import GestionView from '../views/GestionView.vue'

const router = useRouter()
const adminStore = useAdminStore()

const tabActiva = ref('panel')

const tabs = [
  { id: 'salon', label: 'SALÓN', icon: 'table_restaurant' },
  { id: 'productos', label: 'PRODUCTOS', icon: 'restaurant_menu' },
  { id: 'cocina', label: 'COCINA', icon: 'soup_kitchen' },
  { id: 'gestion', label: 'GESTIÓN', icon: 'admin_panel_settings' },
  { id: 'panel', label: 'PANEL', icon: 'dashboard_customize' }
]

// Iniciales del nombre
const iniciales = computed(() => {
  const nombre = adminStore.nombre || 'Usuario'
  const partes = nombre.split(' ')
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
})

// Fecha de hoy
const fechaHoy = computed(() => {
  const fecha = new Date()
  const opciones = { day: 'numeric', month: 'short' }
  return `Hoy, ${fecha.toLocaleDateString('es-ES', opciones)}`
})

// Cerrar sesion
function cerrarSesion() {
  adminStore.logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

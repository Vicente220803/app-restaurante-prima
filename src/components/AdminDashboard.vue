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
            <h1 class="text-lg font-extrabold tracking-tight">Tu Restaurante</h1>
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
          <!-- Header con Botón Comenzar Turno -->
          <header class="flex justify-between items-center mb-10">
            <div>
              <h2 class="text-3xl font-extrabold tracking-tight">Panel de Control</h2>
              <p style="color: #9ca3af;">{{ horaTurno ? 'Turno en progreso' : 'Inicia un turno para comenzar' }}</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center px-4 py-2 rounded-xl border" style="background-color: #1f1f1f; border-color: #2d2d2d;">
                <span class="material-symbols-outlined mr-2 text-xl" style="color: #9ca3af;">calendar_today</span>
                <span class="text-sm font-semibold">{{ fechaHoy }}</span>
              </div>
              <button
                v-if="!horaTurno"
                @click="mostrarModalConfirmacionInicio = true"
                :disabled="cargando"
                class="px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2"
                style="background-color: #f97316;"
              >
                <span class="material-symbols-outlined">play_arrow</span>
                Comenzar Turno
              </button>
              <button
                v-else
                @click="mostrarModalConfirmacionFinal = true"
                class="px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2"
                style="background-color: #ef4444;"
              >
                <span class="material-symbols-outlined">stop_circle</span>
                Finalizar Turno
              </button>
              <button
                @click="abrirModalMesas"
                class="px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2"
                style="background-color: #3b82f6;"
              >
                <span class="material-symbols-outlined">chair</span>
                Mesas ({{ totalMesas }})
              </button>
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
                <span class="text-xs font-bold px-2 py-1 rounded-lg" style="background-color: rgba(34, 197, 94, 0.1); color: #22c55e;">
                  En turno
                </span>
              </div>
              <p class="text-sm font-medium" style="color: #9ca3af;">Ventas Totales</p>
              <h3 class="text-2xl font-extrabold mt-1">{{ ventasTotales.toFixed(2) }}€</h3>
            </div>

            <!-- Active Orders Card -->
            <div class="p-6 rounded-2xl" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
              <div class="flex justify-between items-start mb-4">
                <div class="p-3 rounded-xl" style="background-color: rgba(34, 197, 94, 0.1);">
                  <span class="material-symbols-outlined" style="color: #22c55e;">receipt_long</span>
                </div>
                <span class="text-xs font-bold px-2 py-1 rounded-lg" style="background-color: #1f1f1f; color: #9ca3af;">En progreso</span>
              </div>
              <p class="text-sm font-medium" style="color: #9ca3af;">Pedidos Activos</p>
              <h3 class="text-2xl font-extrabold mt-1">{{ pedidosActivos }}</h3>
            </div>

            <!-- Table Occupancy Card -->
            <div class="p-6 rounded-2xl" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
              <div class="flex justify-between items-start mb-4">
                <div class="p-3 rounded-xl" style="background-color: rgba(59, 130, 246, 0.1);">
                  <span class="material-symbols-outlined" style="color: #3b82f6;">deck</span>
                </div>
              </div>
              <p class="text-sm font-medium" style="color: #9ca3af;">Ocupación Mesas</p>
              <div class="flex items-end justify-between mt-1">
                <h3 class="text-2xl font-extrabold">{{ Math.round((mesasOcupadas / totalMesas) * 100) }}%</h3>
                <p class="text-xs pb-1" style="color: #6b7280;">{{ mesasOcupadas }} de {{ totalMesas }} mesas</p>
              </div>
            </div>
          </div>

          <!-- Recent Orders Table -->
          <div class="rounded-2xl overflow-hidden mb-8" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
            <div class="p-6 flex justify-between items-center" style="border-bottom: 1px solid #1f1f1f;">
              <h4 class="font-bold text-lg">Pedidos Recientes</h4>
              <span v-if="!horaTurno" class="text-xs" style="color: #6b7280;">Inicia un turno para ver pedidos</span>
            </div>
            <div v-if="pedidosRecientes.length > 0" class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="text-xs uppercase tracking-wider" style="color: #6b7280; border-bottom: 1px solid #1f1f1f;">
                    <th class="px-6 py-4 font-semibold">ID Pedido</th>
                    <th class="px-6 py-4 font-semibold">Mesa</th>
                    <th class="px-6 py-4 font-semibold">Estado</th>
                    <th class="px-6 py-4 font-semibold">Total</th>
                    <th class="px-6 py-4 font-semibold">Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in pedidosRecientes" :key="pedido.id" class="transition-colors hover:bg-[#1f1f1f]/50" style="border-bottom: 1px solid #1f1f1f;">
                    <td class="px-6 py-4 font-medium">{{ pedido.id.substring(0, 8) }}</td>
                    <td class="px-6 py-4">Mesa {{ pedido.mesa }}</td>
                    <td class="px-6 py-4">
                      <span
                        class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                        :style="{
                          backgroundColor:
                            pedido.estado === 'pendiente' ? 'rgba(249, 115, 22, 0.1)' :
                            pedido.estado === 'preparando' ? 'rgba(249, 115, 22, 0.1)' :
                            pedido.estado === 'listo' ? 'rgba(34, 197, 94, 0.1)' :
                            'rgba(34, 197, 94, 0.1)',
                          color:
                            pedido.estado === 'pendiente' ? '#f97316' :
                            pedido.estado === 'preparando' ? '#f97316' :
                            pedido.estado === 'listo' ? '#22c55e' :
                            '#22c55e'
                        }"
                      >
                        {{
                          pedido.estado === 'pendiente' ? 'Preparando' :
                          pedido.estado === 'preparando' ? 'Preparando' :
                          pedido.estado === 'listo' ? 'Listo' :
                          'Pagado'
                        }}
                      </span>
                    </td>
                    <td class="px-6 py-4 font-bold">{{ pedido.total.toFixed(2) }}€</td>
                    <td class="px-6 py-4">
                      <button
                        @click="abrirModalTicket(pedido)"
                        class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                        style="background-color: rgba(249, 115, 22, 0.2); color: #f97316;"
                        @mouseenter="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.3)'"
                        @mouseleave="$event.target.style.backgroundColor = 'rgba(249, 115, 22, 0.2)'"
                      >
                        <span class="material-symbols-outlined text-sm mr-1" style="vertical-align: -2px;">receipt_long</span>
                        Ver Ticket
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-8 text-center" style="color: #6b7280;">
              <span class="material-symbols-outlined text-4xl mb-2 block" style="color: #4b5563;">receipt_long</span>
              <p>No hay pedidos aún</p>
            </div>
          </div>
        </div>
      </div>

      <!-- SALÓN Tab -->
      <div v-if="tabActiva === 'salon'" class="p-8">
        <div class="max-w-7xl mx-auto">
          <CamareroView :key="tabActiva" />
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

      <!-- TICKETS Tab -->
      <div v-if="tabActiva === 'tickets'" class="p-8">
        <div class="max-w-7xl mx-auto">
          <TicketsView />
        </div>
      </div>

      <!-- QR Tab -->
      <div v-if="tabActiva === 'qr'" class="p-8">
        <div class="max-w-7xl mx-auto">
          <QRGeneratorView />
        </div>
      </div>
    </main>

    <!-- Modal Configurar Mesas -->
    <div v-if="mostrarModalMesas" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="bg-[#1f1f1f] w-full max-w-md rounded-2xl p-8 border border-white/10">
        <h3 class="text-2xl font-bold mb-6 flex items-center gap-3">
          <span class="material-symbols-outlined text-[#3b82f6]">chair</span>
          Configurar Mesas
        </h3>
        <p class="text-sm text-gray-400 mb-6">¿Cuántas mesas hay disponibles hoy en la sala?</p>

        <div class="flex items-center justify-center gap-6 mb-8">
          <button
            @click="mesasEditando > 1 && mesasEditando--"
            class="w-16 h-16 rounded-full bg-[#0a0a0a] hover:bg-white/10 flex items-center justify-center text-3xl font-bold transition-all"
          >
            -
          </button>
          <span class="text-5xl font-black text-[#3b82f6] w-24 text-center">{{ mesasEditando }}</span>
          <button
            @click="mesasEditando++"
            class="w-16 h-16 rounded-full bg-[#0a0a0a] hover:bg-white/10 flex items-center justify-center text-3xl font-bold transition-all"
          >
            +
          </button>
        </div>

        <div class="flex gap-3">
          <button
            @click="cerrarModalMesas"
            class="flex-1 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 font-bold hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="guardarMesas"
            class="flex-1 py-3 rounded-xl bg-[#3b82f6] text-white font-bold hover:bg-[#3b82f6]/90 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmación Inicio de Turno -->
    <div v-if="mostrarModalConfirmacionInicio" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-[#0f1115] rounded-2xl border border-[#2d2d2d] max-w-md w-full shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#f97316] to-[#d97706] px-6 py-6 text-center">
          <div class="flex justify-center mb-3">
            <span class="material-symbols-outlined text-5xl text-white">schedule</span>
          </div>
          <h2 class="text-2xl font-extrabold text-white tracking-tight">Iniciar Turno</h2>
        </div>

        <!-- Content -->
        <div class="px-6 py-8 text-center space-y-6">
          <div>
            <p class="text-white text-lg font-semibold mb-2">¿Vas a empezar turno?</p>
            <p class="text-gray-400 text-sm leading-relaxed">
              Se limpiarán todas las mesas y comenzaremos a contar desde cero
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              @click="cancelarComienzoDeTurno"
              class="flex-1 px-4 py-3 bg-[#1f1f1f] hover:bg-[#2d2d2d] text-white font-bold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="confirmarComienzoDeTurno"
              :disabled="cargando"
              class="flex-1 px-4 py-3 bg-[#f97316] hover:bg-[#d97706] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              <span v-if="cargando" class="material-symbols-outlined animate-spin mr-1">progress_activity</span>
              <span v-else>Confirmar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmación Finalización de Turno -->
    <div v-if="mostrarModalConfirmacionFinal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-[#0f1115] rounded-2xl border border-[#2d2d2d] max-w-md w-full shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#ef4444] to-[#dc2626] px-6 py-6 text-center">
          <div class="flex justify-center mb-3">
            <span class="material-symbols-outlined text-5xl text-white">stop_circle</span>
          </div>
          <h2 class="text-2xl font-extrabold text-white tracking-tight">Finalizar Turno</h2>
        </div>

        <!-- Content -->
        <div class="px-6 py-8 text-center space-y-6">
          <div>
            <p class="text-white text-lg font-semibold mb-2">¿Estás seguro?</p>
            <p class="text-gray-400 text-sm leading-relaxed">
              Se cerrará el turno y no se podrán contabilizar más mesas hasta iniciar un nuevo turno
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              @click="cancelarFinalizacionDeTurno"
              class="flex-1 px-4 py-3 bg-[#1f1f1f] hover:bg-[#2d2d2d] text-white font-bold rounded-lg transition-colors"
            >
              No, Continuar
            </button>
            <button
              @click="confirmarFinalizacionDeTurno"
              :disabled="cargando"
              class="flex-1 px-4 py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              <span v-if="cargando" class="material-symbols-outlined animate-spin mr-1">progress_activity</span>
              <span v-else>Sí, Finalizar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ticket Detallado -->
    <div v-if="mostrarModalTicket && pedidoSeleccionado" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-[#0f1115] rounded-2xl border border-[#2d2d2d] max-w-lg w-full shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#f97316] to-[#d97706] px-6 py-6">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-extrabold text-white tracking-tight">Ticket de Pedido</h2>
              <p class="text-white/80 text-sm mt-1">Mesa {{ pedidoSeleccionado.mesa }}</p>
            </div>
            <button
              @click="cerrarModalTicket"
              class="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <span class="material-symbols-outlined text-white">close</span>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 max-h-[70vh] overflow-y-auto">
          <!-- Información del pedido -->
          <div class="mb-6 pb-6 border-b border-[#2d2d2d]">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-400">ID Pedido</p>
                <p class="text-white font-semibold">{{ pedidoSeleccionado.id.substring(0, 12) }}</p>
              </div>
              <div>
                <p class="text-gray-400">Estado</p>
                <p class="text-white font-semibold capitalize">{{ pedidoSeleccionado.estado }}</p>
              </div>
            </div>
          </div>

          <!-- Detalle de items -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-white mb-4">Artículos Pedidos</h3>
            <div v-if="pedidoSeleccionado.items && pedidoSeleccionado.items.length > 0" class="space-y-3">
              <div
                v-for="(item, index) in pedidoSeleccionado.items"
                :key="index"
                class="flex justify-between items-start p-3 rounded-lg bg-[#1f1f1f] border border-[#2d2d2d]"
              >
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-[#f97316]">{{ item.cantidad }}x</span>
                    <p class="text-white font-semibold">{{ item.nombre }}</p>
                  </div>
                  <p v-if="item.opciones" class="text-xs text-gray-400 mt-1 ml-6">+ {{ item.opciones }}</p>
                </div>
                <p class="text-white font-bold ml-4">{{ (item.precio * item.cantidad).toFixed(2) }}€</p>
              </div>
            </div>
            <div v-else class="p-4 text-center text-gray-400">
              <p>No hay artículos en este pedido</p>
            </div>
          </div>

          <!-- Resumen de totales -->
          <div class="p-4 rounded-lg bg-[#1f1f1f] border border-[#2d2d2d]">
            <div class="flex justify-between items-center">
              <span class="text-white font-bold">Total</span>
              <span class="text-2xl font-extrabold text-[#f97316]">{{ pedidoSeleccionado.total.toFixed(2) }}€</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-[#2d2d2d] flex gap-3">
          <button
            @click="cerrarModalTicket"
            class="flex-1 px-4 py-3 bg-[#1f1f1f] hover:bg-[#2d2d2d] text-white font-bold rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button
            class="flex-1 px-4 py-3 bg-[#f97316] hover:bg-[#d97706] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-lg">print</span>
            Imprimir Ticket
          </button>
        </div>
      </div>

      <!-- Modal Resultado Envío Email -->
      <div v-if="mostrarResultadoEmail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div class="bg-[#0f1115] rounded-2xl border border-[#2d2d2d] max-w-md w-full shadow-2xl overflow-hidden">
          <!-- Header -->
          <div :class="[
            'px-6 py-6 text-center',
            resultadoEmail.success
              ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a]'
              : 'bg-gradient-to-r from-[#ef4444] to-[#dc2626]'
          ]">
            <div class="flex justify-center mb-3">
              <span class="material-symbols-outlined text-5xl text-white">
                {{ resultadoEmail.success ? 'mark_email_read' : 'error' }}
              </span>
            </div>
            <h2 class="text-2xl font-extrabold text-white tracking-tight">
              {{ resultadoEmail.success ? 'Correo Enviado' : 'Error al Enviar' }}
            </h2>
          </div>

          <!-- Content -->
          <div class="px-6 py-8 text-center space-y-4">
            <p class="text-white text-lg font-semibold">
              {{ resultadoEmail.message }}
            </p>
            <p v-if="resultadoEmail.success" class="text-gray-400 text-sm">
              El resumen de ventas del turno ha sido enviado a tu correo electrónico.
            </p>
          </div>

          <!-- Footer -->
          <div class="p-6 border-t border-[#2d2d2d]">
            <button
              @click="mostrarResultadoEmail = false"
              class="w-full px-4 py-3 bg-[#f97316] hover:bg-[#d97706] text-white font-bold rounded-lg transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '../store/admin'
import { supabase } from '../supabase'
import { initializeEmailJS, enviarResumenVentas } from '../services/emailService'
import CamareroView from '../views/CamareroView.vue'
import AdminProductosView from '../views/AdminProductosView.vue'
import CocinaView from '../views/CocinaView.vue'
import GestionView from '../views/GestionView.vue'
import QRGeneratorView from '../views/QRGeneratorView.vue'
import TicketsView from '../views/TicketsView.vue'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

const tabActiva = ref('panel')

const tabs = [
  { id: 'salon', label: 'SALÓN', icon: 'table_restaurant' },
  { id: 'productos', label: 'PRODUCTOS', icon: 'restaurant_menu' },
  { id: 'cocina', label: 'COCINA', icon: 'soup_kitchen' },
  { id: 'gestion', label: 'GESTIÓN', icon: 'admin_panel_settings' },
  { id: 'tickets', label: 'TICKETS', icon: 'receipt_long' },
  { id: 'qr', label: 'QR', icon: 'qr_code' },
  { id: 'panel', label: 'PANEL', icon: 'dashboard_customize' }
]

// Estado del turno y métricas
const horaTurno = ref(null)
const ventasTotales = ref(0)
const pedidosActivos = ref(0)
const mesasOcupadas = ref(0)
const totalMesas = ref(13)
const pedidosRecientes = ref([])
const cargando = ref(false)
const mostrarModalMesas = ref(false)
const mesasEditando = ref(13)
const mostrarModalConfirmacionInicio = ref(false)
const mostrarModalConfirmacionFinal = ref(false)
const turnoFinalizado = ref(false)
const mostrarModalTicket = ref(false)
const pedidoSeleccionado = ref(null)
const mostrarResultadoEmail = ref(false)
const resultadoEmail = ref({ success: false, message: '' })
let subscription = null

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

// Cargar métricas del turno
async function cargarMetricas() {
  if (!horaTurno.value) return

  try {
    // Consultar pedidos del turno actual
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('id, mesa, total, estado, created_at, items')
      .gte('created_at', new Date(horaTurno.value).toISOString())
      .order('created_at', { ascending: false })

    if (pedidos) {
      // Pedidos activos (pendientes, preparando o listos)
      pedidosActivos.value = pedidos.filter(p => ['pendiente', 'preparando', 'listo'].includes(p.estado)).length

      // Ventas totales (solo pagados)
      ventasTotales.value = pedidos
        .filter(p => p.estado === 'pagado')
        .reduce((sum, p) => sum + (p.total || 0), 0)

      // Mesas ocupadas (únicas con pedidos pendientes, preparando o listos)
      const mesasUnicas = new Set(
        pedidos
          .filter(p => ['pendiente', 'preparando', 'listo'].includes(p.estado))
          .map(p => p.mesa)
      )
      mesasOcupadas.value = mesasUnicas.size

      // Pedidos recientes
      pedidosRecientes.value = pedidos.slice(0, 5)
    }
  } catch (error) {
    console.error('Error cargando métricas:', error)
  }
}

// Confirmar y comenzar turno
async function confirmarComienzoDeTurno() {
  mostrarModalConfirmacionInicio.value = false
  turnoFinalizado.value = false
  cargando.value = true

  try {
    // Limpiar todas las mesas (eliminar pedidos pendientes de la BD)
    await supabase
      .from('pedidos')
      .delete()
      .eq('estado', 'pendiente')

    horaTurno.value = new Date()
    ventasTotales.value = 0
    pedidosActivos.value = 0
    mesasOcupadas.value = 0
    pedidosRecientes.value = []

    // Guardar hora en sessionStorage para persistencia
    sessionStorage.setItem('horaTurno', horaTurno.value.toISOString())
    sessionStorage.removeItem('turnoFinalizado')

    await cargarMetricas()
    suscribirseACambios()
  } catch (error) {
    console.error('Error al comenzar turno:', error)
  } finally {
    cargando.value = false
  }
}

// Cancelar inicio de turno
function cancelarComienzoDeTurno() {
  mostrarModalConfirmacionInicio.value = false
}

// Confirmar y finalizar turno
async function confirmarFinalizacionDeTurno() {
  mostrarModalConfirmacionFinal.value = false
  cargando.value = true

  try {
    const horaFin = new Date()
    const horaInicio = horaTurno.value ? new Date(horaTurno.value) : new Date()

    // Obtener datos del turno para el correo
    const nombreGerente = adminStore.nombre || 'Gerente'
    const email = adminStore.email || 'gerente@latoscana.es'

    // Formatear fechas y horas
    const fechaTurno = horaInicio.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const horaInicioStr = horaInicio.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
    const horaFinStr = horaFin.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Contar número de pedidos pagados
    const { data: pedidosPagados } = await supabase
      .from('pedidos')
      .select('id, mesa')
      .eq('estado', 'pagado')
      .gte('created_at', horaInicio.toISOString())

    const numPedidos = pedidosPagados?.length || 0
    const numMesasUnicas = new Set(pedidosPagados?.map(p => p.mesa) || []).size

    // Enviar correo con resumen de ventas
    const resultadoEnvio = await enviarResumenVentas({
      email,
      nombreGerente,
      ventasTotales: ventasTotales.value.toFixed(2),
      fechaTurno,
      horaInicio: horaInicioStr,
      horaFin: horaFinStr,
      numPedidos,
      numMesas: numMesasUnicas
    })

    // Guardar resultado para mostrar al usuario
    resultadoEmail.value = resultadoEnvio
    mostrarResultadoEmail.value = true

    // Finalizar turno
    horaTurno.value = null
    turnoFinalizado.value = true
    sessionStorage.removeItem('horaTurno')
    sessionStorage.setItem('turnoFinalizado', 'true')

    // No permitir nuevas operaciones hasta que inicie un nuevo turno
    if (subscription) subscription.unsubscribe()
  } catch (error) {
    console.error('Error al finalizar turno:', error)
    resultadoEmail.value = {
      success: false,
      message: 'Error al finalizar el turno'
    }
    mostrarResultadoEmail.value = true
  } finally {
    cargando.value = false
  }
}

// Cancelar finalización de turno
function cancelarFinalizacionDeTurno() {
  mostrarModalConfirmacionFinal.value = false
}

// Suscribirse a cambios en tiempo real
function suscribirseACambios() {
  if (subscription) subscription.unsubscribe()

  subscription = supabase
    .channel('pedidos-cambios')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pedidos'
      },
      () => {
        cargarMetricas()
      }
    )
    .subscribe()
}

// Cargar hora de turno al montar
onMounted(() => {
  // Inicializar EmailJS
  initializeEmailJS()

  // Cargar tab activa desde URL si existe
  const tabParam = route.query.tab
  if (tabParam && tabs.some(t => t.id === tabParam)) {
    tabActiva.value = tabParam
  }

  // Cargar número de mesas guardado
  const mesasGuardadas = sessionStorage.getItem('totalMesas')
  if (mesasGuardadas) {
    totalMesas.value = parseInt(mesasGuardadas)
  }

  // Cargar estado del turno finalizado
  const turnoFinalizadoGuardado = sessionStorage.getItem('turnoFinalizado')
  if (turnoFinalizadoGuardado === 'true') {
    turnoFinalizado.value = true
    horaTurno.value = null
  } else {
    const horaGuardada = sessionStorage.getItem('horaTurno')
    if (horaGuardada) {
      horaTurno.value = new Date(horaGuardada)
      cargarMetricas()
      suscribirseACambios()
    }
  }
})

// Limpiar suscripción al desmontar
onUnmounted(() => {
  if (subscription) subscription.unsubscribe()
})

// Configurar número de mesas
function abrirModalMesas() {
  mesasEditando.value = totalMesas.value
  mostrarModalMesas.value = true
}

function cerrarModalMesas() {
  mostrarModalMesas.value = false
}

function guardarMesas() {
  if (mesasEditando.value > 0) {
    totalMesas.value = mesasEditando.value
    sessionStorage.setItem('totalMesas', mesasEditando.value)
    mostrarModalMesas.value = false
  }
}

// Abrir modal del ticket
function abrirModalTicket(pedido) {
  pedidoSeleccionado.value = pedido
  mostrarModalTicket.value = true
}

// Cerrar modal del ticket
function cerrarModalTicket() {
  mostrarModalTicket.value = false
  pedidoSeleccionado.value = null
}

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

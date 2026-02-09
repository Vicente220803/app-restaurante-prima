<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../supabase'
import { useAdminStore } from '../store/admin'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

// Estado
const mesa = ref(null)
const pedidos = ref([])
const loading = ref(true)

// Descuento
const mostrarDescuento = ref(false)
const tipoDescuento = ref('porcentaje') // 'porcentaje' o 'dinero'
const valorDescuento = ref(0)
const codigoCupon = ref('')

// División de cuenta
const tipoDivision = ref(null) // null, 'personas' o 'articulo'
const numeroPersonas = ref(2)
const itemsSeleccionados = ref([])
const personaActual = ref(1)
const mostrarModalPersonas = ref(false)

// Método de pago
const metodoPago = ref(null) // 'efectivo' o 'tarjeta'

// Modal de éxito
const mostrarExito = ref(false)
const emailCliente = ref('')

// Configuración de mesas
const configuracionMesas = [
  { id: '1', nombre: 'M1', capacidad: 2 }, { id: '2', nombre: 'M2', capacidad: 2 },
  { id: '3', nombre: 'M3', capacidad: 4 }, { id: '4', nombre: 'M4', capacidad: 4 },
  { id: '5', nombre: 'M5', capacidad: 4 }, { id: '6', nombre: 'M6', capacidad: 6 },
  { id: '7', nombre: 'M7', capacidad: 6 }, { id: '8', nombre: 'M8', capacidad: 8 },
  { id: '9', nombre: 'M9', capacidad: 8 }, { id: '10', nombre: 'M10', capacidad: 10 },
  { id: '11', nombre: 'T1', capacidad: 4 }, { id: '12', nombre: 'T2', capacidad: 4 },
  { id: '13', nombre: 'T3', capacidad: 6 }
]

// Items de la cuenta
const itemsCuenta = computed(() => {
  const items = []
  pedidos.value.forEach(pedido => {
    if (pedido.items && Array.isArray(pedido.items)) {
      pedido.items.forEach((item, index) => {
        items.push({
          ...item,
          pedidoId: pedido.id,
          itemIndex: index,
          uniqueId: `${pedido.id}-${index}`
        })
      })
    }
  })
  return items
})

// Subtotal (sin descuento ni IVA)
const subtotal = computed(() => {
  return itemsCuenta.value.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
})

// IVA (10%)
const iva = computed(() => {
  return subtotal.value * 0.10
})

// Calcular descuento aplicado
const descuentoAplicado = computed(() => {
  if (valorDescuento.value <= 0) return 0
  if (tipoDescuento.value === 'porcentaje') {
    return subtotal.value * (valorDescuento.value / 100)
  }
  return Math.min(valorDescuento.value, subtotal.value)
})

// Total final
const totalFinal = computed(() => {
  return Math.max(0, subtotal.value + iva.value - descuentoAplicado.value)
})

// Redondeo hacia arriba con 2 decimales
const redondearArriba = (numero) => {
  return Math.ceil(numero * 100) / 100
}

// Total por persona (si se divide)
const totalPorPersona = computed(() => {
  if (!tipoDivision.value || tipoDivision.value !== 'personas' || numeroPersonas.value < 2) {
    return totalFinal.value
  }
  return redondearArriba(totalFinal.value / numeroPersonas.value)
})

// Items seleccionados total (para división por artículo)
const totalItemsSeleccionados = computed(() => {
  return itemsSeleccionados.value.reduce((acc, uniqueId) => {
    const item = itemsCuenta.value.find(i => i.uniqueId === uniqueId)
    if (item) {
      return acc + (item.precio * item.cantidad)
    }
    return acc
  }, 0)
})

// Saldo pendiente
const saldoPendiente = computed(() => {
  if (tipoDivision.value === 'personas') {
    return totalPorPersona.value
  }
  if (tipoDivision.value === 'articulo' && itemsSeleccionados.value.length > 0) {
    return totalItemsSeleccionados.value
  }
  return totalFinal.value
})

// Cargar datos de la mesa
const cargarDatos = async () => {
  try {
    const mesaId = route.params.mesaId
    mesa.value = configuracionMesas.find(m => m.id === mesaId) || { id: mesaId, nombre: `Mesa ${mesaId}`, capacidad: 4 }

    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('mesa', mesaId)
      .in('estado', ['pendiente', 'preparando', 'listo', 'servido', 'cuenta'])
      .order('created_at', { ascending: true })

    if (error) throw error
    pedidos.value = data || []
  } catch (e) {
    console.error('Error cargando datos:', e)
  } finally {
    loading.value = false
  }
}

// Volver atrás (según el rol)
const volverAtras = () => {
  const rutaPorRol = {
    'camarero': '/camarero',
    'gerente': '/admin/dashboard',
    'admin': '/admin/dashboard'
  }
  // Leer rol del store o de sessionStorage como fallback
  let rol = adminStore.rol
  if (!rol) {
    const userData = JSON.parse(sessionStorage.getItem('adminUser') || '{}')
    rol = userData.rol || 'camarero'
  }
  router.push(rutaPorRol[rol] || '/camarero')
}

// Seleccionar división por persona
const seleccionarDivisionPersonas = () => {
  tipoDivision.value = 'personas'
  mostrarModalPersonas.value = true
}

// Seleccionar división por artículo
const seleccionarDivisionArticulo = () => {
  tipoDivision.value = 'articulo'
  itemsSeleccionados.value = []
}

// Toggle selección de item
const toggleItemSeleccionado = (uniqueId) => {
  if (tipoDivision.value !== 'articulo') return
  const index = itemsSeleccionados.value.indexOf(uniqueId)
  if (index === -1) {
    itemsSeleccionados.value.push(uniqueId)
  } else {
    itemsSeleccionados.value.splice(index, 1)
  }
}

// Cancelar división
const cancelarDivision = () => {
  tipoDivision.value = null
  itemsSeleccionados.value = []
  numeroPersonas.value = 2
  personaActual.value = 1
}

// Confirmar número de personas
const confirmarPersonas = () => {
  mostrarModalPersonas.value = false
}

// Seleccionar método de pago
const seleccionarMetodoPago = (metodo) => {
  metodoPago.value = metodo
}

// Aplicar cupón
const aplicarCupon = () => {
  mostrarDescuento.value = true
}

// Procesar pago
const procesarPago = async () => {
  if (!metodoPago.value) return

  try {
    // Si es división por personas
    if (tipoDivision.value === 'personas') {
      if (personaActual.value < numeroPersonas.value) {
        personaActual.value++
        metodoPago.value = null
        return
      }
    }

    // Si es división por artículo
    if (tipoDivision.value === 'articulo') {
      const itemsRestantes = itemsCuenta.value.filter(i => !itemsSeleccionados.value.includes(i.uniqueId))
      if (itemsRestantes.length > 0) {
        itemsSeleccionados.value = []
        metodoPago.value = null
        return
      }
    }

    // Mostrar modal de éxito
    mostrarExito.value = true
  } catch (e) {
    console.error('Error procesando pago:', e)
  }
}

// Finalizar y volver a mesas
const finalizarYVolver = async () => {
  try {
    // Marcar todos los pedidos como pagados
    for (const pedido of pedidos.value) {
      await supabase.from('pedidos').update({ estado: 'pagado' }).eq('id', pedido.id)
    }

    // Redirigir según el rol
    const rutaPorRol = {
      'camarero': '/camarero',
      'gerente': '/admin/dashboard',
      'admin': '/admin/dashboard'
    }
    // Leer rol del store o de sessionStorage como fallback
    let rol = adminStore.rol
    if (!rol) {
      const userData = JSON.parse(sessionStorage.getItem('adminUser') || '{}')
      rol = userData.rol || 'camarero'
    }
    router.push(rutaPorRol[rol] || '/camarero')
  } catch (e) {
    console.error('Error finalizando:', e)
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div class="bg-[#1c1e21] font-sans text-white min-h-screen flex flex-col">
    <!-- Header -->
    <header class="flex items-center justify-between border-b border-white/10 px-8 py-4 bg-[#1c1e21]/80 sticky top-0 z-50 backdrop-blur-xl">
      <div class="flex items-center gap-4">
        <div class="w-8 h-8 bg-[#ff7b00] rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-xl">restaurant</span>
        </div>
        <h2 class="text-xl font-bold tracking-tight">La Toscana <span class="text-[#ff7b00]">TPV</span></h2>
      </div>
      <div class="flex items-center gap-6">
        <nav class="hidden md:flex items-center gap-8">
          <router-link to="/camarero" class="text-sm font-medium hover:text-[#ff7b00] transition-colors">Mesas</router-link>
          <span class="text-sm font-medium text-[#ff7b00] border-b-2 border-[#ff7b00] pb-1">Cobrar</span>
          <router-link to="/admin/productos" class="text-sm font-medium hover:text-[#ff7b00] transition-colors">Productos</router-link>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col p-6 max-w-[1400px] mx-auto w-full gap-6" v-if="!loading">
      <!-- Breadcrumbs & Heading -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2 text-sm text-slate-400">
          <span>Salón Principal</span>
          <span class="material-symbols-outlined text-xs">chevron_right</span>
          <span class="text-white">Mesa {{ mesa?.nombre }}</span>
        </div>
        <div class="flex justify-between items-end">
          <div>
            <h1 class="text-4xl font-black tracking-tight mt-2">Finalizar Cuenta</h1>
            <p class="text-slate-400 font-medium">
              Mesa {{ mesa?.nombre }} ·
              <span class="text-[#33A3A3]">{{ mesa?.capacidad }} Comensales máx.</span>
            </p>
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-2 rounded-lg bg-[#2C3034] border border-white/10 text-sm font-bold flex items-center gap-2 hover:bg-white/5 transition-colors">
              <span class="material-symbols-outlined text-sm">print</span> Imprimir Pre-Ticket
            </button>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="flex flex-1 gap-6 overflow-hidden min-h-0">
        <!-- Left Pane: Receipt -->
        <div class="w-1/3 flex flex-col rounded-xl overflow-hidden border border-white/5" style="background: rgba(44, 48, 52, 0.6); backdrop-filter: blur(12px);">
          <div class="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <span class="font-bold uppercase tracking-widest text-xs opacity-60">Detalle de Consumo</span>
            <span class="text-xs bg-[#ff7b00]/20 text-[#ff7b00] px-2 py-1 rounded font-bold">ACTIVA</span>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            <div
              v-for="item in itemsCuenta"
              :key="item.uniqueId"
              @click="toggleItemSeleccionado(item.uniqueId)"
              :class="[
                'flex justify-between items-start p-2 rounded-lg transition-all',
                tipoDivision === 'articulo' ? 'cursor-pointer hover:bg-white/5' : '',
                itemsSeleccionados.includes(item.uniqueId) ? 'bg-[#33A3A3]/20 border border-[#33A3A3]/50' : ''
              ]"
            >
              <div class="flex gap-3">
                <span class="font-bold text-[#ff7b00]">{{ item.cantidad }}x</span>
                <div>
                  <p class="font-medium">{{ item.nombre }}</p>
                  <p v-if="item.opciones" class="text-xs text-slate-500 italic">+ {{ item.opciones }}</p>
                </div>
              </div>
              <span class="font-medium">{{ (item.precio * item.cantidad).toFixed(2) }}€</span>
            </div>
          </div>

          <div class="p-6 bg-white/5 border-t border-white/10 space-y-2">
            <div class="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span>{{ subtotal.toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between text-sm text-slate-400">
              <span>IVA (10%)</span>
              <span>{{ iva.toFixed(2) }}€</span>
            </div>
            <div v-if="descuentoAplicado > 0" class="flex justify-between text-sm text-green-500">
              <span>Descuento</span>
              <span>-{{ descuentoAplicado.toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between items-end pt-2">
              <span class="text-xl font-bold">TOTAL</span>
              <span class="text-3xl font-black text-white">{{ totalFinal.toFixed(2) }}€</span>
            </div>
          </div>
        </div>

        <!-- Right Pane: Checkout Actions (Bento Grid) -->
        <div class="flex-1 grid grid-cols-6 grid-rows-6 gap-4">
          <!-- Split Bill Module -->
          <div class="col-span-6 row-span-2 rounded-xl p-6 flex flex-col justify-between border border-white/5 bg-[#2C3034] hover:bg-[#363b41] transition-all">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-xl font-bold">Dividir Cuenta</h3>
                <p class="text-slate-400 text-sm">Elige el método de división</p>
              </div>
              <span class="material-symbols-outlined text-[#33A3A3]">call_split</span>
            </div>
            <div class="flex gap-4 mt-4">
              <button
                @click="seleccionarDivisionPersonas"
                :class="[
                  'flex-1 py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all',
                  tipoDivision === 'personas'
                    ? 'border-2 border-[#33A3A3] bg-[#33A3A3]/10'
                    : 'border border-white/10 bg-white/5 hover:bg-white/10'
                ]"
              >
                <span class="material-symbols-outlined" :class="tipoDivision === 'personas' ? 'text-[#33A3A3]' : ''">groups</span>
                <span class="font-bold text-sm">Por Persona</span>
              </button>
              <button
                @click="seleccionarDivisionArticulo"
                :class="[
                  'flex-1 py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all',
                  tipoDivision === 'articulo'
                    ? 'border-2 border-[#33A3A3] bg-[#33A3A3]/10'
                    : 'border border-white/10 bg-white/5 hover:bg-white/10'
                ]"
              >
                <span class="material-symbols-outlined" :class="tipoDivision === 'articulo' ? 'text-[#33A3A3]' : ''">list_alt</span>
                <span class="font-bold text-sm">Por Artículo</span>
              </button>
            </div>
            <!-- Info de división activa -->
            <div v-if="tipoDivision" class="mt-4 flex items-center justify-between">
              <div v-if="tipoDivision === 'personas'" class="text-sm text-[#33A3A3]">
                Persona {{ personaActual }} de {{ numeroPersonas }} · {{ totalPorPersona.toFixed(2) }}€ cada una
              </div>
              <div v-if="tipoDivision === 'articulo'" class="text-sm text-[#33A3A3]">
                {{ itemsSeleccionados.length }} artículos seleccionados · {{ totalItemsSeleccionados.toFixed(2) }}€
              </div>
              <button @click="cancelarDivision" class="text-xs text-red-400 hover:text-red-300">Cancelar división</button>
            </div>
          </div>

          <!-- Payment Methods -->
          <button
            @click="seleccionarMetodoPago('efectivo')"
            :class="[
              'col-span-2 row-span-4 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all border bg-[#2C3034]',
              metodoPago === 'efectivo' ? 'border-[#ff7b00] bg-[#ff7b00]/10' : 'border-white/5 hover:border-[#ff7b00] hover:bg-[#363b41]'
            ]"
          >
            <div :class="[
              'w-20 h-20 rounded-full flex items-center justify-center transition-colors',
              metodoPago === 'efectivo' ? 'bg-[#ff7b00] text-white' : 'bg-slate-100/10'
            ]">
              <span class="material-symbols-outlined text-4xl">payments</span>
            </div>
            <div class="text-center">
              <p class="text-xl font-bold">Efectivo</p>
              <p class="text-xs text-slate-500 mt-1">Sugerido: {{ (Math.ceil(totalFinal / 5) * 5).toFixed(2) }}€</p>
            </div>
          </button>

          <button
            @click="seleccionarMetodoPago('tarjeta')"
            :class="[
              'col-span-2 row-span-4 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all border bg-[#2C3034]',
              metodoPago === 'tarjeta' ? 'border-[#ff7b00] bg-[#ff7b00]/10' : 'border-white/5 hover:border-[#ff7b00] hover:bg-[#363b41]'
            ]"
          >
            <div :class="[
              'w-20 h-20 rounded-full flex items-center justify-center transition-colors',
              metodoPago === 'tarjeta' ? 'bg-[#ff7b00] text-white' : 'bg-slate-100/10'
            ]">
              <span class="material-symbols-outlined text-4xl">credit_card</span>
            </div>
            <div class="text-center">
              <p class="text-xl font-bold">Tarjeta</p>
              <p class="text-xs text-slate-500 mt-1">Visa, Master, Amex</p>
            </div>
          </button>

          <!-- Descuento Card -->
          <div
            @click="aplicarCupon"
            class="col-span-2 row-span-4 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer border border-white/5 hover:border-[#ff7b00] bg-[#2C3034] hover:bg-[#363b41] transition-all"
          >
            <div class="w-20 h-20 rounded-full bg-slate-100/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl">discount</span>
            </div>
            <div class="text-center">
              <p class="text-xl font-bold">Descuento</p>
              <p class="text-xs text-slate-500 mt-1">Aplicar cupón o %</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Footer Action Bar -->
      <div class="mt-auto pt-6 border-t border-white/10 flex justify-between items-center py-6">
        <div class="flex gap-4">
          <button
            @click="volverAtras"
            class="w-14 h-14 rounded-xl bg-[#2C3034] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <button
            @click="aplicarCupon"
            class="px-8 h-14 rounded-xl bg-[#2C3034] border border-white/10 font-bold flex items-center gap-3 hover:bg-white/10 transition-colors"
          >
            <span class="material-symbols-outlined">loyalty</span> Aplicar Cupón
          </button>
        </div>
        <div class="flex items-center gap-8">
          <div class="text-right">
            <p class="text-xs text-slate-400 uppercase font-bold tracking-widest">Saldo Pendiente</p>
            <p class="text-3xl font-black text-[#ff7b00]">{{ saldoPendiente.toFixed(2) }}€</p>
          </div>
          <button
            @click="procesarPago"
            :disabled="!metodoPago"
            :class="[
              'h-16 px-16 rounded-xl font-black text-xl flex items-center gap-3 transition-all',
              metodoPago
                ? 'bg-[#ff7b00] text-white shadow-[0_0_30px_rgba(255,123,0,0.3)] hover:scale-[1.02] active:scale-95'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            ]"
          >
            REGISTRAR PAGO <span class="material-symbols-outlined text-2xl font-bold">arrow_forward</span>
          </button>
        </div>
      </div>
    </main>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <span class="material-symbols-outlined text-5xl text-gray-500 animate-spin">progress_activity</span>
    </div>

    <!-- Modal Número de Personas -->
    <div v-if="mostrarModalPersonas" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="bg-[#2C3034] w-full max-w-md rounded-2xl p-8 border border-white/10">
        <h3 class="text-2xl font-bold mb-6 flex items-center gap-3">
          <span class="material-symbols-outlined text-[#33A3A3]">groups</span>
          ¿Cuántas personas?
        </h3>
        <div class="flex items-center justify-center gap-6 mb-8">
          <button
            @click="numeroPersonas > 2 && numeroPersonas--"
            class="w-16 h-16 rounded-full bg-[#1c1e21] hover:bg-white/10 flex items-center justify-center text-3xl font-bold transition-all"
          >
            -
          </button>
          <span class="text-6xl font-black text-[#ff7b00] w-24 text-center">{{ numeroPersonas }}</span>
          <button
            @click="numeroPersonas++"
            class="w-16 h-16 rounded-full bg-[#1c1e21] hover:bg-white/10 flex items-center justify-center text-3xl font-bold transition-all"
          >
            +
          </button>
        </div>
        <div class="bg-[#33A3A3]/10 rounded-xl p-4 mb-6 border border-[#33A3A3]/30">
          <div class="flex justify-between items-center">
            <span class="text-slate-400">Cada persona paga</span>
            <span class="text-2xl font-black text-[#33A3A3]">{{ totalPorPersona.toFixed(2) }}€</span>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            @click="mostrarModalPersonas = false; tipoDivision = null"
            class="flex-1 py-4 rounded-xl bg-[#1c1e21] border border-white/10 font-bold hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmarPersonas"
            class="flex-1 py-4 rounded-xl bg-[#ff7b00] text-white font-bold hover:bg-[#ff7b00]/90 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Descuento -->
    <div v-if="mostrarDescuento" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="bg-[#2C3034] w-full max-w-md rounded-2xl p-8 border border-white/10">
        <div class="flex justify-between items-start mb-6">
          <h3 class="text-2xl font-bold flex items-center gap-3">
            <span class="material-symbols-outlined text-[#ff7b00]">discount</span>
            Aplicar Descuento
          </h3>
          <button @click="mostrarDescuento = false" class="p-2 hover:bg-white/10 rounded-lg">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Tipo de descuento -->
        <div class="mb-6">
          <label class="text-sm text-slate-400 mb-3 block">Tipo de descuento</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="tipoDescuento = 'porcentaje'"
              :class="[
                'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                tipoDescuento === 'porcentaje'
                  ? 'border-[#ff7b00] bg-[#ff7b00]/10'
                  : 'border-white/10 hover:border-white/30'
              ]"
            >
              <span class="material-symbols-outlined text-2xl">percent</span>
              <span class="font-bold">Porcentaje</span>
            </button>
            <button
              @click="tipoDescuento = 'dinero'"
              :class="[
                'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                tipoDescuento === 'dinero'
                  ? 'border-[#ff7b00] bg-[#ff7b00]/10'
                  : 'border-white/10 hover:border-white/30'
              ]"
            >
              <span class="material-symbols-outlined text-2xl">euro</span>
              <span class="font-bold">Cantidad fija</span>
            </button>
          </div>
        </div>

        <!-- Valor del descuento -->
        <div class="mb-6">
          <label class="text-sm text-slate-400 mb-2 block">
            {{ tipoDescuento === 'porcentaje' ? 'Porcentaje de descuento' : 'Cantidad a descontar' }}
          </label>
          <div class="relative">
            <input
              v-model.number="valorDescuento"
              type="number"
              min="0"
              :max="tipoDescuento === 'porcentaje' ? 100 : subtotal"
              step="1"
              class="w-full bg-[#1c1e21] border border-white/10 rounded-xl px-4 py-4 text-2xl font-bold text-center focus:border-[#ff7b00] focus:outline-none"
              placeholder="0"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-slate-500">
              {{ tipoDescuento === 'porcentaje' ? '%' : '€' }}
            </span>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="valorDescuento > 0" class="bg-green-500/10 rounded-xl p-4 mb-6 border border-green-500/30">
          <div class="flex justify-between items-center">
            <span class="text-green-500">Descuento aplicado</span>
            <span class="text-xl font-bold text-green-500">
              -{{ (tipoDescuento === 'porcentaje' ? subtotal * (valorDescuento / 100) : Math.min(valorDescuento, subtotal)).toFixed(2) }}€
            </span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="valorDescuento = 0; mostrarDescuento = false"
            class="flex-1 py-4 rounded-xl bg-[#1c1e21] border border-white/10 font-bold hover:bg-white/10 transition-colors"
          >
            Quitar
          </button>
          <button
            @click="mostrarDescuento = false"
            class="flex-1 py-4 rounded-xl bg-[#ff7b00] text-white font-bold hover:bg-[#ff7b00]/90 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>

    <!-- Success State Modal -->
    <div v-if="mostrarExito" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="bg-[#2C3034] w-full max-w-lg rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl border border-white/10">
        <div class="w-24 h-24 bg-[#2ECC71] rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(46,204,113,0.4)]">
          <span class="material-symbols-outlined text-white text-5xl">check_circle</span>
        </div>
        <h2 class="text-4xl font-black mb-2 tracking-tight">Venta Registrada</h2>
        <p class="text-slate-400 text-lg mb-8">El pago por {{ saldoPendiente.toFixed(2) }}€ ha sido procesado con éxito.</p>

        <div class="w-full space-y-4 mb-8">
          <p class="text-sm font-bold uppercase tracking-widest text-slate-500 text-left">Enviar Ticket Digital</p>
          <div class="flex gap-2">
            <div class="flex-1 flex items-center bg-black/30 rounded-xl px-4 py-3 border border-white/5">
              <span class="material-symbols-outlined text-slate-500 mr-2">mail</span>
              <input
                v-model="emailCliente"
                class="bg-transparent border-none focus:ring-0 text-white w-full outline-none"
                placeholder="email@cliente.com"
                type="email"
              />
            </div>
            <button class="bg-[#33A3A3] p-3 rounded-xl hover:bg-[#33A3A3]/80 transition-colors">
              <span class="material-symbols-outlined">send</span>
            </button>
          </div>
          <div class="flex gap-4">
            <button class="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366]/20 text-[#25D366] rounded-xl font-bold border border-[#25D366]/30 hover:bg-[#25D366]/30 transition-colors">
              <span class="material-symbols-outlined">chat</span>
              WhatsApp
            </button>
            <button class="flex-1 py-3 bg-white/5 text-white rounded-xl font-bold border border-white/10 hover:bg-white/10 transition-colors">
              <span class="material-symbols-outlined mr-2">print</span>
              Imprimir Físico
            </button>
          </div>
        </div>

        <button
          @click="finalizarYVolver"
          class="w-full py-4 bg-[#ff7b00] text-white rounded-xl font-black text-lg hover:bg-[#ff7b00]/90 transition-colors"
        >
          LISTO PARA SIGUIENTE MESA
        </button>
      </div>
    </div>
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
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

// Estado
const pedidos = ref([])
const mesaSeleccionada = ref(null)
const loading = ref(true)
const itemEditando = ref(null)
const modalEdicion = ref(false)
const zonaActiva = ref('todas') // 'todas', 'salon', 'terraza'
const tabActiva = ref('pagar') // 'pagar' o 'carta'
const modalBarra = ref(false) // Para pagos rápidos de barra

// Configuración de mesas - Salón (10 mesas: 5 cuadradas + 5 rectangulares) + Terraza (3 cuadradas)
const configuracionMesas = [
  // Salón - Cuadradas
  { id: '1', nombre: 'M1', tipo: 'cuadrada', zona: 'salon', capacidad: 2 },
  { id: '2', nombre: 'M2', tipo: 'cuadrada', zona: 'salon', capacidad: 2 },
  { id: '3', nombre: 'M3', tipo: 'cuadrada', zona: 'salon', capacidad: 4 },
  { id: '4', nombre: 'M4', tipo: 'cuadrada', zona: 'salon', capacidad: 4 },
  { id: '5', nombre: 'M5', tipo: 'cuadrada', zona: 'salon', capacidad: 4 },
  // Salón - Rectangulares
  { id: '6', nombre: 'M6', tipo: 'rectangular', zona: 'salon', capacidad: 6 },
  { id: '7', nombre: 'M7', tipo: 'rectangular', zona: 'salon', capacidad: 6 },
  { id: '8', nombre: 'M8', tipo: 'rectangular', zona: 'salon', capacidad: 8 },
  { id: '9', nombre: 'M9', tipo: 'rectangular', zona: 'salon', capacidad: 8 },
  { id: '10', nombre: 'M10', tipo: 'rectangular', zona: 'salon', capacidad: 10 },
  // Terraza - Cuadradas
  { id: '11', nombre: 'T1', tipo: 'cuadrada', zona: 'terraza', capacidad: 4 },
  { id: '12', nombre: 'T2', tipo: 'cuadrada', zona: 'terraza', capacidad: 4 },
  { id: '13', nombre: 'T3', tipo: 'cuadrada', zona: 'terraza', capacidad: 6 }
]

// Mesas filtradas por zona
const mesasFiltradas = computed(() => {
  if (zonaActiva.value === 'todas') return configuracionMesas
  return configuracionMesas.filter(m => m.zona === zonaActiva.value)
})

// Estadísticas
const estadisticas = computed(() => {
  const total = configuracionMesas.length
  const libres = configuracionMesas.filter(m => getEstadoMesa(m.id) === 'libre').length
  const ocupadas = configuracionMesas.filter(m => getEstadoMesa(m.id) === 'ocupada').length
  const conCuenta = configuracionMesas.filter(m => getEstadoMesa(m.id) === 'cuenta').length
  const totalVentas = configuracionMesas.reduce((acc, m) => acc + getTotalMesa(m.id), 0)
  return { total, libres, ocupadas, conCuenta, totalVentas }
})

// Obtener estado de una mesa
const getEstadoMesa = (mesaId) => {
  const pedidosMesa = pedidos.value.filter(p => p.mesa === mesaId && p.estado !== 'pagado')
  if (pedidosMesa.length === 0) return 'libre'
  const tieneCuentaPedida = pedidosMesa.some(p => p.estado === 'cuenta')
  if (tieneCuentaPedida) return 'cuenta'
  return 'ocupada'
}

// Obtener pedidos de una mesa
const getPedidosMesa = (mesaId) => {
  return pedidos.value.filter(p => p.mesa === mesaId && p.estado !== 'pagado')
}

// Calcular total de una mesa
const getTotalMesa = (mesaId) => {
  const pedidosMesa = getPedidosMesa(mesaId)
  return pedidosMesa.reduce((acc, p) => acc + (p.total || 0), 0)
}

// Contar items de una mesa
const getItemsCount = (mesaId) => {
  const pedidosMesa = getPedidosMesa(mesaId)
  return pedidosMesa.reduce((acc, p) => acc + (p.items?.length || 0), 0)
}

// Items de la mesa seleccionada
const getItemsMesa = computed(() => {
  if (!mesaSeleccionada.value) return []
  const pedidosMesa = getPedidosMesa(mesaSeleccionada.value.id)
  const items = []
  pedidosMesa.forEach(pedido => {
    if (pedido.items && Array.isArray(pedido.items)) {
      pedido.items.forEach((item, itemIndex) => {
        items.push({ ...item, pedidoId: pedido.id, estadoPedido: pedido.estado, itemIndex })
      })
    }
  })
  return items
})

// Total de la mesa seleccionada
const totalMesaSeleccionada = computed(() => {
  if (!mesaSeleccionada.value) return 0
  return getTotalMesa(mesaSeleccionada.value.id)
})

// Tiempo desde el primer pedido
const tiempoMesa = (mesaId) => {
  const pedidosMesa = getPedidosMesa(mesaId)
  if (pedidosMesa.length === 0) return null
  const primerPedido = pedidosMesa.reduce((oldest, p) => {
    return new Date(p.created_at) < new Date(oldest.created_at) ? p : oldest
  })
  const minutos = Math.floor((Date.now() - new Date(primerPedido.created_at)) / 60000)
  return minutos
}

// Hora de apertura de la mesa
const horaAperturaMesa = computed(() => {
  if (!mesaSeleccionada.value) return null
  const pedidosMesa = getPedidosMesa(mesaSeleccionada.value.id)
  if (pedidosMesa.length === 0) return null
  const primerPedido = pedidosMesa.reduce((oldest, p) => {
    return new Date(p.created_at) < new Date(oldest.created_at) ? p : oldest
  })
  const fecha = new Date(primerPedido.created_at)
  return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
})

// Estado del item (basado en el estado del pedido)
const getEstadoItem = (estadoPedido) => {
  const estados = {
    pendiente: { texto: 'Pendiente', color: 'text-yellow-500' },
    preparando: { texto: 'En preparación', color: 'text-[#e27246]' },
    listo: { texto: 'Listo', color: 'text-green-500' },
    servido: { texto: 'Servido', color: 'text-gray-400' },
    cuenta: { texto: 'Servido', color: 'text-gray-400' }
  }
  return estados[estadoPedido] || { texto: '', color: '' }
}

// Abrir modal de edición de item
const abrirEdicionItem = (item) => {
  itemEditando.value = { ...item }
  modalEdicion.value = true
}

// Guardar cambios del item editado
const guardarEdicionItem = async () => {
  if (!itemEditando.value) return

  const pedido = pedidos.value.find(p => p.id === itemEditando.value.pedidoId)
  if (!pedido) return

  const nuevosItems = [...pedido.items]

  if (itemEditando.value.cantidad <= 0) {
    nuevosItems.splice(itemEditando.value.itemIndex, 1)
  } else {
    nuevosItems[itemEditando.value.itemIndex] = {
      nombre: itemEditando.value.nombre,
      cantidad: itemEditando.value.cantidad,
      precio: itemEditando.value.precio,
      opciones: itemEditando.value.opciones
    }
  }

  if (nuevosItems.length === 0) {
    await supabase.from('pedidos').delete().eq('id', itemEditando.value.pedidoId)
  } else {
    const nuevoTotal = nuevosItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
    await supabase.from('pedidos').update({ items: nuevosItems, total: nuevoTotal }).eq('id', itemEditando.value.pedidoId)
  }

  modalEdicion.value = false
  itemEditando.value = null
  await cargarPedidos()
}

// Eliminar item desde el modal
const eliminarItemDesdeModal = async () => {
  if (!itemEditando.value) return
  itemEditando.value.cantidad = 0
  await guardarEdicionItem()
}

// Ir al menú para añadir productos
const irAMenuParaAnadir = () => {
  if (!mesaSeleccionada.value) return
  const pedidosMesa = getPedidosMesa(mesaSeleccionada.value.id)
  const pedidoId = pedidosMesa.length > 0 ? pedidosMesa[0].id : null

  sessionStorage.setItem('camarero_mesa', mesaSeleccionada.value.id)
  sessionStorage.setItem('camarero_pedido_id', pedidoId)
  sessionStorage.setItem('camarero_modo', 'agregar')

  router.push(`/la-toscana/menu?table=${mesaSeleccionada.value.id}&modo=camarero`)
}

// Cargar pedidos
const cargarPedidos = async () => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .in('estado', ['pendiente', 'preparando', 'listo', 'servido', 'cuenta'])
      .order('created_at', { ascending: false })

    if (error) throw error
    pedidos.value = data || []
  } catch (e) {
    console.error('Error cargando pedidos:', e)
    pedidos.value = []
  } finally {
    loading.value = false
  }
}

// Suscripción en tiempo real
let subscription = null

const iniciarSuscripcion = () => {
  subscription = supabase
    .channel('pedidos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
      cargarPedidos()
    })
    .subscribe()
}

// Seleccionar mesa
const seleccionarMesa = (mesa) => {
  mesaSeleccionada.value = mesa
  tabActiva.value = 'pagar' // Por defecto abre en pestaña de pagar
}

// Abrir barra para pagos rápidos
const abrirBarra = () => {
  modalBarra.value = true
}

// Cerrar modal barra
const cerrarBarra = () => {
  modalBarra.value = false
}

// Pedir cuenta
const pedirCuenta = async () => {
  if (!mesaSeleccionada.value) return
  const pedidosMesa = getPedidosMesa(mesaSeleccionada.value.id)
  for (const pedido of pedidosMesa) {
    await supabase.from('pedidos').update({ estado: 'cuenta' }).eq('id', pedido.id)
  }
  await cargarPedidos()
}

// Ir a pantalla de pago
const irAPagar = () => {
  if (!mesaSeleccionada.value) return
  router.push(`/pago/${mesaSeleccionada.value.id}`)
}

const cerrarSidebar = () => {
  mesaSeleccionada.value = null
  tabActiva.value = 'pagar'
}

// Cerrar sesión
const cerrarSesion = () => {
  sessionStorage.removeItem('adminAuth')
  sessionStorage.removeItem('adminUser')
  router.push('/admin/login')
}

onMounted(() => {
  cargarPedidos()
  iniciarSuscripcion()
})

onUnmounted(() => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
})

// Colores
const coloresEstado = {
  libre: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'text-emerald-500', icon: 'check_circle' },
  ocupada: { bg: 'bg-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-500', icon: 'restaurant' },
  cuenta: { bg: 'bg-rose-500/10', border: 'border-rose-500/50', text: 'text-rose-500', icon: 'point_of_sale' }
}

const etiquetaEstado = { libre: 'Libre', ocupada: 'Ocupada', cuenta: 'Por cobrar' }
</script>

<template>
  <div class="bg-[#0a0b0d] font-sans text-gray-100 min-h-screen">
    <div class="flex h-screen">
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
            class="flex items-center gap-3 px-4 py-3 bg-[#e27246]/10 text-[#e27246] rounded-xl font-semibold"
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
            class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-xl transition-all"
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
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="h-20 border-b border-gray-800/50 bg-[#0f1115]/80 backdrop-blur-xl px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 class="text-2xl font-black tracking-tight">SALÓN</h1>
            <p class="text-sm text-gray-500">Gestión de mesas en tiempo real</p>
          </div>

          <div class="flex items-center gap-6">
            <!-- Estadísticas rápidas -->
            <div class="hidden md:flex items-center gap-6 mr-4">
              <div class="text-center">
                <p class="text-2xl font-black text-emerald-500">{{ estadisticas.libres }}</p>
                <p class="text-[10px] text-gray-500 uppercase tracking-wider">Libres</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-black text-amber-500">{{ estadisticas.ocupadas }}</p>
                <p class="text-[10px] text-gray-500 uppercase tracking-wider">Ocupadas</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-black text-rose-500">{{ estadisticas.conCuenta }}</p>
                <p class="text-[10px] text-gray-500 uppercase tracking-wider">Por cobrar</p>
              </div>
              <div class="text-center border-l border-gray-800 pl-6">
                <p class="text-2xl font-black text-[#e27246]">{{ estadisticas.totalVentas.toFixed(0) }}€</p>
                <p class="text-[10px] text-gray-500 uppercase tracking-wider">En mesas</p>
              </div>
            </div>

            <button @click="cargarPedidos" class="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
              <span class="material-symbols-outlined text-gray-400">refresh</span>
            </button>
          </div>
        </header>

        <!-- Filtros de zona -->
        <div class="px-8 py-4 border-b border-gray-800/30 flex items-center gap-3">
          <button
            @click="zonaActiva = 'todas'"
            :class="[
              'px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
              zonaActiva === 'todas' ? 'bg-[#e27246] text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            ]"
          >
            Todas ({{ configuracionMesas.length }})
          </button>
          <button
            @click="zonaActiva = 'salon'"
            :class="[
              'px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
              zonaActiva === 'salon' ? 'bg-[#e27246] text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            ]"
          >
            <span class="material-symbols-outlined text-sm align-middle mr-1">chair</span>
            Salón (10)
          </button>
          <button
            @click="zonaActiva = 'terraza'"
            :class="[
              'px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
              zonaActiva === 'terraza' ? 'bg-[#e27246] text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            ]"
          >
            <span class="material-symbols-outlined text-sm align-middle mr-1">deck</span>
            Terraza (3)
          </button>

          <!-- Leyenda -->
          <div class="ml-auto flex items-center gap-4 text-xs">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span class="text-gray-500">Libre</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-amber-500"></span>
              <span class="text-gray-500">Ocupada</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500"></span>
              <span class="text-gray-500">Por cobrar</span>
            </div>
          </div>
        </div>

        <!-- Grid de Mesas -->
        <div class="flex-1 overflow-auto p-8">
          <div v-if="loading" class="flex items-center justify-center h-full">
            <span class="material-symbols-outlined text-5xl text-gray-600 animate-spin">progress_activity</span>
          </div>

          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            <button
              v-for="mesa in mesasFiltradas"
              :key="mesa.id"
              @click="seleccionarMesa(mesa)"
              :class="[
                'relative group rounded-2xl p-5 border-2 transition-all hover:scale-[1.02] hover:shadow-xl',
                coloresEstado[getEstadoMesa(mesa.id)].bg,
                coloresEstado[getEstadoMesa(mesa.id)].border,
                getEstadoMesa(mesa.id) === 'cuenta' ? 'shadow-lg shadow-rose-500/20 animate-pulse-subtle' : '',
                getEstadoMesa(mesa.id) === 'libre' ? 'opacity-60 hover:opacity-100' : ''
              ]"
            >
              <!-- Badge de tiempo -->
              <div v-if="tiempoMesa(mesa.id)" class="absolute -top-2 -right-2 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-black">
                {{ tiempoMesa(mesa.id) }}'
              </div>

              <!-- Contenido de la mesa -->
              <div class="flex flex-col items-center">
                <!-- Icono de estado -->
                <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center mb-3', coloresEstado[getEstadoMesa(mesa.id)].bg]">
                  <span :class="['material-symbols-outlined text-3xl', coloresEstado[getEstadoMesa(mesa.id)].text]">
                    {{ coloresEstado[getEstadoMesa(mesa.id)].icon }}
                  </span>
                </div>

                <!-- Nombre de la mesa -->
                <h3 :class="['text-2xl font-black mb-1', coloresEstado[getEstadoMesa(mesa.id)].text]">
                  {{ mesa.nombre }}
                </h3>

                <!-- Info adicional -->
                <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span class="material-symbols-outlined text-sm">group</span>
                  <span>{{ mesa.capacidad }} pax</span>
                  <span class="mx-1">·</span>
                  <span>{{ mesa.zona === 'terraza' ? 'Terraza' : 'Salón' }}</span>
                </div>

                <!-- Estado/Total -->
                <div v-if="getEstadoMesa(mesa.id) === 'libre'" class="text-sm font-medium text-gray-500">
                  Disponible
                </div>
                <div v-else class="text-center">
                  <p :class="['text-xl font-black', coloresEstado[getEstadoMesa(mesa.id)].text]">
                    {{ getTotalMesa(mesa.id).toFixed(2) }}€
                  </p>
                  <p class="text-xs text-gray-500">{{ getItemsCount(mesa.id) }} items</p>
                </div>
              </div>
            </button>

            <!-- Barra - Pagos Rápidos -->
            <button
              @click="abrirBarra"
              class="rounded-2xl p-5 border-2 border-purple-500/50 bg-purple-500/10 flex flex-col items-center justify-center hover:scale-[1.02] hover:shadow-xl hover:bg-purple-500/20 transition-all cursor-pointer"
            >
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-purple-500/20">
                <span class="material-symbols-outlined text-3xl text-purple-400">local_bar</span>
              </div>
              <h3 class="text-2xl font-black mb-1 text-purple-400">Barra</h3>
              <p class="text-xs text-gray-500">Pagos Rápidos</p>
            </button>
          </div>
        </div>
      </main>

      <!-- Sidebar de Mesa Seleccionada -->
      <aside v-if="mesaSeleccionada" class="w-full md:w-[420px] border-l border-gray-800/50 bg-[#0f1115] flex flex-col z-50 fixed md:relative inset-0 md:inset-auto">
        <!-- Header con pestañas -->
        <div class="border-b border-gray-800/50">
          <div class="p-4 flex items-center justify-between">
            <h2 class="text-2xl font-black">Mesa {{ mesaSeleccionada.nombre }}</h2>
            <button @click="cerrarSidebar" class="p-2 hover:bg-gray-800 rounded-xl">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <!-- Pestañas -->
          <div class="flex px-4 gap-2 border-b border-gray-800/30 bg-gradient-to-r from-[#0f1115] to-[#0a0b0d] h-14 items-center">
            <button
              @click="tabActiva = 'pagar'"
              :class="[
                'group relative px-6 py-2.5 font-bold text-sm transition-all duration-300 flex items-center gap-2 rounded-lg',
                tabActiva === 'pagar'
                  ? 'bg-[#e27246]/15 text-[#e27246] shadow-lg shadow-[#e27246]/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
              ]"
            >
              <span class="material-symbols-outlined text-lg">point_of_sale</span>
              <span>Cobrar</span>
              <span
                v-if="tabActiva === 'pagar'"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#e27246] via-[#e27246] to-transparent rounded-full"
              ></span>
            </button>
            <button
              @click="tabActiva = 'carta'"
              :class="[
                'group relative px-6 py-2.5 font-bold text-sm transition-all duration-300 flex items-center gap-2 rounded-lg',
                tabActiva === 'carta'
                  ? 'bg-[#e27246]/15 text-[#e27246] shadow-lg shadow-[#e27246]/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
              ]"
            >
              <span class="material-symbols-outlined text-lg">restaurant_menu</span>
              <span>Carta</span>
              <span
                v-if="tabActiva === 'carta'"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#e27246] via-[#e27246] to-transparent rounded-full"
              ></span>
            </button>
          </div>
        </div>

        <!-- Contenido de pestaña PAGAR -->
        <template v-if="tabActiva === 'pagar'">
          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="getItemsMesa.length === 0" class="text-center py-10 text-gray-500">
              <span class="material-symbols-outlined text-5xl mb-3 opacity-50">receipt_long</span>
              <p class="font-medium">Sin pedidos</p>
              <p class="text-sm mt-2">Usa la pestaña "Carta" para añadir productos</p>
            </div>

            <div class="space-y-3">
              <div v-for="(item, index) in getItemsMesa" :key="index" class="bg-gray-800/30 rounded-xl p-4 group hover:bg-gray-800/50 transition-all">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[#e27246] font-bold">{{ item.cantidad }}x</span>
                      <h4 class="font-bold">{{ item.nombre }}</h4>
                    </div>
                    <p v-if="item.opciones" class="text-sm text-gray-500 mt-1">{{ item.opciones }}</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-lg">{{ (item.precio * item.cantidad).toFixed(2) }}€</span>
                    <button
                      @click="abrirEdicionItem(item)"
                      class="w-9 h-9 rounded-xl bg-gray-700 hover:bg-[#e27246] text-gray-400 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                      <span class="material-symbols-outlined text-lg">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Totales -->
            <div v-if="getItemsMesa.length > 0" class="mt-6 pt-6 border-t border-gray-800/50">
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Total a cobrar</span>
                <span class="text-4xl font-black text-[#e27246]">{{ totalMesaSeleccionada.toFixed(2) }}€</span>
              </div>
            </div>
          </div>

          <!-- Botones de pago -->
          <div class="p-6 bg-[#0a0b0d] border-t border-gray-800/50">
            <button
              v-if="getItemsMesa.length > 0"
              @click="irAPagar"
              class="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black py-5 rounded-xl transition-all text-lg uppercase tracking-wider shadow-lg shadow-emerald-500/30"
            >
              <span class="material-symbols-outlined text-2xl">point_of_sale</span>
              Cobrar {{ totalMesaSeleccionada.toFixed(2) }}€
            </button>
            <p v-else class="text-center text-gray-500 text-sm">Añade productos desde la pestaña "Carta"</p>
          </div>
        </template>

        <!-- Contenido de pestaña CARTA -->
        <template v-if="tabActiva === 'carta'">
          <div class="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div class="w-20 h-20 rounded-2xl bg-[#e27246]/10 flex items-center justify-center mb-4">
              <span class="material-symbols-outlined text-4xl text-[#e27246]">restaurant_menu</span>
            </div>
            <h3 class="text-xl font-bold mb-2">Añadir Productos</h3>
            <p class="text-gray-500 mb-6">Selecciona productos de la carta para añadir a esta mesa</p>
            <button
              @click="irAMenuParaAnadir"
              class="px-8 py-4 bg-[#e27246] hover:bg-[#c25f38] text-white font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <span class="material-symbols-outlined">menu_book</span>
              Abrir Carta
            </button>
          </div>
        </template>
      </aside>

      <!-- Modal Barra - Pagos Rápidos -->
      <div v-if="modalBarra" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
        <div class="bg-[#1a1d23] rounded-2xl w-full max-w-lg overflow-hidden">
          <div class="p-6 border-b border-gray-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span class="material-symbols-outlined text-purple-400">local_bar</span>
              </div>
              <div>
                <h3 class="text-xl font-bold">Barra</h3>
                <p class="text-sm text-gray-500">Pagos Rápidos</p>
              </div>
            </div>
            <button @click="cerrarBarra" class="p-2 hover:bg-gray-800 rounded-xl">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-6 text-center">
            <p class="text-gray-400 mb-6">Función para cobros rápidos de barra sin mesa asignada</p>
            <button
              @click="router.push('/pago/barra')"
              class="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined">add_shopping_cart</span>
              Nuevo Cobro de Barra
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Edición de Item -->
      <div v-if="modalEdicion && itemEditando" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
        <div class="bg-[#1a1d23] rounded-2xl w-full max-w-md overflow-hidden">
          <div class="p-6 border-b border-gray-800">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold">Editar Producto</h3>
              <button @click="modalEdicion = false" class="p-2 hover:bg-gray-800 rounded-lg">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div>
              <label class="text-sm text-gray-400 mb-2 block">Producto</label>
              <p class="text-lg font-bold">{{ itemEditando.nombre }}</p>
            </div>

            <div v-if="itemEditando.opciones">
              <label class="text-sm text-gray-400 mb-2 block">Opciones</label>
              <input
                v-model="itemEditando.opciones"
                type="text"
                class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#e27246] focus:outline-none"
                placeholder="Ej: Sin cebolla, extra queso..."
              />
            </div>

            <div>
              <label class="text-sm text-gray-400 mb-2 block">Cantidad</label>
              <div class="flex items-center gap-4">
                <button
                  @click="itemEditando.cantidad > 1 && itemEditando.cantidad--"
                  class="w-14 h-14 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-xl font-bold"
                >
                  -
                </button>
                <span class="text-4xl font-black w-20 text-center">{{ itemEditando.cantidad }}</span>
                <button
                  @click="itemEditando.cantidad++"
                  class="w-14 h-14 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div class="flex justify-between items-center pt-4 border-t border-gray-800">
              <span class="text-gray-400">Precio total</span>
              <span class="text-2xl font-black text-[#e27246]">{{ (itemEditando.precio * itemEditando.cantidad).toFixed(2) }}€</span>
            </div>
          </div>

          <div class="p-6 bg-[#0f1115]/50 border-t border-gray-800 space-y-3">
            <button
              @click="guardarEdicionItem"
              class="w-full flex items-center justify-center gap-2 bg-[#e27246] hover:bg-[#c25f38] text-white font-bold py-4 rounded-xl transition-all"
            >
              <span class="material-symbols-outlined">save</span>
              Guardar Cambios
            </button>
            <button
              @click="eliminarItemDesdeModal"
              class="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold py-3 rounded-xl transition-all border border-rose-500/30"
            >
              <span class="material-symbols-outlined">delete</span>
              Eliminar Producto
            </button>
          </div>
        </div>
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
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}
.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}
</style>

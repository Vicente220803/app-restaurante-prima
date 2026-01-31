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

// Configuración de mesas
const configuracionMesas = [
  { id: '1', nombre: 'M1', tipo: 'cuadrada', zona: 'salon' },
  { id: '2', nombre: 'M2', tipo: 'redonda', zona: 'salon' },
  { id: '3', nombre: 'M3', tipo: 'cuadrada', zona: 'salon' },
  { id: '4', nombre: 'M4', tipo: 'cuadrada', zona: 'salon' },
  { id: '5', nombre: 'M5', tipo: 'redonda', zona: 'salon' },
  { id: '6', nombre: 'M6', tipo: 'redonda', zona: 'salon' },
  { id: '7', nombre: 'T1', tipo: 'cuadrada', zona: 'terraza' },
  { id: '8', nombre: 'T2', tipo: 'cuadrada', zona: 'terraza' },
  { id: '9', nombre: 'T3', tipo: 'cuadrada', zona: 'terraza' },
  { id: '10', nombre: 'T4', tipo: 'cuadrada', zona: 'terraza' }
]

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

// Eliminar item de un pedido
const eliminarItem = async (pedidoId, itemIndex) => {
  const pedido = pedidos.value.find(p => p.id === pedidoId)
  if (!pedido) return

  const nuevosItems = [...pedido.items]
  nuevosItems.splice(itemIndex, 1)

  if (nuevosItems.length === 0) {
    // Si no quedan items, eliminar el pedido
    await supabase.from('pedidos').delete().eq('id', pedidoId)
  } else {
    // Recalcular total
    const nuevoTotal = nuevosItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
    await supabase.from('pedidos').update({ items: nuevosItems, total: nuevoTotal }).eq('id', pedidoId)
  }
  await cargarPedidos()
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
    // Eliminar item
    nuevosItems.splice(itemEditando.value.itemIndex, 1)
  } else {
    // Actualizar item
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
  // Guardamos la mesa y el pedido en sessionStorage para saber que es el camarero añadiendo
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
  const estado = getEstadoMesa(mesa.id)
  if (estado !== 'libre') {
    mesaSeleccionada.value = mesa
  }
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

// Marcar como pagado
const marcarPagado = async () => {
  if (!mesaSeleccionada.value) return
  const pedidosMesa = getPedidosMesa(mesaSeleccionada.value.id)
  for (const pedido of pedidosMesa) {
    await supabase.from('pedidos').update({ estado: 'pagado' }).eq('id', pedido.id)
  }
  mesaSeleccionada.value = null
  await cargarPedidos()
}

const cerrarSidebar = () => {
  mesaSeleccionada.value = null
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
  libre: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-500' },
  ocupada: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-500' },
  cuenta: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-500' }
}

const etiquetaEstado = { libre: 'Libre', ocupada: 'Ocupada', cuenta: 'Cuenta' }
</script>

<template>
  <div class="bg-[#0f1115] font-sans text-gray-100 min-h-screen overflow-hidden">
    <div class="flex h-screen">
      <!-- Main -->
      <main class="flex-1 flex flex-col relative overflow-hidden">
        <!-- Header -->
        <header class="h-16 border-b border-gray-800 bg-[#1a1d23]/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
            <div class="bg-[#e27246]/10 p-2 rounded-lg">
              <span class="material-symbols-outlined text-[#e27246] text-2xl">grid_view</span>
            </div>
            <div>
              <h1 class="text-lg font-extrabold tracking-tight">Gestión de Mesas</h1>
              <p class="text-[10px] uppercase tracking-widest text-[#e27246] font-bold">La Toscana</p>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                <span class="text-gray-400">Libre</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-amber-500"></span>
                <span class="text-gray-400">Ocupada</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500"></span>
                <span class="text-gray-400">Cuenta</span>
              </div>
            </div>
            <button @click="cargarPedidos" class="bg-gray-800 p-2 rounded-xl hover:bg-gray-700 transition-colors">
              <span class="material-symbols-outlined text-gray-400">refresh</span>
            </button>
          </div>
        </header>

        <!-- Grid -->
        <div class="flex-1 relative overflow-auto p-8 md:p-12" style="background-image: radial-gradient(circle, #2d333d 1px, transparent 1px); background-size: 40px 40px;">
          <div v-if="loading" class="flex items-center justify-center h-full">
            <span class="material-symbols-outlined text-4xl text-gray-500 animate-spin">progress_activity</span>
          </div>

          <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-5xl mx-auto">
            <button
              v-for="mesa in configuracionMesas"
              :key="mesa.id"
              @click="seleccionarMesa(mesa)"
              :class="[
                'aspect-square border-4 group flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all relative',
                mesa.tipo === 'redonda' ? 'rounded-full' : 'rounded-2xl',
                coloresEstado[getEstadoMesa(mesa.id)].bg,
                coloresEstado[getEstadoMesa(mesa.id)].border,
                getEstadoMesa(mesa.id) === 'cuenta' ? 'shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''
              ]"
            >
              <div v-if="tiempoMesa(mesa.id)" class="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                {{ tiempoMesa(mesa.id) }} min
              </div>
              <span :class="['text-2xl font-black', coloresEstado[getEstadoMesa(mesa.id)].text]">{{ mesa.nombre }}</span>
              <span v-if="getEstadoMesa(mesa.id) === 'cuenta'" class="material-symbols-outlined text-red-500 text-xl">payments</span>
              <span :class="['text-[10px] font-bold uppercase', coloresEstado[getEstadoMesa(mesa.id)].text]">
                {{ mesa.zona === 'terraza' ? 'Terraza' : etiquetaEstado[getEstadoMesa(mesa.id)] }}
              </span>
              <span v-if="getEstadoMesa(mesa.id) !== 'libre'" :class="['text-xs font-bold', coloresEstado[getEstadoMesa(mesa.id)].text]">
                {{ getTotalMesa(mesa.id).toFixed(2) }}€
              </span>
            </button>

            <div class="col-span-2 bg-gray-800/20 border-2 border-dashed border-gray-700 rounded-3xl flex items-center justify-center text-gray-600 font-bold uppercase tracking-widest text-sm h-24">
              Barra de Servicio
            </div>
          </div>
        </div>
      </main>

      <!-- Sidebar -->
      <aside v-if="mesaSeleccionada" class="w-full md:w-[420px] border-l border-gray-800 bg-[#1a1d23] flex flex-col z-50 fixed md:relative inset-0 md:inset-auto">
        <!-- Header -->
        <div class="p-6 border-b border-gray-800">
          <div class="flex items-center justify-between mb-4">
            <span :class="['px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide', getEstadoMesa(mesaSeleccionada.id) === 'cuenta' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black']">
              {{ getEstadoMesa(mesaSeleccionada.id) === 'cuenta' ? 'Cuenta Pedida' : 'En progreso' }}
            </span>
            <div class="flex items-center gap-2">
              <span v-if="horaAperturaMesa" class="text-sm text-gray-400">Apertura: {{ horaAperturaMesa }}</span>
              <button @click="cerrarSidebar" class="p-2 hover:bg-gray-800 rounded-lg ml-2">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          <h2 class="text-3xl font-extrabold">Mesa {{ mesaSeleccionada.nombre }}</h2>
        </div>

        <!-- Items List -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="getItemsMesa.length === 0" class="text-center py-10 text-gray-500">
            <span class="material-symbols-outlined text-4xl mb-2">receipt_long</span>
            <p>No hay pedidos</p>
          </div>

          <div class="space-y-4">
            <div v-for="(item, index) in getItemsMesa" :key="index" class="group">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold">
                      <span class="text-gray-400">{{ item.cantidad }}x</span> {{ item.nombre }}
                    </h4>
                  </div>
                  <p v-if="item.opciones" class="text-sm text-gray-500 italic mt-0.5">- {{ item.opciones }}</p>
                  <p v-if="item.estadoPedido && item.estadoPedido !== 'servido' && item.estadoPedido !== 'cuenta'"
                     :class="['text-sm font-medium mt-1', getEstadoItem(item.estadoPedido).color]">
                    {{ getEstadoItem(item.estadoPedido).texto }}
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-bold text-right">{{ (item.precio * item.cantidad).toFixed(2) }}€</span>
                  <!-- Botón de edición con lápiz -->
                  <button
                    @click="abrirEdicionItem(item)"
                    class="w-8 h-8 rounded-lg bg-gray-800 hover:bg-[#e27246]/20 text-gray-400 hover:text-[#e27246] flex items-center justify-center transition-colors"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Totales -->
          <div v-if="getItemsMesa.length > 0" class="mt-8 pt-4 border-t border-gray-800 space-y-2">
            <div class="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>{{ totalMesaSeleccionada.toFixed(2) }}€</span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-xl font-bold">Total</span>
              <span class="text-3xl font-black text-[#e27246]">{{ totalMesaSeleccionada.toFixed(2) }}€</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="p-6 bg-[#0f1115]/50 border-t border-gray-800 space-y-3">
          <!-- Añadir Producto -->
          <button
            @click="irAMenuParaAnadir"
            class="w-full flex items-center justify-center gap-2 bg-[#e27246] hover:bg-[#c25f38] text-white font-bold py-3 rounded-full transition-all"
          >
            <span class="material-symbols-outlined text-lg">add</span>
            Añadir Producto
          </button>

          <!-- Pedir Cuenta / Marcar Pagado -->
          <button
            v-if="getEstadoMesa(mesaSeleccionada.id) !== 'cuenta'"
            @click="pedirCuenta"
            class="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black py-4 rounded-full transition-all uppercase tracking-widest text-sm border border-red-500/30 hover:border-red-500"
          >
            <span class="material-symbols-outlined">payments</span>
            Pedir Cuenta
          </button>
          <button
            v-else
            @click="marcarPagado"
            class="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-full transition-all uppercase tracking-widest text-sm"
          >
            <span class="material-symbols-outlined">check_circle</span>
            Marcar Pagado
          </button>
        </div>
      </aside>

      <!-- Modal de Edición de Item -->
      <div v-if="modalEdicion && itemEditando" class="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
        <div class="bg-[#1a1d23] rounded-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div class="p-6 border-b border-gray-800">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold">Editar Producto</h3>
              <button @click="modalEdicion = false" class="p-2 hover:bg-gray-800 rounded-lg">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Nombre del producto -->
            <div>
              <label class="text-sm text-gray-400 mb-2 block">Producto</label>
              <p class="text-lg font-bold">{{ itemEditando.nombre }}</p>
            </div>

            <!-- Opciones (si las tiene) -->
            <div v-if="itemEditando.opciones">
              <label class="text-sm text-gray-400 mb-2 block">Opciones</label>
              <input
                v-model="itemEditando.opciones"
                type="text"
                class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#e27246] focus:outline-none"
                placeholder="Ej: Sin cebolla, extra queso..."
              />
            </div>

            <!-- Cantidad -->
            <div>
              <label class="text-sm text-gray-400 mb-2 block">Cantidad</label>
              <div class="flex items-center gap-4">
                <button
                  @click="itemEditando.cantidad > 1 && itemEditando.cantidad--"
                  class="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-xl font-bold"
                >
                  -
                </button>
                <span class="text-3xl font-black w-16 text-center">{{ itemEditando.cantidad }}</span>
                <button
                  @click="itemEditando.cantidad++"
                  class="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Precio -->
            <div class="flex justify-between items-center pt-4 border-t border-gray-800">
              <span class="text-gray-400">Precio total</span>
              <span class="text-2xl font-black text-[#e27246]">{{ (itemEditando.precio * itemEditando.cantidad).toFixed(2) }}€</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-6 bg-[#0f1115]/50 border-t border-gray-800 space-y-3">
            <button
              @click="guardarEdicionItem"
              class="w-full flex items-center justify-center gap-2 bg-[#e27246] hover:bg-[#c25f38] text-white font-bold py-4 rounded-full transition-all"
            >
              <span class="material-symbols-outlined">save</span>
              Guardar Cambios
            </button>
            <button
              @click="eliminarItemDesdeModal"
              class="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold py-3 rounded-full transition-all border border-red-500/30"
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
</style>

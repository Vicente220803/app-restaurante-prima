<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

// Estado general
const loading = ref(true)
const saving = ref(false)
const productos = ref([])
const categorias = ref([])
const productoSeleccionado = ref(null)
const searchQuery = ref('')
const mensaje = ref({ tipo: '', texto: '' })
const tabActiva = ref('basico') // 'basico', 'inventario'

// Estado del formulario
const formulario = ref({
  nombre: '',
  descripcion: '',
  precio_base: 0,
  categoria_id: null,
  disponible: true,
  imagen_url: '',
  stock: 999,
  alergenos: ''
})

// Estado de extras/opciones
const gruposOpciones = ref([])
const nuevoGrupo = ref({ nombre: '', es_obligatorio: false })

// Archivo de imagen seleccionado
const imagenFile = ref(null)
const imagenPreview = ref('')
const subiendoImagen = ref(false)
const imagenesGaleria = ref([]) // Para galería de imágenes

// Productos filtrados por búsqueda y agrupados por categoría
const productosFiltrados = computed(() => {
  let lista = productos.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    lista = lista.filter(p => p.nombre.toLowerCase().includes(query))
  }
  return lista
})

const productosPorCategoria = computed(() => {
  const grupos = {}
  productosFiltrados.value.forEach(p => {
    const catNombre = p.categorias?.nombre || 'Sin categoría'
    if (!grupos[catNombre]) {
      grupos[catNombre] = []
    }
    grupos[catNombre].push(p)
  })
  return grupos
})

// Cargar datos iniciales
onMounted(async () => {
  await Promise.all([cargarCategorias(), cargarProductos()])
  loading.value = false
})

async function cargarCategorias() {
  const { data } = await supabase
    .from('categorias')
    .select('id, nombre')
    .order('nombre')
  categorias.value = data || []
}

async function cargarProductos() {
  const { data } = await supabase
    .from('productos')
    .select('*, categorias(id, nombre)')
    .order('nombre')
  productos.value = data || []
}

// Seleccionar producto para editar
async function seleccionarProducto(producto) {
  productoSeleccionado.value = producto
  formulario.value = {
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    precio_base: producto.precio_base,
    categoria_id: producto.categoria_id,
    disponible: producto.disponible,
    imagen_url: producto.imagen_url || '',
    stock: producto.stock || 999,
    alergenos: producto.alergenos || ''
  }
  imagenPreview.value = producto.imagen_url || ''
  imagenFile.value = null
  tabActiva.value = 'basico'

  // Cargar grupos de opciones del producto
  await cargarGruposOpciones(producto.id)
}

async function cargarGruposOpciones(productoId) {
  const { data } = await supabase
    .from('grupos_opciones')
    .select('*, opciones(*)')
    .eq('producto_id', productoId)
    .order('nombre')
  gruposOpciones.value = data || []
}

// Crear nuevo producto
function nuevoProducto() {
  productoSeleccionado.value = { id: 'nuevo' }
  formulario.value = {
    nombre: '',
    descripcion: '',
    precio_base: 0,
    categoria_id: categorias.value[0]?.id || null,
    disponible: true,
    imagen_url: '',
    stock: 999,
    alergenos: ''
  }
  imagenPreview.value = ''
  imagenFile.value = null
  gruposOpciones.value = []
  tabActiva.value = 'basico'
}

// Descartar cambios
function descartarCambios() {
  if (productoSeleccionado.value?.id === 'nuevo') {
    productoSeleccionado.value = null
  } else if (productoSeleccionado.value) {
    seleccionarProducto(productoSeleccionado.value)
  }
}

// Manejar selección de imagen
function onImagenSeleccionada(event) {
  const file = event.target.files[0]
  if (file) {
    imagenFile.value = file
    imagenPreview.value = URL.createObjectURL(file)
  }
}

// Subir imagen a Supabase Storage
async function subirImagen(productoId) {
  if (!imagenFile.value) return formulario.value.imagen_url

  subiendoImagen.value = true
  try {
    const fileExt = imagenFile.value.name.split('.').pop()
    const fileName = `${productoId}-${Date.now()}.${fileExt}`
    const filePath = `productos/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('imagenes')
      .upload(filePath, imagenFile.value, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('imagenes')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (e) {
    console.error('Error subiendo imagen:', e)
    mostrarMensaje('error', 'Error al subir la imagen')
    return formulario.value.imagen_url
  } finally {
    subiendoImagen.value = false
  }
}

// Guardar producto
async function guardarProducto() {
  saving.value = true
  mensaje.value = { tipo: '', texto: '' }

  try {
    const esNuevo = productoSeleccionado.value.id === 'nuevo'
    let productoId = productoSeleccionado.value.id

    const datosProducto = {
      nombre: formulario.value.nombre,
      descripcion: formulario.value.descripcion,
      precio_base: formulario.value.precio_base,
      categoria_id: formulario.value.categoria_id,
      disponible: formulario.value.disponible
    }

    if (esNuevo) {
      const { data, error } = await supabase
        .from('productos')
        .insert(datosProducto)
        .select()
        .single()

      if (error) throw error
      productoId = data.id
      productoSeleccionado.value = data
    }

    // Subir imagen si hay una nueva
    if (imagenFile.value) {
      const imagenUrl = await subirImagen(productoId)
      datosProducto.imagen_url = imagenUrl
    }

    // Actualizar producto
    const { error: updateError } = await supabase
      .from('productos')
      .update(datosProducto)
      .eq('id', productoId)

    if (updateError) throw updateError

    mostrarMensaje('exito', esNuevo ? 'Producto creado correctamente' : 'Cambios guardados')
    await cargarProductos()

    const productoActualizado = productos.value.find(p => p.id === productoId)
    if (productoActualizado) {
      await seleccionarProducto(productoActualizado)
    }

  } catch (e) {
    console.error('Error guardando producto:', e)
    mostrarMensaje('error', 'Error al guardar: ' + e.message)
  } finally {
    saving.value = false
  }
}

// Eliminar producto
async function eliminarProducto() {
  if (!confirm('¿Estás seguro de eliminar este producto?')) return

  try {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', productoSeleccionado.value.id)

    if (error) throw error

    mostrarMensaje('exito', 'Producto eliminado')
    productoSeleccionado.value = null
    await cargarProductos()
  } catch (e) {
    console.error('Error eliminando producto:', e)
    mostrarMensaje('error', 'Error al eliminar')
  }
}

// GESTIÓN DE GRUPOS DE OPCIONES
async function agregarGrupo() {
  if (!nuevoGrupo.value.nombre.trim()) return
  if (productoSeleccionado.value.id === 'nuevo') {
    mostrarMensaje('error', 'Primero guarda el producto')
    return
  }

  try {
    const { data, error } = await supabase
      .from('grupos_opciones')
      .insert({
        producto_id: productoSeleccionado.value.id,
        nombre: nuevoGrupo.value.nombre,
        es_obligatorio: nuevoGrupo.value.es_obligatorio
      })
      .select()
      .single()

    if (error) throw error

    gruposOpciones.value.push({ ...data, opciones: [] })
    nuevoGrupo.value = { nombre: '', es_obligatorio: false }
    mostrarMensaje('exito', 'Grupo añadido')
  } catch (e) {
    console.error('Error añadiendo grupo:', e)
    mostrarMensaje('error', 'Error al añadir grupo')
  }
}

async function eliminarGrupo(grupoId) {
  if (!confirm('¿Eliminar este grupo y todas sus opciones?')) return

  try {
    const { error } = await supabase
      .from('grupos_opciones')
      .delete()
      .eq('id', grupoId)

    if (error) throw error

    gruposOpciones.value = gruposOpciones.value.filter(g => g.id !== grupoId)
    mostrarMensaje('exito', 'Grupo eliminado')
  } catch (e) {
    console.error('Error eliminando grupo:', e)
    mostrarMensaje('error', 'Error al eliminar grupo')
  }
}

// GESTIÓN DE OPCIONES
async function agregarOpcion(grupoId) {
  const nombre = prompt('Nombre de la opción:')
  if (!nombre) return

  const precioStr = prompt('Precio adicional (0 si es gratis):', '0')
  const precio = parseFloat(precioStr) || 0

  try {
    const { data, error } = await supabase
      .from('opciones')
      .insert({
        grupo_id: grupoId,
        nombre: nombre,
        precio_adicional: precio
      })
      .select()
      .single()

    if (error) throw error

    const grupo = gruposOpciones.value.find(g => g.id === grupoId)
    if (grupo) {
      if (!grupo.opciones) grupo.opciones = []
      grupo.opciones.push(data)
    }
    mostrarMensaje('exito', 'Opción añadida')
  } catch (e) {
    console.error('Error añadiendo opción:', e)
    mostrarMensaje('error', 'Error al añadir opción')
  }
}

async function eliminarOpcion(grupoId, opcionId) {
  try {
    const { error } = await supabase
      .from('opciones')
      .delete()
      .eq('id', opcionId)

    if (error) throw error

    const grupo = gruposOpciones.value.find(g => g.id === grupoId)
    if (grupo && grupo.opciones) {
      grupo.opciones = grupo.opciones.filter(o => o.id !== opcionId)
    }
  } catch (e) {
    console.error('Error eliminando opción:', e)
  }
}

async function actualizarOpcion(opcion) {
  try {
    const { error } = await supabase
      .from('opciones')
      .update({
        nombre: opcion.nombre,
        precio_adicional: opcion.precio_adicional
      })
      .eq('id', opcion.id)

    if (error) throw error
  } catch (e) {
    console.error('Error actualizando opción:', e)
  }
}

function mostrarMensaje(tipo, texto) {
  mensaje.value = { tipo, texto }
  setTimeout(() => {
    mensaje.value = { tipo: '', texto: '' }
  }, 3000)
}

function cerrarSesion() {
  sessionStorage.removeItem('adminAuth')
  sessionStorage.removeItem('userRole')
  router.push('/admin/login')
}
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
          class="flex items-center gap-3 px-4 py-3 bg-[#e27246]/10 text-[#e27246] rounded-xl font-semibold"
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

    <!-- Panel de Lista de Productos -->
    <div class="w-80 border-r border-gray-800/50 flex flex-col bg-[#0f1115] shrink-0">
      <!-- Header con búsqueda -->
      <div class="p-4 space-y-3 border-b border-gray-800/50">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">search</span>
          <input
            v-model="searchQuery"
            class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm focus:ring-2 focus:ring-[#e27246] focus:border-transparent text-white placeholder-gray-500"
            placeholder="Buscar productos..."
            type="text"
          />
        </div>
        <button
          @click="nuevoProducto"
          class="w-full py-3 bg-[#e27246] hover:bg-[#c25f38] text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          Nuevo Producto
        </button>
      </div>

      <!-- Lista de productos por categoría -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin w-8 h-8 border-4 border-[#e27246] border-t-transparent rounded-full"></div>
        </div>

        <template v-else>
          <div v-for="(prods, categoria) in productosPorCategoria" :key="categoria" class="py-3">
            <h3 class="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{{ categoria }}</h3>
            <div class="space-y-1 px-2">
              <button
                v-for="producto in prods"
                :key="producto.id"
                @click="seleccionarProducto(producto)"
                :class="[
                  'w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all text-left',
                  productoSeleccionado?.id === producto.id
                    ? 'bg-[#e27246]/20 border border-[#e27246]/30'
                    : 'hover:bg-gray-800/50'
                ]"
              >
                <div
                  class="w-12 h-12 rounded-lg bg-cover bg-center shrink-0 bg-gray-800 flex items-center justify-center overflow-hidden"
                  :style="producto.imagen_url ? `background-image: url('${producto.imagen_url}')` : ''"
                >
                  <span v-if="!producto.imagen_url" class="material-symbols-outlined text-gray-600">restaurant</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold truncate">{{ producto.nombre }}</p>
                  <p class="text-xs text-[#e27246] font-bold">{{ producto.precio_base?.toFixed(2) }}€</p>
                </div>
                <span
                  v-if="!producto.disponible"
                  class="text-[9px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full font-bold uppercase"
                >
                  Agotado
                </span>
              </button>
            </div>
          </div>

          <div v-if="productos.length === 0" class="text-center py-12">
            <span class="material-symbols-outlined text-5xl text-gray-700">inventory_2</span>
            <p class="mt-3 text-gray-500 text-sm">No hay productos</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Editor Principal -->
    <main class="flex-1 flex flex-col overflow-hidden bg-[#0a0b0d]">
      <!-- Sin producto seleccionado -->
      <div v-if="!productoSeleccionado" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="w-24 h-24 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-5xl text-gray-600">touch_app</span>
          </div>
          <p class="text-gray-400 font-medium">Selecciona un producto para editar</p>
          <p class="text-sm text-gray-600 mt-1">o crea uno nuevo</p>
        </div>
      </div>

      <!-- Editor de producto -->
      <template v-else>
        <!-- Header del editor -->
        <header class="h-16 border-b border-gray-800/50 flex items-center justify-between px-6 bg-[#0f1115] shrink-0">
          <div class="flex items-center gap-4">
            <h2 class="text-lg font-bold">
              {{ productoSeleccionado.id === 'nuevo' ? 'Nuevo Producto' : formulario.nombre || 'Sin nombre' }}
            </h2>
            <span
              v-if="productoSeleccionado.id !== 'nuevo'"
              :class="formulario.disponible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'"
              class="px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider"
            >
              {{ formulario.disponible ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="descartarCambios"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:bg-gray-800 transition-colors"
            >
              Descartar
            </button>
            <button
              @click="guardarProducto"
              :disabled="saving"
              class="px-6 py-2 rounded-lg bg-[#e27246] hover:bg-[#c25f38] text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="saving" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </header>

        <!-- Mensaje de estado -->
        <div
          v-if="mensaje.texto"
          :class="[
            'mx-6 mt-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2',
            mensaje.tipo === 'exito' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          ]"
        >
          <span class="material-symbols-outlined text-lg">{{ mensaje.tipo === 'exito' ? 'check_circle' : 'error' }}</span>
          {{ mensaje.texto }}
        </div>

        <!-- Pestañas -->
        <div class="px-6 pt-4 border-b border-gray-800/50">
          <div class="flex gap-1">
            <button
              @click="tabActiva = 'basico'"
              :class="[
                'px-5 py-3 text-sm font-semibold rounded-t-xl transition-all',
                tabActiva === 'basico'
                  ? 'bg-[#1a1d23] text-white border-t border-l border-r border-gray-800/50'
                  : 'text-gray-500 hover:text-gray-300'
              ]"
            >
              Información Básica
            </button>
            <button
              @click="tabActiva = 'inventario'"
              :class="[
                'px-5 py-3 text-sm font-semibold rounded-t-xl transition-all',
                tabActiva === 'inventario'
                  ? 'bg-[#1a1d23] text-white border-t border-l border-r border-gray-800/50'
                  : 'text-gray-500 hover:text-gray-300'
              ]"
            >
              Inventario
            </button>
          </div>
        </div>

        <!-- Contenido del editor -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div class="p-6">
            <!-- TAB: Información Básica -->
            <div v-if="tabActiva === 'basico'" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Columna izquierda: Detalles -->
              <div class="space-y-6">
                <!-- Nombre -->
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre del Producto</label>
                  <input
                    v-model="formulario.nombre"
                    class="w-full px-4 py-3 bg-[#1a1d23] border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#e27246] focus:border-transparent text-white font-medium"
                    type="text"
                    placeholder="Ej: Pizza Margarita"
                  />
                </div>

                <!-- Descripción -->
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</label>
                  <textarea
                    v-model="formulario.descripcion"
                    class="w-full px-4 py-3 bg-[#1a1d23] border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#e27246] focus:border-transparent text-white font-medium resize-none"
                    rows="3"
                    placeholder="Describe el producto..."
                  ></textarea>
                </div>

                <!-- Precio y Categoría -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio (€)</label>
                    <div class="relative">
                      <input
                        v-model.number="formulario.precio_base"
                        class="w-full px-4 py-3 bg-[#1a1d23] border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#e27246] focus:border-transparent text-white font-bold text-lg"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría</label>
                    <select
                      v-model="formulario.categoria_id"
                      class="w-full px-4 py-3 bg-[#1a1d23] border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#e27246] focus:border-transparent text-white font-medium"
                    >
                      <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                        {{ cat.nombre }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Toggle Disponible -->
                <div class="p-4 bg-[#1a1d23] rounded-xl border border-gray-800 flex items-center justify-between">
                  <div>
                    <p class="text-sm font-bold">Disponible para pedidos</p>
                    <p class="text-xs text-gray-500 mt-1">Activa o desactiva este producto del menú</p>
                  </div>
                  <button
                    @click="formulario.disponible = !formulario.disponible"
                    :class="[
                      'w-14 h-8 rounded-full transition-all relative',
                      formulario.disponible ? 'bg-[#e27246]' : 'bg-gray-700'
                    ]"
                  >
                    <span
                      :class="[
                        'absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md',
                        formulario.disponible ? 'right-1' : 'left-1'
                      ]"
                    ></span>
                  </button>
                </div>
              </div>

              <!-- Columna derecha: Imagen -->
              <div class="space-y-4">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Imagen del Producto</label>

                <!-- Imagen principal -->
                <label class="block aspect-square w-full max-w-sm bg-[#1a1d23] rounded-2xl border-2 border-dashed border-gray-700 overflow-hidden cursor-pointer transition-all hover:border-[#e27246]/50 hover:bg-[#e27246]/5 relative group">
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onImagenSeleccionada"
                  />
                  <div
                    v-if="imagenPreview"
                    class="absolute inset-0 bg-cover bg-center"
                    :style="`background-image: url('${imagenPreview}')`"
                  ></div>
                  <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined text-4xl text-white mb-2">cloud_upload</span>
                    <p class="text-sm font-bold text-white">{{ imagenPreview ? 'Cambiar Imagen' : 'Subir Imagen' }}</p>
                    <p class="text-[11px] text-white/70 mt-1">Recomendado: 800x800px</p>
                  </div>
                  <div v-if="!imagenPreview" class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="material-symbols-outlined text-5xl text-gray-600 mb-3">add_photo_alternate</span>
                    <p class="text-sm font-medium text-gray-500">Haz clic para subir</p>
                    <p class="text-xs text-gray-600 mt-1">PNG, JPG hasta 5MB</p>
                  </div>
                </label>

                <!-- Galería de miniaturas (preview) -->
                <div v-if="imagenPreview" class="flex gap-2">
                  <div class="w-16 h-16 rounded-lg overflow-hidden border-2 border-[#e27246]">
                    <img :src="imagenPreview" class="w-full h-full object-cover" />
                  </div>
                  <button class="w-16 h-16 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center hover:border-gray-600 transition-colors">
                    <span class="material-symbols-outlined text-gray-600">add</span>
                  </button>
                </div>

                <p v-if="subiendoImagen" class="text-sm text-[#e27246] flex items-center gap-2">
                  <span class="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                  Subiendo imagen...
                </p>
              </div>
            </div>

            <!-- TAB: Inventario -->
            <div v-if="tabActiva === 'inventario'" class="max-w-2xl space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Stock Disponible</label>
                  <input
                    v-model.number="formulario.stock"
                    class="w-full px-4 py-3 bg-[#1a1d23] border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#e27246] focus:border-transparent text-white font-medium"
                    type="number"
                    min="0"
                  />
                  <p class="text-xs text-gray-500">Usa 999 para ilimitado</p>
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest">Alérgenos</label>
                  <input
                    v-model="formulario.alergenos"
                    class="w-full px-4 py-3 bg-[#1a1d23] border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#e27246] focus:border-transparent text-white font-medium"
                    type="text"
                    placeholder="Ej: Gluten, Lácteos..."
                  />
                </div>
              </div>

              <!-- Info card -->
              <div class="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-blue-400">info</span>
                  <div>
                    <p class="text-blue-400 font-medium text-sm">Gestión de Stock</p>
                    <p class="text-gray-400 text-xs mt-1">
                      El stock se reduce automáticamente con cada pedido. Cuando llegue a 0, el producto se marcará como agotado.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sección de Extras/Opciones (visible siempre si no es nuevo) -->
            <div v-if="productoSeleccionado.id !== 'nuevo'" class="mt-8 pt-8 border-t border-gray-800/50">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-lg font-bold flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#e27246]">tune</span>
                    Gestionar Extras
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">Añade opciones personalizables al producto</p>
                </div>
              </div>

              <!-- Tabla de Extras -->
              <div class="bg-[#1a1d23] rounded-xl border border-gray-800 overflow-hidden">
                <!-- Header de la tabla -->
                <div class="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-800/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <div class="col-span-4">Grupo</div>
                  <div class="col-span-3">Opción</div>
                  <div class="col-span-2">Precio +</div>
                  <div class="col-span-2">Tipo</div>
                  <div class="col-span-1"></div>
                </div>

                <!-- Filas de opciones -->
                <div v-for="grupo in gruposOpciones" :key="grupo.id">
                  <!-- Fila del grupo -->
                  <div class="grid grid-cols-12 gap-4 px-4 py-3 border-t border-gray-800/50 items-center bg-gray-800/20">
                    <div class="col-span-4 font-bold text-white flex items-center gap-2">
                      <span class="material-symbols-outlined text-[#e27246] text-lg">folder</span>
                      {{ grupo.nombre }}
                    </div>
                    <div class="col-span-3 text-gray-500 text-sm">{{ grupo.opciones?.length || 0 }} opciones</div>
                    <div class="col-span-2"></div>
                    <div class="col-span-2">
                      <span
                        :class="grupo.es_obligatorio ? 'bg-[#e27246]/20 text-[#e27246]' : 'bg-gray-700 text-gray-400'"
                        class="text-[10px] font-bold px-2 py-1 rounded-full uppercase"
                      >
                        {{ grupo.es_obligatorio ? 'Obligatorio' : 'Opcional' }}
                      </span>
                    </div>
                    <div class="col-span-1 flex justify-end gap-1">
                      <button
                        @click="agregarOpcion(grupo.id)"
                        class="p-1.5 hover:bg-[#e27246]/20 rounded-lg transition-colors"
                        title="Añadir opción"
                      >
                        <span class="material-symbols-outlined text-[#e27246] text-lg">add</span>
                      </button>
                      <button
                        @click="eliminarGrupo(grupo.id)"
                        class="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Eliminar grupo"
                      >
                        <span class="material-symbols-outlined text-gray-500 hover:text-red-400 text-lg">delete</span>
                      </button>
                    </div>
                  </div>

                  <!-- Opciones del grupo -->
                  <div
                    v-for="opcion in grupo.opciones"
                    :key="opcion.id"
                    class="grid grid-cols-12 gap-4 px-4 py-3 border-t border-gray-800/30 items-center hover:bg-gray-800/30 transition-colors"
                  >
                    <div class="col-span-4 pl-8 text-gray-500">└</div>
                    <div class="col-span-3">
                      <input
                        v-model="opcion.nombre"
                        @blur="actualizarOpcion(opcion)"
                        class="bg-transparent border-none focus:ring-0 text-sm font-medium p-0 w-full text-white"
                      />
                    </div>
                    <div class="col-span-2 flex items-center gap-1">
                      <span class="text-gray-500">+</span>
                      <input
                        v-model.number="opcion.precio_adicional"
                        @blur="actualizarOpcion(opcion)"
                        class="w-16 bg-transparent border-none focus:ring-0 text-sm font-bold text-[#e27246] p-0"
                        type="number"
                        step="0.01"
                      />
                      <span class="text-[#e27246]">€</span>
                    </div>
                    <div class="col-span-2"></div>
                    <div class="col-span-1 flex justify-end">
                      <button
                        @click="eliminarOpcion(grupo.id, opcion.id)"
                        class="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 hover:opacity-100"
                      >
                        <span class="material-symbols-outlined text-gray-500 hover:text-red-400 text-sm">close</span>
                      </button>
                    </div>
                  </div>

                  <!-- Sin opciones -->
                  <div v-if="!grupo.opciones?.length" class="px-4 py-4 pl-12 text-gray-500 text-sm border-t border-gray-800/30">
                    Sin opciones. Haz clic en + para añadir.
                  </div>
                </div>

                <!-- Sin grupos -->
                <div v-if="gruposOpciones.length === 0" class="px-4 py-8 text-center">
                  <span class="material-symbols-outlined text-3xl text-gray-600">playlist_add</span>
                  <p class="mt-2 text-gray-500 text-sm">No hay grupos de opciones</p>
                </div>

                <!-- Añadir nuevo grupo -->
                <div class="border-t border-gray-800/50 p-4 bg-gray-800/20">
                  <div class="flex gap-3 items-center">
                    <input
                      v-model="nuevoGrupo.nombre"
                      class="flex-1 px-4 py-2.5 bg-[#0a0b0d] border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#e27246] focus:border-transparent text-white"
                      placeholder="Nombre del nuevo grupo (ej: Tamaño, Extras...)"
                      @keyup.enter="agregarGrupo"
                    />
                    <label class="flex items-center gap-2 px-3 py-2 cursor-pointer">
                      <input v-model="nuevoGrupo.es_obligatorio" type="checkbox" class="rounded bg-gray-800 border-gray-600 text-[#e27246] focus:ring-[#e27246]" />
                      <span class="text-sm text-gray-400">Obligatorio</span>
                    </label>
                    <button
                      @click="agregarGrupo"
                      class="px-5 py-2.5 bg-[#e27246] hover:bg-[#c25f38] text-white text-sm font-bold rounded-lg transition-all"
                    >
                      Añadir Grupo
                    </button>
                  </div>
                </div>
              </div>

              <!-- Botón eliminar producto -->
              <div v-if="productoSeleccionado.id !== 'nuevo'" class="mt-8 pt-6 border-t border-gray-800/50">
                <button
                  @click="eliminarProducto"
                  class="px-6 py-3 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-lg">delete_forever</span>
                  Eliminar Producto
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3a3f4a;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #4a4f5a;
}
</style>

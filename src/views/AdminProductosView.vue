<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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

// Estado del formulario
const formulario = ref({
  nombre: '',
  descripcion: '',
  precio_base: 0,
  categoria_id: null,
  disponible: true,
  imagen_url: ''
})

// Estado de extras/opciones
const gruposOpciones = ref([])
const nuevoGrupo = ref({ nombre: '', es_obligatorio: false })
const nuevaOpcion = ref({ grupo_id: null, nombre: '', precio_adicional: 0 })

// Archivo de imagen seleccionado
const imagenFile = ref(null)
const imagenPreview = ref('')
const subiendoImagen = ref(false)

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
    imagen_url: producto.imagen_url || ''
  }
  imagenPreview.value = producto.imagen_url || ''
  imagenFile.value = null

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
    imagen_url: ''
  }
  imagenPreview.value = ''
  imagenFile.value = null
  gruposOpciones.value = []
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
      // Crear producto nuevo
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

    // Actualizar selección con datos frescos
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
  router.push('/la-toscana/table/1')
}
</script>

<template>
  <div class="bg-[#fafafa] dark:bg-[#16181d] text-slate-900 dark:text-slate-100 min-h-screen flex overflow-hidden font-[Manrope]">
    <!-- Sidebar Navigation -->
    <aside class="w-64 border-r border-slate-200 dark:border-[#3a3f4a] flex flex-col bg-[#fafafa] dark:bg-[#16181d] shrink-0">
      <div class="p-6 flex items-center gap-3">
        <div class="size-10 bg-[#ff851a] rounded-lg flex items-center justify-center text-white">
          <span class="material-symbols-outlined">restaurant</span>
        </div>
        <div>
          <h1 class="font-bold text-base leading-tight">La Toscana</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">Panel Gerente</p>
        </div>
      </div>

      <nav class="flex-1 px-4 space-y-1">
        <router-link
          to="/admin/productos"
          class="flex items-center gap-3 px-3 py-2.5 bg-[#ff851a]/10 text-[#ff851a] rounded-lg"
        >
          <span class="material-symbols-outlined">restaurant_menu</span>
          <span class="text-sm font-semibold">Gestión Menú</span>
        </router-link>

        <router-link
          to="/cocina"
          class="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#272a30] rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined">soup_kitchen</span>
          <span class="text-sm font-medium">Cocina</span>
        </router-link>

        <router-link
          to="/camarero"
          class="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#272a30] rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined">room_service</span>
          <span class="text-sm font-medium">Camarero</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-slate-200 dark:border-[#3a3f4a] space-y-2">
        <router-link
          to="/la-toscana/table/1"
          class="w-full py-2.5 bg-[#ff851a] text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-sm">visibility</span>
          Ver Menú Cliente
        </router-link>
        <button
          @click="cerrarSesion"
          class="w-full py-2.5 border border-slate-300 dark:border-[#3a3f4a] text-slate-600 dark:text-slate-400 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-[#272a30] transition-colors flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-sm">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Lista de Productos Panel -->
    <div class="w-80 border-r border-slate-200 dark:border-[#3a3f4a] flex flex-col bg-slate-50 dark:bg-[#1c1f26] shrink-0">
      <div class="p-4 space-y-3">
        <!-- Buscador -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            v-model="searchQuery"
            class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#272a30] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#ff851a] dark:text-white placeholder-slate-400"
            placeholder="Buscar platos..."
            type="text"
          />
        </div>
        <!-- Botón nuevo producto -->
        <button
          @click="nuevoProducto"
          class="w-full py-2.5 bg-[#ff851a]/20 text-[#ff851a] text-sm font-bold rounded-lg hover:bg-[#ff851a]/30 transition-colors flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          Nuevo Producto
        </button>
      </div>

      <!-- Lista de productos por categoría -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin w-8 h-8 border-4 border-[#ff851a] border-t-transparent rounded-full"></div>
        </div>

        <template v-else>
          <div v-for="(prods, categoria) in productosPorCategoria" :key="categoria" class="px-4 py-2">
            <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">{{ categoria }}</h3>
            <div class="space-y-1">
              <div
                v-for="producto in prods"
                :key="producto.id"
                @click="seleccionarProducto(producto)"
                :class="[
                  'flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors',
                  productoSeleccionado?.id === producto.id
                    ? 'bg-[#ff851a]/5 border border-[#ff851a]/20'
                    : 'hover:bg-slate-200 dark:hover:bg-[#272a30]'
                ]"
              >
                <div
                  class="size-12 rounded-lg bg-cover bg-center shrink-0 bg-slate-200 dark:bg-[#272a30] flex items-center justify-center"
                  :style="producto.imagen_url ? `background-image: url('${producto.imagen_url}')` : ''"
                >
                  <span v-if="!producto.imagen_url" class="material-symbols-outlined text-slate-400">restaurant</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ producto.nombre }}</p>
                  <p class="text-xs text-[#ff851a] font-semibold">{{ producto.precio_base?.toFixed(2) }}€</p>
                </div>
                <span
                  v-if="!producto.disponible"
                  class="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium"
                >
                  Agotado
                </span>
              </div>
            </div>
          </div>

          <div v-if="productos.length === 0" class="text-center py-12">
            <span class="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
            <p class="mt-2 text-slate-500 text-sm">No hay productos</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Editor Principal -->
    <main class="flex-1 flex flex-col overflow-y-auto bg-[#fafafa] dark:bg-[#16181d] custom-scrollbar">
      <!-- Sin producto seleccionado -->
      <div v-if="!productoSeleccionado" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <span class="material-symbols-outlined text-6xl text-slate-300">touch_app</span>
          <p class="mt-4 text-slate-500">Selecciona un producto para editar</p>
          <p class="text-sm text-slate-400">o crea uno nuevo</p>
        </div>
      </div>

      <!-- Editor de producto -->
      <template v-else>
        <!-- Header del editor -->
        <header class="h-16 border-b border-slate-200 dark:border-[#3a3f4a] flex items-center justify-between px-8 bg-[#fafafa]/80 dark:bg-[#16181d]/80 backdrop-blur-md sticky top-0 z-10">
          <div class="flex items-center gap-4">
            <h2 class="text-lg font-bold">
              {{ productoSeleccionado.id === 'nuevo' ? 'Nuevo Producto' : `Editar: ${productoSeleccionado.nombre}` }}
            </h2>
            <span
              v-if="productoSeleccionado.id !== 'nuevo'"
              :class="formulario.disponible ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'"
              class="px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider"
            >
              {{ formulario.disponible ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button
              v-if="productoSeleccionado.id !== 'nuevo'"
              @click="eliminarProducto"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Eliminar
            </button>
            <button
              @click="productoSeleccionado = null"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#272a30] transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="guardarProducto"
              :disabled="saving"
              class="px-6 py-2 rounded-lg bg-[#ff851a] text-white text-sm font-bold shadow-lg shadow-[#ff851a]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </header>

        <!-- Mensaje de estado -->
        <div
          v-if="mensaje.texto"
          :class="[
            'mx-8 mt-4 px-4 py-3 rounded-lg text-sm font-medium',
            mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          ]"
        >
          {{ mensaje.texto }}
        </div>

        <div class="p-8 max-w-4xl mx-auto w-full space-y-8">
          <!-- Grid del editor -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Columna izquierda: Detalles -->
            <div class="space-y-6">
              <!-- Nombre -->
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre del Producto</label>
                <input
                  v-model="formulario.nombre"
                  class="w-full px-4 py-3 bg-white dark:bg-[#272a30] border-none rounded-xl focus:ring-2 focus:ring-[#ff851a] dark:text-white font-medium"
                  type="text"
                  placeholder="Ej: Pizza Margarita"
                />
              </div>

              <!-- Descripción -->
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</label>
                <textarea
                  v-model="formulario.descripcion"
                  class="w-full px-4 py-3 bg-white dark:bg-[#272a30] border-none rounded-xl focus:ring-2 focus:ring-[#ff851a] dark:text-white font-medium resize-none"
                  rows="3"
                  placeholder="Describe el producto..."
                ></textarea>
              </div>

              <!-- Precio y Categoría -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Precio (€)</label>
                  <input
                    v-model.number="formulario.precio_base"
                    class="w-full px-4 py-3 bg-white dark:bg-[#272a30] border-none rounded-xl focus:ring-2 focus:ring-[#ff851a] dark:text-white font-medium"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Categoría</label>
                  <select
                    v-model="formulario.categoria_id"
                    class="w-full px-4 py-3 bg-white dark:bg-[#272a30] border-none rounded-xl focus:ring-2 focus:ring-[#ff851a] dark:text-white font-medium"
                  >
                    <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                      {{ cat.nombre }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Toggle Disponible -->
              <div class="p-4 bg-white dark:bg-[#272a30] rounded-xl flex items-center justify-between">
                <div>
                  <p class="text-sm font-bold">Disponible para pedidos</p>
                  <p class="text-xs text-slate-500">Activa o desactiva este producto del menú</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="formulario.disponible" type="checkbox" class="sr-only peer" />
                  <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff851a]"></div>
                </label>
              </div>
            </div>

            <!-- Columna derecha: Imagen -->
            <div class="space-y-6">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Imagen del Producto</label>
              <div class="relative group">
                <label class="block aspect-square w-full bg-slate-100 dark:bg-[#272a30] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden cursor-pointer transition-all hover:border-[#ff851a]/50 hover:bg-[#ff851a]/5">
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
                  <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined text-4xl text-white mb-2">cloud_upload</span>
                    <p class="text-sm font-bold text-white">{{ imagenPreview ? 'Cambiar Imagen' : 'Subir Imagen' }}</p>
                    <p class="text-[11px] text-white/70 mt-1">Recomendado: 800x800px</p>
                  </div>
                  <div v-if="!imagenPreview" class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">add_photo_alternate</span>
                    <p class="text-sm font-medium text-slate-500">Haz clic para subir</p>
                  </div>
                </label>
              </div>
              <p v-if="subiendoImagen" class="text-sm text-[#ff851a] flex items-center gap-2">
                <span class="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                Subiendo imagen...
              </p>
            </div>
          </div>

          <!-- Sección de Extras/Opciones -->
          <div v-if="productoSeleccionado.id !== 'nuevo'" class="space-y-4 pt-6 border-t border-slate-200 dark:border-[#3a3f4a]">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold">Gestionar Opciones</h3>
                <p class="text-sm text-slate-500">Añade grupos de opciones (tamaño, base, extras...)</p>
              </div>
            </div>

            <!-- Formulario para nuevo grupo -->
            <div class="flex gap-3 items-end bg-white dark:bg-[#272a30] p-4 rounded-xl">
              <div class="flex-1">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Nuevo Grupo</label>
                <input
                  v-model="nuevoGrupo.nombre"
                  class="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-[#1c1f26] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#ff851a]"
                  placeholder="Ej: Tamaño, Base, Extras..."
                  @keyup.enter="agregarGrupo"
                />
              </div>
              <label class="flex items-center gap-2 px-3 py-2">
                <input v-model="nuevoGrupo.es_obligatorio" type="checkbox" class="rounded text-[#ff851a] focus:ring-[#ff851a]" />
                <span class="text-sm">Obligatorio</span>
              </label>
              <button
                @click="agregarGrupo"
                class="px-4 py-2 bg-[#ff851a]/20 text-[#ff851a] text-sm font-bold rounded-lg hover:bg-[#ff851a]/30 transition-colors"
              >
                Añadir
              </button>
            </div>

            <!-- Lista de grupos existentes -->
            <div v-for="grupo in gruposOpciones" :key="grupo.id" class="bg-white dark:bg-[#272a30] rounded-xl overflow-hidden">
              <div class="px-4 py-3 bg-slate-50 dark:bg-[#1c1f26] flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="font-bold">{{ grupo.nombre }}</span>
                  <span
                    :class="grupo.es_obligatorio ? 'bg-[#ff851a]/10 text-[#ff851a]' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
                    class="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                  >
                    {{ grupo.es_obligatorio ? 'Obligatorio' : 'Opcional' }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="agregarOpcion(grupo.id)"
                    class="text-[#ff851a] hover:bg-[#ff851a]/10 p-1 rounded transition-colors"
                    title="Añadir opción"
                  >
                    <span class="material-symbols-outlined text-sm">add</span>
                  </button>
                  <button
                    @click="eliminarGrupo(grupo.id)"
                    class="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                    title="Eliminar grupo"
                  >
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>

              <!-- Opciones del grupo -->
              <div v-if="grupo.opciones?.length" class="divide-y divide-slate-100 dark:divide-[#3a3f4a]">
                <div
                  v-for="opcion in grupo.opciones"
                  :key="opcion.id"
                  class="px-4 py-3 flex items-center gap-4"
                >
                  <input
                    v-model="opcion.nombre"
                    @blur="actualizarOpcion(opcion)"
                    class="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium p-0"
                  />
                  <div class="flex items-center gap-1">
                    <span class="text-sm text-slate-400">+</span>
                    <input
                      v-model.number="opcion.precio_adicional"
                      @blur="actualizarOpcion(opcion)"
                      class="w-16 bg-transparent border-none focus:ring-0 text-sm font-medium text-[#ff851a] p-0 text-right"
                      type="number"
                      step="0.01"
                    />
                    <span class="text-sm text-[#ff851a]">€</span>
                  </div>
                  <button
                    @click="eliminarOpcion(grupo.id, opcion.id)"
                    class="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span class="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
              <div v-else class="px-4 py-6 text-center text-slate-400 text-sm">
                Sin opciones. Haz clic en + para añadir.
              </div>
            </div>

            <div v-if="gruposOpciones.length === 0" class="text-center py-8 text-slate-400">
              <span class="material-symbols-outlined text-3xl">tune</span>
              <p class="mt-2 text-sm">No hay grupos de opciones</p>
              <p class="text-xs">Crea un grupo arriba para añadir opciones</p>
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
</style>

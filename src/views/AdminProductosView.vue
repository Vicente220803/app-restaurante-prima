<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <router-link to="/admin" class="text-gray-500 hover:text-gray-700">
            <ArrowLeft class="w-6 h-6" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">Gestionar Productos</h1>
        </div>
        <button
          @click="mostrarFormulario = true"
          class="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition"
        >
          <Plus class="w-5 h-5" />
          Nuevo Plato
        </button>
      </div>
    </header>

    <!-- Lista de productos existentes -->
    <main class="max-w-4xl mx-auto px-4 py-6">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando productos...</p>
      </div>

      <!-- Lista de productos -->
      <div v-else class="space-y-4">
        <div v-if="productos.length === 0" class="text-center py-12 bg-white rounded-xl shadow">
          <Package class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">No hay productos todavia</p>
          <button
            @click="mostrarFormulario = true"
            class="mt-4 text-orange-500 hover:text-orange-600 font-medium"
          >
            Crear tu primer plato
          </button>
        </div>

        <div
          v-for="producto in productos"
          :key="producto.id"
          class="bg-white rounded-xl shadow p-4 flex gap-4"
        >
          <img
            v-if="producto.imagen_url"
            :src="producto.imagen_url"
            :alt="producto.nombre"
            class="w-20 h-20 object-cover rounded-lg"
          />
          <div v-else class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
            <ImageIcon class="w-8 h-8 text-gray-400" />
          </div>

          <div class="flex-1">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-gray-800">{{ producto.nombre }}</h3>
                <p class="text-sm text-gray-500">{{ producto.categoria }}</p>
                <p v-if="producto.ingredientes" class="text-xs text-gray-400 mt-1">
                  {{ producto.ingredientes }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold text-orange-500">{{ producto.precio?.toFixed(2) }} EUR</p>
                <span
                  :class="producto.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  class="text-xs px-2 py-1 rounded-full"
                >
                  {{ producto.disponible ? 'Disponible' : 'Agotado' }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <button
              @click="editarProducto(producto)"
              class="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
            >
              <Pencil class="w-5 h-5" />
            </button>
            <button
              @click="eliminarProducto(producto.id)"
              class="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Formulario -->
    <div
      v-if="mostrarFormulario"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="cerrarFormulario"
    >
      <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <!-- Header del modal -->
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-800">
            {{ editando ? 'Editar Plato' : 'Nuevo Plato' }}
          </h2>
          <button @click="cerrarFormulario" class="text-gray-500 hover:text-gray-700">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="guardarProducto" class="p-6 space-y-4">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre del plato *
            </label>
            <input
              v-model="formulario.nombre"
              type="text"
              required
              placeholder="Ej: Pizza Margarita"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <!-- Descripcion -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Descripcion
            </label>
            <textarea
              v-model="formulario.descripcion"
              rows="2"
              placeholder="Breve descripcion del plato..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            ></textarea>
          </div>

          <!-- Precio y Categoria en fila -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Precio -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Precio (EUR) *
              </label>
              <input
                v-model.number="formulario.precio"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <!-- Categoria -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                v-model="formulario.categoria_id"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option :value="null">Seleccionar...</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>
          </div>

          <!-- Disponible -->
          <div class="flex items-center gap-2">
            <input
              v-model="formulario.disponible"
              type="checkbox"
              id="disponible"
              class="w-4 h-4 text-orange-500 focus:ring-orange-500 rounded"
            />
            <label for="disponible" class="text-sm text-gray-700">
              Disponible para pedidos
            </label>
          </div>

          <!-- Mensaje de error -->
          <div v-if="error" class="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>

          <!-- Mensaje de exito -->
          <div v-if="exito" class="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
            {{ exito }}
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="cerrarFormulario"
              class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="guardando" class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
              {{ guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { ArrowLeft, Plus, X, Pencil, Trash2, Package, Image as ImageIcon } from 'lucide-vue-next'

// Estado
const loading = ref(true)
const productos = ref([])
const categorias = ref([])
const mostrarFormulario = ref(false)
const guardando = ref(false)
const editando = ref(null)
const error = ref('')
const exito = ref('')
const nuevaCategoria = ref('')

// ID del restaurante (por ahora hardcodeado, luego se puede obtener del contexto)
const restaurantId = ref(null)

// Formulario inicial
const formularioInicial = {
  nombre: '',
  descripcion: '',
  precio: null,
  categoria_id: null,
  disponible: true
}

const formulario = ref({ ...formularioInicial })

// Cargar datos al montar
onMounted(async () => {
  await cargarRestaurante()
  await cargarProductos()
  await cargarCategorias()
})

// Cargar restaurante
async function cargarRestaurante() {
  try {
    const { data, error: err } = await supabase
      .from('restaurantes')
      .select('id')
      .limit(1)
      .single()

    if (data) {
      restaurantId.value = data.id
    }
  } catch (e) {
    console.log('No se pudo cargar restaurante, usando modo demo')
  }
}

// Cargar productos desde Supabase
async function cargarProductos() {
  loading.value = true
  try {
    const { data, error: err } = await supabase
      .from('productos')
      .select('*, categorias(id, nombre)')
      .order('id', { ascending: false })

    if (err) throw err

    // Mapear para incluir el nombre de la categoria
    productos.value = (data || []).map(p => ({
      ...p,
      categoria: p.categorias?.nombre || ''
    }))
  } catch (e) {
    console.error('Error cargando productos:', e)
    error.value = 'Error al cargar los productos'
  } finally {
    loading.value = false
  }
}

// Cargar categorias desde la tabla categorias de Supabase
async function cargarCategorias() {
  try {
    const { data, error: err } = await supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre')

    if (err) throw err

    if (data && data.length > 0) {
      // Guardamos objetos con id y nombre para poder usar el id al guardar
      categorias.value = data
    }
  } catch (e) {
    console.error('Error cargando categorias:', e)
  }
}

// Guardar producto
async function guardarProducto() {
  error.value = ''
  exito.value = ''
  guardando.value = true

  try {
    // Obtener categoria_id
    const categoriaId = formulario.value.categoria_id

    if (!categoriaId) {
      throw new Error('Debes seleccionar una categoria')
    }

    const productoData = {
      nombre: formulario.value.nombre,
      descripcion: formulario.value.descripcion || null,
      precio_base: formulario.value.precio,
      categoria_id: categoriaId,
      disponible: formulario.value.disponible
    }

    let resultado

    if (editando.value) {
      // Actualizar producto existente
      const { data, error: err } = await supabase
        .from('productos')
        .update(productoData)
        .eq('id', editando.value)
        .select()
        .single()

      if (err) throw err
      resultado = data
      exito.value = 'Producto actualizado correctamente'
    } else {
      // Crear nuevo producto
      const { data, error: err } = await supabase
        .from('productos')
        .insert(productoData)
        .select()
        .single()

      if (err) throw err
      resultado = data
      exito.value = 'Producto creado correctamente'
    }

    // Actualizar lista local
    await cargarProductos()

    // Cerrar formulario despues de un momento
    setTimeout(() => {
      cerrarFormulario()
    }, 1500)

  } catch (e) {
    console.error('Error guardando producto:', e)
    error.value = e.message || 'Error al guardar el producto'
  } finally {
    guardando.value = false
  }
}

// Editar producto
function editarProducto(producto) {
  editando.value = producto.id
  formulario.value = {
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    precio: producto.precio_base,
    categoria_id: producto.categoria_id,
    disponible: producto.disponible ?? true
  }
  mostrarFormulario.value = true
}

// Eliminar producto
async function eliminarProducto(id) {
  if (!confirm('Estas seguro de eliminar este producto?')) return

  try {
    const { error: err } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)

    if (err) throw err

    // Actualizar lista local
    productos.value = productos.value.filter(p => p.id !== id)
  } catch (e) {
    console.error('Error eliminando producto:', e)
    alert('Error al eliminar el producto')
  }
}

// Cerrar formulario y resetear
function cerrarFormulario() {
  mostrarFormulario.value = false
  editando.value = null
  formulario.value = { ...formularioInicial }
  nuevaCategoria.value = ''
  error.value = ''
  exito.value = ''
}
</script>

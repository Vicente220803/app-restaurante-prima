<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase'; // Ajusta la ruta según tu proyecto
import { useCartStore } from '../store/cart';

const props = defineProps(['product', 'isOpen']);
const emit = defineEmits(['close']);

const cartStore = useCartStore();
const grupos = ref([]);
const selecciones = ref({}); // Guardará { grupoId: opcionId }
const loading = ref(true);

onMounted(async () => {
  if (props.product) {
    // Traer grupos y sus opciones de una sola vez
    const { data, error } = await supabase
      .from('grupos_opciones')
      .select('*, opciones(*)')
      .eq('producto_id', props.product.id)
      .order('id', { ascending: true });

    if (!error) {
      grupos.value = data;
      // Inicializar selecciones obligatorias
      data.forEach(g => {
        if (g.es_obligatorio && g.opciones.length > 0) {
          selecciones.value[g.id] = g.opciones[0].id;
        }
      });
    }
    loading.value = false;
  }
});

const handleAdd = () => {
  // Calcular precio total con opciones
  let precioExtra = 0;
  const opcionesElegidas = [];

  grupos.value.forEach(g => {
    const opcionId = selecciones.value[g.id];
    const opcion = g.opciones.find(o => o.id === opcionId);
    if (opcion) {
      precioExtra += opcion.precio_adicional || 0;
      opcionesElegidas.push({ nombre: opcion.nombre, precio: opcion.precio_adicional });
    }
  });

  cartStore.addToCart({
    id: props.product.id,
    nombre: props.product.nombre,
    precioBase: props.product.precio_base,
    precioTotal: props.product.precio_base + precioExtra,
    opcionesIds: { ...selecciones.value },
    opcionesResumen: opcionesElegidas
  });

  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
    <!-- Animación de entrada suave desde abajo -->
    <div class="bg-white w-full max-w-lg rounded-t-[2rem] p-6 shadow-2xl animate-slide-up">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">{{ product.nombre }}</h2>
        <button @click="$emit('close')" class="p-2 bg-gray-100 rounded-full">✕</button>
      </div>

      <p class="text-gray-500 mb-6">{{ product.descripcion }}</p>

      <div v-if="loading" class="py-10 text-center">Cargando opciones...</div>

      <div v-else class="space-y-6 max-h-[60vh] overflow-y-auto">
        <div v-for="grupo in grupos" :key="grupo.id" class="border-b pb-4">
          <h3 class="font-semibold text-lg flex items-center">
            {{ grupo.nombre }}
            <span v-if="grupo.es_obligatorio" class="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Obligatorio</span>
          </h3>
          
          <div class="mt-3 space-y-3">
            <label v-for="opcion in grupo.opciones" :key="opcion.id" class="flex justify-between items-center cursor-pointer">
              <div class="flex items-center gap-3">
                <input 
                  type="radio" 
                  :name="grupo.id" 
                  v-model="selecciones[grupo.id]" 
                  :value="opcion.id"
                  class="w-5 h-5 text-orange-500 focus:ring-orange-500"
                >
                <span>{{ opcion.nombre }}</span>
              </div>
              <span class="text-gray-500">+{{ opcion.precio_adicional }}€</span>
            </label>
          </div>
        </div>
      </div>

      <button 
        @click="handleAdd"
        class="w-full mt-6 bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-colors"
      >
        Añadir al pedido
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
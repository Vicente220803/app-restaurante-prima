<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // <--- AÑADIDO
import { supabase } from '../supabase';
import ProductoCard from '../components/ProductoCard.vue';
import ProductModal from '../components/ProductModal.vue';
import CategoryBar from '../components/CategoryBar.vue';

const route = useRoute(); // <--- AÑADIDO

const productos = ref([]);
const categorias = ref([]);
const restaurante = ref({});
const loading = ref(true);

// Estado para el Modal
const isModalOpen = ref(false);
const selectedProduct = ref(null);

// *** CÓMO OBTENER EL RESTAURANT SLUG DEL ROUTER ***
const restaurantSlug = route.params.restaurantSlug; 

onMounted(async () => {
  try {
    // 1. Cargar datos del restaurante POR SLUG
    const { data: resData } = await supabase
      .from('restaurantes')
      .select('*')
      .eq('slug', restaurantSlug) // <--- CONSULTA POR SLUG
      .single();
    restaurante.value = resData;

    if (!resData) throw new Error("Restaurante no encontrado.");

    // 2. Cargar categorías
    const { data: catData } = await supabase
      .from('categorias')
      .select('*')
      .eq('restaurant_id', resData.id) // <--- Usamos el ID real obtenido
      .order('orden');
    categorias.value = catData;

    // 3. Cargar productos
    const { data: prodData } = await supabase
      .from('productos')
      .select('*')
      .eq('restaurant_id', resData.id) // <--- Usamos el ID real obtenido
      .eq('activa', true);
    productos.value = prodData;

  } catch (error) {
    console.error("Error cargando datos:", error);
    // Opcional: Mostrar un mensaje de error al usuario si no encuentra el restaurante
  } finally {
    loading.value = false;
  }
});

const openProduct = (producto) => {
// ... el resto del código es igual ...
  selectedProduct.value = producto;
  isModalOpen.value = true;
};
</script>


<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header con nombre del restaurante -->
    <header class="bg-white p-6 shadow-sm sticky top-0 z-40">
      <h1 class="text-2xl font-black text-gray-800">{{ restaurante.nombre || 'Menú' }}</h1>
      <p class="text-gray-500 text-sm">Menú Digital</p>
    </header>

    <!-- Barra de Categorías -->
    <CategoryBar :categorias="categorias" v-if="categorias.length" />

    <!-- Listado de Productos -->
    <main class="p-4 max-w-2xl mx-auto">
      <div v-if="loading" class="text-center py-10">Cargando menú...</div>
      
      <div v-else class="grid grid-cols-1 gap-4">
        <ProductoCard 
          v-for="producto in productos" 
          :key="producto.id" 
          :producto="producto"
        />
      </div>
    </main>

    <!-- Modal de Personalización -->
    <ProductModal 
      v-if="isModalOpen"
      :isOpen="isModalOpen"
      :product="selectedProduct"
      @close="isModalOpen = false"
    />
  </div>
</template>
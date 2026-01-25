<template>
  <div class="min-h-screen flex items-center justify-center bg-[#23160f] dark:bg-[#23160f] p-4 relative">
    <TablePinEntry
      :restaurantName="restaurantName"
      :tableNumber="tableNumber"
      :restaurantSlug="restaurantSlug"
    />

    <!-- Enlace discreto para acceso del personal -->
    <router-link
      to="/admin/login"
      class="absolute bottom-4 right-4 text-xs text-white/30 hover:text-white/60 transition-colors"
    >
      Acceso Personal
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TablePinEntry from '../components/TablePinEntry.vue'

const route = useRoute()

const restaurantName = ref('La Toscana')
const tableNumber = ref('12')
const restaurantSlug = ref('la-toscana')

onMounted(() => {
  // Obtener parámetros del QR
  const slug = route.params.restaurantSlug || 'la-toscana'
  const table = route.query.table || route.params.tableNumber || '12'

  restaurantSlug.value = slug
  restaurantName.value = slug.replace(/-/g, ' ').toUpperCase()
  tableNumber.value = table
})
</script>

<style scoped>
</style>

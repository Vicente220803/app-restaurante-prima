<template>
  <div class="min-h-screen flex items-center justify-center bg-[#23160f] dark:bg-[#23160f] p-4 relative">
    <TablePinEntry
      :restaurantName="restaurantName"
      :tableNumber="tableNumber"
      :restaurantSlug="restaurantSlug"
      :isFromQr="isFromQr"
    />
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
const isFromQr = ref(false)

onMounted(() => {
  // Obtener parámetros del QR
  const slug = route.params.restaurantSlug || 'la-toscana'
  // Si viene del QR (parámetro mesa), usarlo; si no, dejar sin mesa
  const table = route.query.mesa || null

  restaurantSlug.value = slug
  restaurantName.value = slug.replace(/-/g, ' ').toUpperCase()
  tableNumber.value = table

  // Detectar si viene del QR: si hay parámetro mesa, es desde QR
  isFromQr.value = !!table
})
</script>

<style scoped>
</style>

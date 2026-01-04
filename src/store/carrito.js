import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCarritoStore = defineStore('carrito', () => {
  const items = ref([])
  const restaurantId = ref(null)

  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
  })

  const agregarProducto = (producto) => {
    // Crear un identificador único que considere las opciones seleccionadas
    const itemKey = producto.opciones_seleccionadas
      ? `${producto.id}-${JSON.stringify(producto.opciones_seleccionadas)}`
      : producto.id

    const existingItem = items.value.find(item => item.itemKey === itemKey)

    if (existingItem) {
      existingItem.cantidad += producto.cantidad || 1
    } else {
      items.value.push({
        ...producto,
        itemKey,
        cantidad: producto.cantidad || 1,
        precio_unitario: producto.precio_unitario || producto.precio,
        precio_total: (producto.precio_unitario || producto.precio) * (producto.cantidad || 1)
      })
    }
  }

  const removerProducto = (productoId) => {
    const index = items.value.findIndex(item => item.id === productoId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const updateItem = (updatedItem) => {
    const index = items.value.findIndex(item => item.id === updatedItem.id)
    if (index > -1) {
      items.value[index] = updatedItem
    }
  }

  const vaciarCarrito = () => {
    items.value = []
  }

  const setRestaurantId = (id) => {
    restaurantId.value = id
  }

  return {
    items,
    restaurantId,
    total,
    agregarProducto,
    removerProducto,
    updateItem,
    vaciarCarrito,
    setRestaurantId
  }
})
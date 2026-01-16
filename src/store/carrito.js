import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCarritoStore = defineStore('carrito', () => {
  const items = ref([])
  const restaurantId = ref(null)

  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
  })

  const agregarProducto = (producto) => {
    console.log('Agregando producto:', producto)
    // Crear un identificador único que considere las opciones seleccionadas
    const itemKey = producto.opciones_seleccionadas
      ? `${producto.id}-${JSON.stringify(producto.opciones_seleccionadas)}`
      : producto.id

    console.log('ItemKey generado:', itemKey)
    const existingItem = items.value.find(item => item.itemKey === itemKey)

    if (existingItem) {
      existingItem.cantidad += producto.cantidad || 1
      console.log('Producto existente actualizado, nueva cantidad:', existingItem.cantidad)
    } else {
      const newItem = {
        ...producto,
        itemKey,
        cantidad: producto.cantidad || 1,
        precio_unitario: producto.precio_unitario || producto.precio,
        precio_total: (producto.precio_unitario || producto.precio) * (producto.cantidad || 1)
      }
      items.value.push(newItem)
      console.log('Nuevo producto agregado:', newItem)
    }
  }

  const removerProducto = (itemKey) => {
    console.log('Removiendo producto con itemKey:', itemKey)
    const index = items.value.findIndex(item => item.itemKey === itemKey)
    if (index > -1) {
      console.log('Producto encontrado y removido:', items.value[index])
      items.value.splice(index, 1)
    } else {
      console.log('Producto no encontrado para remover')
    }
  }

  const updateItem = (updatedItem) => {
    console.log('Actualizando item:', updatedItem)
    const index = items.value.findIndex(item => item.itemKey === updatedItem.itemKey)
    if (index > -1) {
      console.log('Item encontrado y actualizado:', items.value[index], '->', updatedItem)
      items.value[index] = updatedItem
    } else {
      console.log('Item no encontrado para actualizar')
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
import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  getters: {
    totalCart: (state) => state.items.reduce((acc, item) => acc + (item.precioTotal * item.cantidad), 0),
    total: (state) => state.items.reduce((acc, item) => acc + (item.precioTotal * item.cantidad), 0),
    countItems: (state) => state.items.reduce((acc, item) => acc + item.cantidad, 0),
    itemCount: (state) => state.items.reduce((acc, item) => acc + item.cantidad, 0)
  },
  actions: {
    // Alias para compatibilidad con diferentes vistas
    addItem(item) {
      this.addToCart({
        id: item.producto_id || item.id,
        nombre: item.nombre,
        imagen: item.imagen || null,
        precioBase: item.precio_base || item.precioBase,
        precioTotal: item.precio_total || item.precioBase || item.precio_base,
        opcionesIds: {},
        opcionesResumen: item.opciones_seleccionadas || []
      })
    },

    addToCart(item) {
      // Generamos un ID único basado en el producto y sus opciones para no duplicar filas erróneamente
      const cartItemId = `${item.id}-${JSON.stringify(item.opcionesIds)}`;

      const existingItem = this.items.find(i => i.cartItemId === cartItemId);
      if (existingItem) {
        existingItem.cantidad += 1;
      } else {
        this.items.push({ ...item, cartItemId, cantidad: 1 });
      }
    },

    removeFromCart(cartItemId) {
      const index = this.items.findIndex(i => i.cartItemId === cartItemId);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
    },

    updateQuantity(cartItemId, delta) {
      const item = this.items.find(i => i.cartItemId === cartItemId);
      if (item) {
        item.cantidad += delta;
        if (item.cantidad <= 0) {
          this.removeFromCart(cartItemId);
        }
      }
    },

    clearCart() {
      this.items = [];
    }
  }
});
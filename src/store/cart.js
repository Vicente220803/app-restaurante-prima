import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  getters: {
    totalCart: (state) => state.items.reduce((acc, item) => acc + (item.precioTotal * item.cantidad), 0),
    countItems: (state) => state.items.reduce((acc, item) => acc + item.cantidad, 0)
  },
  actions: {
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
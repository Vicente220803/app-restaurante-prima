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
    }
  }
});
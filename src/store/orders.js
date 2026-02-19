import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    confirmedOrders: [],
    tableNumber: null,
    isInitialized: false,
    unsubscribe: null
  }),

  getters: {
    totalAccumulated: (state) =>
      state.confirmedOrders.reduce((sum, order) => sum + order.total, 0),

    allItems: (state) =>
      state.confirmedOrders.flatMap(order => order.items),

    itemsWithQuantities: (state) => {
      const grouped = {}
      state.allItems.forEach(item => {
        const key = `${item.id || item.cartItemId}`
        if (grouped[key]) {
          grouped[key].cantidad += item.cantidad
        } else {
          grouped[key] = { ...item }
        }
      })
      return Object.values(grouped)
    },

    hasOrders: (state) => state.confirmedOrders.length > 0
  },

  actions: {
    async initializeFromSupabase(tableNumber) {
      if (this.isInitialized && this.tableNumber === tableNumber) return

      this.tableNumber = tableNumber

      try {
        const { data: pedidos, error } = await supabase
          .from('pedidos')
          .select('*')
          .eq('mesa', tableNumber.toString())
          .neq('estado', 'pagado')
          .order('created_at', { ascending: true })

        if (error) throw error

        if (pedidos && pedidos.length > 0) {
          this.confirmedOrders = pedidos.map(pedido => ({
            id: pedido.id,
            items: pedido.items || [],
            total: pedido.total || 0,
            timestamp: new Date(pedido.created_at),
            estado: pedido.estado
          }))
        }

        this.watchTableClosure()
        this.isInitialized = true
      } catch (e) {
        console.error('Error initializing orders:', e)
      }
    },

    addConfirmedOrder(items, total) {
      this.confirmedOrders.push({
        items,
        total,
        timestamp: new Date(),
        estado: 'pendiente'
      })
    },

    clearAllOrders() {
      this.confirmedOrders = []
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
    },

    watchTableClosure() {
      if (!this.tableNumber) return

      try {
        this.unsubscribe = supabase
          .channel(`table_${this.tableNumber}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'pedidos',
              filter: `mesa=eq.${this.tableNumber}`
            },
            (payload) => {
              if (payload.new.estado === 'pagado') {
                this.clearAllOrders()
              }
            }
          )
          .subscribe()
      } catch (e) {
        console.error('Error setting up table closure watcher:', e)
      }
    }
  }
})

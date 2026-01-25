import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    isAuthenticated: sessionStorage.getItem('adminAuth') === 'true',
    user: JSON.parse(sessionStorage.getItem('adminUser') || 'null')
  }),

  getters: {
    nombre: (state) => state.user?.nombre || 'Usuario',
    rol: (state) => state.user?.rol || '',
    restauranteId: (state) => state.user?.restaurante_id || null,
    isAdmin: (state) => state.user?.rol === 'admin',
    isCocina: (state) => state.user?.rol === 'cocina',
    isCamarero: (state) => state.user?.rol === 'camarero'
  },

  actions: {
    login(userData) {
      this.isAuthenticated = true
      this.user = userData
      sessionStorage.setItem('adminAuth', 'true')
      sessionStorage.setItem('adminUser', JSON.stringify(userData))
    },

    logout() {
      this.isAuthenticated = false
      this.user = null
      sessionStorage.removeItem('adminAuth')
      sessionStorage.removeItem('adminUser')
    }
  }
})

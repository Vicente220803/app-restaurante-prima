import { createRouter, createWebHistory } from 'vue-router'
import MenuView from './views/MenuView.vue'
import AdminView from './views/AdminView.vue'
import CocinaView from './views/CocinaView.vue'
import ComandasView from './views/ComandasView.vue'

const routes = [
  {
    path: '/:restaurantSlug/menu',
    name: 'Menu',
    component: MenuView
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView
  },
  {
    path: '/cocina',
    name: 'Cocina',
    component: CocinaView
  },
  {
    path: '/comandas',
    name: 'Comandas',
    component: ComandasView
  },
  // Redirección por defecto
  {
    path: '/',
    redirect: '/la-toscana/menu'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
import { createRouter, createWebHistory } from 'vue-router'
import MenuView from './views/MenuView.vue'
import CartView from './views/CartView.vue'
import AdminView from './views/AdminView.vue'
import CocinaView from './views/CocinaView.vue'
import ComandasView from './views/ComandasView.vue'
import TableEntryView from './views/TableEntryView.vue'

const routes = [
  {
    path: '/:restaurantSlug/table/:tableNumber',
    name: 'TableEntry',
    component: TableEntryView
  },
  {
    path: '/:restaurantSlug/menu',
    name: 'Menu',
    component: MenuView
  },
  {
    path: '/:restaurantSlug/cart',
    name: 'Cart',
    component: CartView
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
  // Redirección por defecto - ir a la entrada de mesa para demo
  {
    path: '/',
    redirect: '/la-toscana/table/1'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
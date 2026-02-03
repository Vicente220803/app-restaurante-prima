import { createRouter, createWebHistory } from 'vue-router'
import MenuView from './views/MenuView.vue'
import CartView from './views/CartView.vue'
import AdminView from './views/AdminView.vue'
import AdminProductosView from './views/AdminProductosView.vue'
import AdminLoginView from './views/AdminLoginView.vue'
import CocinaView from './views/CocinaView.vue'
import ComandasView from './views/ComandasView.vue'
import TableEntryView from './views/TableEntryView.vue'
import CamareroView from './views/CamareroView.vue'
import MenuNinosView from './views/MenuNinosView.vue'
import MenuChefView from './views/MenuChefView.vue'
import PaymentView from './views/PaymentView.vue'
import GestionView from './views/GestionView.vue'
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
    path: '/:restaurantSlug/menu-ninos',
    name: 'MenuNinos',
    component: MenuNinosView
  },
  {
    path: '/:restaurantSlug/menu-chef',
    name: 'MenuChef',
    component: MenuChefView
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLoginView
  },
  {
    path: '/admin',
    redirect: '/camarero'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/productos',
    name: 'AdminProductos',
    component: AdminProductosView,
    meta: { requiresAdmin: true }
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
  {
    path: '/camarero',
    name: 'Camarero',
    component: CamareroView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/pago/:mesaId',
    name: 'Payment',
    component: PaymentView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/gestion',
    name: 'Gestion',
    component: GestionView,
    meta: { requiresAdmin: true }
  },
  // Redireccion por defecto - ir a la entrada de mesa para demo
  {
    path: '/',
    redirect: '/la-toscana/table/1'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard para proteger rutas de admin
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true'
    if (!isAuthenticated) {
      next('/admin/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

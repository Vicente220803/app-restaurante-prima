import { createRouter, createWebHistory } from 'vue-router'
import MenuView from './views/MenuView.vue'
import CartView from './views/CartView.vue'
import AdminView from './views/AdminView.vue'
import AdminProductosView from './views/AdminProductosView.vue'
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
    redirect: '/la-toscana/table/1'
  },
  {
    path: '/admin',
    redirect: '/la-toscana/table/1'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminView,
    meta: { requiresRole: ['admin'] }
  },
  {
    path: '/admin/productos',
    name: 'AdminProductos',
    component: AdminProductosView,
    meta: { requiresRole: ['admin'] }
  },
  {
    path: '/cocina',
    name: 'Cocina',
    component: CocinaView,
    meta: { requiresRole: ['cocina'] }
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
    meta: { requiresRole: ['camarero'] }
  },
  {
    path: '/pago/:mesaId',
    name: 'Payment',
    component: PaymentView,
    meta: { requiresRole: ['camarero'] }
  },
  {
    path: '/gestion',
    name: 'Gestion',
    component: GestionView,
    meta: { requiresRole: ['gerente', 'admin'] }
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

// Navigation guard para proteger rutas según roles
router.beforeEach((to, from, next) => {
  const requiresRole = to.meta.requiresRole

  if (requiresRole && requiresRole.length > 0) {
    const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true'
    const userDataStr = sessionStorage.getItem('adminUser')

    if (!isAuthenticated || !userDataStr) {
      next('/admin/login')
      return
    }

    try {
      const userData = JSON.parse(userDataStr)
      const userRole = userData.rol

      // Verificar si el rol del usuario está permitido para esta ruta
      if (!requiresRole.includes(userRole)) {
        // Redirigir a la ruta correcta según su rol
        const roleRoutes = {
          'cocina': '/cocina',
          'camarero': '/camarero',
          'gerente': '/gestion',
          'admin': '/admin/productos'
        }
        next(roleRoutes[userRole] || '/admin/login')
        return
      }

      next()
    } catch (e) {
      console.error('Error parsing user data:', e)
      next('/admin/login')
    }
  } else {
    next()
  }
})

export default router

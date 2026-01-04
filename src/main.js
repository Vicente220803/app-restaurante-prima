import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

// Importar iconos comunes de Lucide
import {
  Menu,
  ShoppingCart,
  ChefHat,
  Users,
  Settings,
  Plus,
  Minus,
  X,
  Check,
  Clock,
  AlertCircle,
  Loader
} from 'lucide-vue-next'

const app = createApp(App)

// Registrar iconos globalmente
app.component('IconMenu', Menu)
app.component('IconShoppingCart', ShoppingCart)
app.component('IconChefHat', ChefHat)
app.component('IconUsers', Users)
app.component('IconSettings', Settings)
app.component('IconPlus', Plus)
app.component('IconMinus', Minus)
app.component('IconX', X)
app.component('IconCheck', Check)
app.component('IconClock', Clock)
app.component('IconAlertCircle', AlertCircle)
app.component('IconLoader', Loader)

app.use(createPinia())
app.use(router)
app.mount('#app')

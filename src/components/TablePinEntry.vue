<template>
  <div class="relative w-full max-w-[480px] h-[850px] max-h-[90vh] bg-background-dark rounded-xl shadow-2xl overflow-hidden flex flex-col group/design-root border border-white/10" style="background-color: #23160f;">
    <!-- Background Layer -->
    <div class="absolute inset-0 z-0 bg-blur-pizza blur-sm scale-110" style="background-image: linear-gradient(rgba(35, 22, 15, 0.85), rgba(35, 22, 15, 0.85)), url(https://lh3.googleusercontent.com/aida-public/AB6AXuCIAPOm-trw1JDoBz7WZLVQWvQX_vg025h3JdoS_Vi-oAhLSHB_qG-HpeO1dtYcEHUf1TxOac3ZtyeuZfMmD-tPcxkW4D8MdSaM3RMMDo8BT_d2A9XwHhnF0WNi8Djvfw2VXteSssw3Gq5cG3OoRvXEXioCGrAcy5lHjX1hVQreKLiAi1VeWRh-SSB3jt0iVQTOQeajbZPhC6Cwy4DibtWrNhCfp3e8vm_qZ4sVxY7FEkV8IZpnofOp8Vjfb6xUlxfSOnStlMhTa_ZD); background-size: cover; background-position: center;"></div>

    <!-- Content Overlay -->
    <div class="relative z-10 flex flex-col h-full">
      <!-- Top Nav Bar Component Variant -->
      <header class="flex items-center justify-between px-8 py-6">
        <div class="flex items-center gap-3 text-white">
          <div class="size-8 bg-primary rounded-lg flex items-center justify-center" style="background-color: #e65000;">
            <span class="material-symbols-outlined text-white text-xl">restaurant_menu</span>
          </div>
          <h2 class="text-white text-xl font-extrabold tracking-tight">{{ restaurantName }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <div class="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span class="text-white/90 text-xs font-bold uppercase tracking-widest">Digital Menu</span>
          </div>
        </div>
      </header>

      <!-- Main Content Container -->
      <div class="flex-1 flex flex-col items-center justify-center px-6">
        <!-- Table Identifier -->
        <div class="mb-2">
          <span class="text-[#e65000] font-bold text-sm uppercase tracking-[0.3em]">Bienvenido</span>
        </div>
        <h1 class="text-white text-5xl font-extrabold tracking-tight mb-4">Mesa {{ tableNumber }}</h1>

        <!-- Instruction Text -->
        <p class="text-white/70 text-base font-medium leading-relaxed text-center max-w-[280px] mb-10">
          Pide el PIN del día a tu camarero para comenzar el pedido
        </p>

        <!-- PIN Entry Card Container -->
        <div class="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl">
          <!-- PIN Input Fields -->
          <div class="flex justify-center mb-10">
            <fieldset class="relative flex gap-3">
              <input
                v-for="(digit, index) in 4"
                :key="index"
                v-model="pinDigits[index]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                placeholder="·"
                class="flex h-16 w-14 text-center bg-white/10 border-0 border-b-2 border-[#e65000]/30 focus:border-[#e65000] focus:ring-0 text-3xl font-bold text-white rounded-lg transition-all duration-200"
                @input="handlePinInput(index, $event)"
                @keydown="handleKeyDown(index, $event)"
              />
            </fieldset>
          </div>

          <!-- Custom Numeric Keypad -->
          <div class="grid grid-cols-3 gap-4">
            <!-- Numbers 1-9 -->
            <button
              v-for="num in 9"
              :key="num"
              @click="addDigit(num.toString())"
              class="h-16 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white text-2xl font-semibold transition-colors border border-white/5"
            >
              {{ num }}
            </button>

            <!-- Backspace Button -->
            <button
              @click="removeLastDigit"
              class="h-16 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-[#e65000] transition-colors border border-white/5"
            >
              <span class="material-symbols-outlined">backspace</span>
            </button>

            <!-- 0 Button -->
            <button
              @click="addDigit('0')"
              class="h-16 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white text-2xl font-semibold transition-colors border border-white/5"
            >
              0
            </button>

            <!-- Login/Confirm Button -->
            <button
              @click="submitPin"
              :disabled="pinDigits.join('').length !== 4 || loading"
              class="h-16 flex items-center justify-center rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              :style="{
                backgroundColor: pinDigits.join('').length === 4 ? '#e65000' : 'rgba(230, 80, 0, 0.5)',
                color: 'white'
              }"
              @mouseenter="!loading && pinDigits.join('').length === 4 && ($event.target.style.backgroundColor = '#d94a00')"
              @mouseleave="!loading && pinDigits.join('').length === 4 && ($event.target.style.backgroundColor = '#e65000')"
            >
              <span class="material-symbols-outlined">{{ loading ? 'schedule' : 'login' }}</span>
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mt-4 text-center">
            <p class="text-red-400 text-sm font-semibold">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Footer Area -->
      <footer class="p-8 text-center">
        <div class="flex items-center justify-center gap-2 text-white/40 mb-2">
          <span class="material-symbols-outlined text-sm">lock</span>
          <span class="text-xs font-medium uppercase tracking-widest">Acceso Seguro</span>
        </div>
        <p class="text-[10px] text-white/20 uppercase tracking-tighter">© 2024 Digital Menu System. All rights reserved.</p>
      </footer>
    </div>

    <!-- Decorative Floating Elements -->
    <div class="absolute -bottom-20 -right-20 size-64 blur-[100px] rounded-full pointer-events-none" style="background-color: rgba(230, 80, 0, 0.2);"></div>
    <div class="absolute -top-20 -left-20 size-64 blur-[100px] rounded-full pointer-events-none" style="background-color: rgba(230, 80, 0, 0.1);"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useAdminStore } from '../store/admin'

const router = useRouter()
const adminStore = useAdminStore()

const props = defineProps({
  restaurantName: {
    type: String,
    default: 'La Toscana'
  },
  tableNumber: {
    type: [String, Number],
    default: '12'
  },
  restaurantSlug: {
    type: String,
    default: 'la-toscana'
  }
})

const pinDigits = ref(['', '', '', ''])
const loading = ref(false)
const error = ref('')
const restaurante = ref(null)

// Cargar datos del restaurante al montar
onMounted(async () => {
  try {
    const { data } = await supabase
      .from('restaurantes')
      .select('id, nombre, pin_dia, pin_camarero, pin_cocina, pin_gerente')
      .eq('slug', props.restaurantSlug)
      .single()

    if (data) {
      restaurante.value = data
    }
  } catch (e) {
    console.log('Usando configuración por defecto')
  }
})

const addDigit = (digit) => {
  const currentPin = pinDigits.value.join('')
  if (currentPin.length < 4) {
    const emptyIndex = pinDigits.value.findIndex(d => d === '')
    if (emptyIndex !== -1) {
      pinDigits.value[emptyIndex] = digit
    }
  }
}

const removeLastDigit = () => {
  for (let i = pinDigits.value.length - 1; i >= 0; i--) {
    if (pinDigits.value[i] !== '') {
      pinDigits.value[i] = ''
      break
    }
  }
}

const handlePinInput = (index, event) => {
  const value = event.target.value
  if (value && !/^\d$/.test(value)) {
    pinDigits.value[index] = ''
    return
  }

  if (value && index < 3) {
    const nextInput = event.target.parentElement.children[index + 1]
    if (nextInput) nextInput.focus()
  }
}

const handleKeyDown = (index, event) => {
  if (event.key === 'Backspace') {
    event.preventDefault()
    pinDigits.value[index] = ''
    if (index > 0) {
      const prevInput = event.target.parentElement.children[index - 1]
      if (prevInput) prevInput.focus()
    }
  } else if (event.key === 'ArrowRight' && index < 3) {
    event.preventDefault()
    const nextInput = event.target.parentElement.children[index + 1]
    if (nextInput) nextInput.focus()
  } else if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    const prevInput = event.target.parentElement.children[index - 1]
    if (prevInput) prevInput.focus()
  }
}

const submitPin = async () => {
  const pin = pinDigits.value.join('')

  if (pin.length !== 4) {
    error.value = 'Por favor ingresa un PIN de 4 dígitos'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Primero: Verificar si es un PIN de personal (roles_usuario)
    const { data: staffData, error: staffError } = await supabase
      .from('roles_usuario')
      .select('*')
      .eq('pin', pin)
      .single()

    if (staffData && !staffError) {
      // PIN de personal -> Guardar datos de autenticación y actualizar store
      const userData = {
        id: staffData.id,
        nombre: staffData.nombre,
        rol: staffData.rol
      }

      sessionStorage.setItem('adminAuth', 'true')
      sessionStorage.setItem('adminUser', JSON.stringify(userData))
      adminStore.login(userData)

      // Redirigir según el rol
      const roleRoutes = {
        'cocina': '/cocina',
        'camarero': '/camarero',
        'gerente': '/admin/dashboard',
        'admin': '/admin/productos'
      }
      router.push(roleRoutes[staffData.rol] || '/admin/login')
      return
    }

    // Segundo: Verificar PIN del día para clientes
    const pinDia = restaurante.value?.pin_dia || '1111'
    if (pin === pinDia) {
      // PIN del día -> Menú para clientes
      sessionStorage.setItem('userRole', 'cliente')
      sessionStorage.setItem('clientAuth', 'true')
      router.push(`/${props.restaurantSlug}/menu?table=${props.tableNumber}`)
      return
    }

    // PIN incorrecto
    throw new Error('PIN incorrecto')
  } catch (err) {
    error.value = 'PIN incorrecto. Pide el PIN a tu camarero.'
    pinDigits.value = ['', '', '', '']
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

.bg-blur-pizza {
  background-size: cover;
  background-position: center;
}
</style>

<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background-color: #121212;">
    <div class="w-full max-w-sm">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <div class="inline-flex p-4 rounded-2xl mb-4" style="background-color: rgba(249, 115, 22, 0.1);">
          <Lock class="w-12 h-12 text-orange-500" />
        </div>
        <h1 class="text-2xl font-bold text-white">Acceso Personal</h1>
        <p class="text-gray-500 mt-2">Introduce tu PIN para continuar</p>
      </div>

      <!-- PIN Input -->
      <div class="rounded-2xl p-6" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
        <div class="flex justify-center gap-3 mb-6">
          <div
            v-for="(digit, index) in 4"
            :key="index"
            class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all"
            :style="{
              backgroundColor: pin.length > index ? '#f97316' : '#1f1f1f',
              color: pin.length > index ? 'white' : '#4b5563',
              border: pin.length === index ? '2px solid #f97316' : '2px solid transparent'
            }"
          >
            {{ pin.length > index ? '*' : '' }}
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center text-gray-400 text-sm mb-4">
          <span class="inline-block w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></span>
          Verificando...
        </div>

        <!-- Error message -->
        <div v-if="error" class="text-center text-red-500 text-sm mb-4">
          {{ error }}
        </div>

        <!-- Teclado numerico -->
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="num"
            @click="addDigit(num)"
            :disabled="loading"
            class="h-14 rounded-xl text-xl font-bold text-white transition-all hover:bg-[#2a2a2a] active:scale-95 disabled:opacity-50"
            style="background-color: #1f1f1f;"
          >
            {{ num }}
          </button>
          <button
            @click="clearPin"
            :disabled="loading"
            class="h-14 rounded-xl text-sm font-bold text-gray-400 transition-all hover:bg-[#2a2a2a] active:scale-95 disabled:opacity-50"
            style="background-color: #1f1f1f;"
          >
            Borrar
          </button>
          <button
            @click="addDigit(0)"
            :disabled="loading"
            class="h-14 rounded-xl text-xl font-bold text-white transition-all hover:bg-[#2a2a2a] active:scale-95 disabled:opacity-50"
            style="background-color: #1f1f1f;"
          >
            0
          </button>
          <button
            @click="removeDigit"
            :disabled="loading"
            class="h-14 rounded-xl flex items-center justify-center text-gray-400 transition-all hover:bg-[#2a2a2a] active:scale-95 disabled:opacity-50"
            style="background-color: #1f1f1f;"
          >
            <Delete class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Link para volver -->
      <div class="text-center mt-6">
        <router-link to="/" class="text-gray-500 hover:text-gray-400 text-sm">
          Volver al inicio
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../store/admin'
import { supabase } from '../supabase'
import { Lock, Delete } from 'lucide-vue-next'

const router = useRouter()
const adminStore = useAdminStore()

const pin = ref('')
const error = ref('')
const loading = ref(false)

function addDigit(digit) {
  if (pin.value.length < 4 && !loading.value) {
    pin.value += digit.toString()
    error.value = ''
  }
}

function removeDigit() {
  if (!loading.value) {
    pin.value = pin.value.slice(0, -1)
    error.value = ''
  }
}

function clearPin() {
  if (!loading.value) {
    pin.value = ''
    error.value = ''
  }
}

// Verificar PIN cuando tenga 4 digitos
watch(pin, async (newPin) => {
  if (newPin.length === 4) {
    loading.value = true
    error.value = ''

    try {
      // PIN de desarrollo: 1234 siempre funciona
      if (newPin === '1234') {
        adminStore.login({
          id: 1,
          user_id: null,
          nombre: 'Admin',
          rol: 'admin',
          restaurante_id: null
        })
        sessionStorage.setItem('adminAuth', 'true')
        // Admin/Gerente va primero al SALÓN (mesas)
        router.push('/camarero')
        return
      }

      // Intentar buscar en Supabase si no es el PIN de desarrollo
      const { data, error: dbError } = await supabase
        .from('roles_usuario')
        .select('*')
        .eq('pin', newPin)
        .single()

      if (dbError || !data) {
        error.value = 'PIN incorrecto'
        setTimeout(() => {
          pin.value = ''
        }, 500)
      } else {
        // PIN correcto - guardar usuario y redirigir
        adminStore.login({
          id: data.id,
          user_id: data.user_id,
          nombre: data.nombre,
          rol: data.rol,
          restaurante_id: data.restaurante_id
        })
        sessionStorage.setItem('adminAuth', 'true')

        // Redirigir segun el rol
        if (data.rol === 'cocina') {
          router.push('/cocina')
        } else if (data.rol === 'camarero') {
          router.push('/comandas')
        } else {
          // Admin/Gerente va primero al SALÓN (mesas)
          router.push('/camarero')
        }
      }
    } catch (e) {
      console.error('Error verificando PIN:', e)
      // Si hay error de conexión pero es PIN 1234, permitir acceso
      if (newPin === '1234') {
        adminStore.login({
          id: 1,
          user_id: null,
          nombre: 'Admin',
          rol: 'admin',
          restaurante_id: null
        })
        sessionStorage.setItem('adminAuth', 'true')
        // Admin/Gerente va primero al SALÓN (mesas)
        router.push('/camarero')
        return
      }
      error.value = 'Error de conexion'
      setTimeout(() => {
        pin.value = ''
      }, 500)
    } finally {
      loading.value = false
    }
  }
})
</script>

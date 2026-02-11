<script setup>
import { ref, computed, onMounted } from 'vue'
import QRCode from 'qrcode'
import { supabase } from '../supabase'

// Estado
const mesas = ref([])
const totalMesas = ref(13)
const generando = ref(null)
const mensajeExito = ref(null)
const cargando = ref(true)

// Configuración base de mesas (igual que en CamareroView)
const configuracionMesas = [
  { id: '1', nombre: 'M1', zona: 'salon' },
  { id: '2', nombre: 'M2', zona: 'salon' },
  { id: '3', nombre: 'M3', zona: 'salon' },
  { id: '4', nombre: 'M4', zona: 'salon' },
  { id: '5', nombre: 'M5', zona: 'salon' },
  { id: '6', nombre: 'M6', zona: 'salon' },
  { id: '7', nombre: 'M7', zona: 'salon' },
  { id: '8', nombre: 'M8', zona: 'salon' },
  { id: '9', nombre: 'M9', zona: 'salon' },
  { id: '10', nombre: 'M10', zona: 'salon' },
  { id: '11', nombre: 'T1', zona: 'terraza' },
  { id: '12', nombre: 'T2', zona: 'terraza' },
  { id: '13', nombre: 'T3', zona: 'terraza' }
]

// Obtener mesas configuradas
const mesasLimitadas = computed(() => {
  const total = totalMesas.value
  if (total <= configuracionMesas.length) {
    return configuracionMesas.slice(0, total)
  }

  const mesasBase = [...configuracionMesas]
  const mesasAGenerar = total - configuracionMesas.length

  for (let i = 0; i < mesasAGenerar; i++) {
    const numeroMesa = configuracionMesas.length + i + 1
    const id = numeroMesa.toString()
    const nombre = `M${numeroMesa}`
    mesasBase.push({
      id,
      nombre,
      zona: 'salon'
    })
  }

  return mesasBase
})

onMounted(async () => {
  try {
    // Cargar total de mesas desde sessionStorage
    const mesasGuardadas = sessionStorage.getItem('totalMesas')
    if (mesasGuardadas) {
      totalMesas.value = parseInt(mesasGuardadas)
    }

    // Inicializar mesas
    mesas.value = mesasLimitadas.value.map(m => ({
      ...m,
      qrGenerado: false,
      qrDataUrl: null
    }))

    // Cargar QR guardados desde Supabase
    const { data: qrsGuardados, error } = await supabase
      .from('qr_mesas')
      .select('*')
      .eq('estado', 'activo')

    if (error) throw error

    if (qrsGuardados && qrsGuardados.length > 0) {
      // Actualizar mesas con los QR guardados
      qrsGuardados.forEach(qrGuardado => {
        const mesa = mesas.value.find(m => m.id === qrGuardado.numero_mesa)
        if (mesa) {
          mesa.qrGenerado = true
          mesa.qrDataUrl = qrGuardado.qr_data_url
        }
      })
    }
  } catch (error) {
    console.error('Error cargando QR desde Supabase:', error)
  } finally {
    cargando.value = false
  }
})

// Generar QR para una mesa
const generarQRMesa = async (mesaId, nombreMesa) => {
  generando.value = mesaId
  mensajeExito.value = null

  try {
    // URL del QR - apunta a la página de entrada con la mesa
    const url = `${window.location.origin}/?mesa=${mesaId}`

    // Generar QR como data URL
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Guardar en Supabase
    const { error: upsertError } = await supabase
      .from('qr_mesas')
      .upsert({
        numero_mesa: mesaId,
        qr_data_url: qrDataUrl,
        url_qr: url,
        estado: 'activo'
      }, {
        onConflict: 'numero_mesa'
      })

    if (upsertError) throw upsertError

    // Actualizar estado de la mesa
    const mesa = mesas.value.find(m => m.id === mesaId)
    if (mesa) {
      mesa.qrGenerado = true
      mesa.qrDataUrl = qrDataUrl
    }

    mensajeExito.value = `QR de ${nombreMesa} generado y guardado`
    setTimeout(() => { mensajeExito.value = null }, 2000)
  } catch (error) {
    console.error('Error generando QR:', error)
    mensajeExito.value = 'Error al guardar el QR'
  } finally {
    generando.value = null
  }
}

// Descargar QR como imagen
const descargarQR = (mesaId, nombreMesa) => {
  const mesa = mesas.value.find(m => m.id === mesaId)
  if (!mesa || !mesa.qrDataUrl) return

  const link = document.createElement('a')
  link.href = mesa.qrDataUrl
  link.download = `QR_Mesa_${nombreMesa}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Generar todos los QR
const generarTodosQR = async () => {
  for (const mesa of mesas.value) {
    await generarQRMesa(mesa.id, mesa.nombre)
    // Pequeño delay para no saturar
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  mensajeExito.value = 'Todos los QR generados y guardados'
  setTimeout(() => { mensajeExito.value = null }, 2000)
}

// Descargar todos los QR
const descargarTodosQR = async () => {
  for (const mesa of mesas.value) {
    if (mesa.qrGenerado && mesa.qrDataUrl) {
      const link = document.createElement('a')
      link.href = mesa.qrDataUrl
      link.download = `QR_Mesa_${mesa.nombre}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // Pequeño delay entre descargas
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-3xl font-extrabold tracking-tight mb-2">Generador de Códigos QR</h2>
      <p class="text-gray-500">Crea códigos QR para cada mesa. Los clientes escanean el QR e ingresan el PIN.</p>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="flex items-center justify-center py-12">
      <div class="text-center">
        <span class="material-symbols-outlined text-4xl text-[#e27246] animate-spin block mb-3">progress_activity</span>
        <p class="text-gray-500">Cargando códigos QR guardados...</p>
      </div>
    </div>

    <!-- Mensaje de éxito -->
    <div v-if="mensajeExito" class="bg-green-500/20 border border-green-500/50 text-green-600 dark:text-green-400 p-4 rounded-xl">
      ✓ {{ mensajeExito }}
    </div>

    <!-- Contenido principal (solo si no está cargando) -->
    <template v-if="!cargando">
      <!-- Botones de acción -->
      <div class="flex gap-3 flex-wrap">
        <button
          @click="generarTodosQR"
          class="px-6 py-3 bg-[#e27246] hover:bg-[#c25f38] text-white font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          <span class="material-symbols-outlined">qr_code</span>
          Generar Todos los QR
        </button>
        <button
          @click="descargarTodosQR"
          :disabled="mesas.filter(m => m.qrGenerado).length === 0"
          class="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          <span class="material-symbols-outlined">download</span>
          Descargar Todos
        </button>
      </div>

      <!-- Grid de mesas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="mesa in mesas"
        :key="mesa.id"
        class="bg-white dark:bg-[#0f1115] border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col items-center"
      >
        <!-- Info de la mesa -->
        <h3 class="text-lg font-bold mb-4">{{ mesa.nombre }}</h3>
        <p class="text-sm text-gray-500 mb-4">{{ mesa.zona === 'terraza' ? 'Terraza' : 'Salón' }}</p>

        <!-- Vista previa QR o placeholder -->
        <div class="w-48 h-48 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center mb-4 border border-gray-300 dark:border-gray-700">
          <img
            v-if="mesa.qrGenerado && mesa.qrDataUrl"
            :src="mesa.qrDataUrl"
            :alt="`QR Mesa ${mesa.nombre}`"
            class="w-full h-full object-cover"
          />
          <div v-else class="text-center">
            <span class="material-symbols-outlined text-4xl text-gray-400 block mb-2">qr_code</span>
            <p class="text-xs text-gray-500">No generado</p>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex gap-2 w-full">
          <button
            @click="generarQRMesa(mesa.id, mesa.nombre)"
            :disabled="generando === mesa.id"
            class="flex-1 px-4 py-2 bg-[#e27246] hover:bg-[#c25f38] disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
          >
            <span v-if="generando === mesa.id" class="material-symbols-outlined animate-spin">progress_activity</span>
            <span v-else class="material-symbols-outlined">qr_code</span>
            {{ generando === mesa.id ? 'Generando...' : 'Generar' }}
          </button>
          <button
            v-if="mesa.qrGenerado"
            @click="descargarQR(mesa.id, mesa.nombre)"
            class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
          >
            <span class="material-symbols-outlined">download</span>
            Descargar
          </button>
        </div>
      </div>
      </div>

      <!-- Información de uso -->
      <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h4 class="font-bold text-blue-900 dark:text-blue-200 mb-2">¿Cómo usar?</h4>
        <ul class="text-sm text-blue-800 dark:text-blue-300 space-y-2 list-disc list-inside">
          <li>Genera los códigos QR para cada mesa</li>
          <li>Descarga las imágenes PNG</li>
          <li>Imprime y pega un código QR en cada mesa</li>
          <li>Cuando los clientes escaneen, entrarán con la mesa preestablecida</li>
          <li>Solo necesitan ingresar el PIN diario</li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

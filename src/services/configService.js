let config = null

export const loadConfig = async () => {
  if (config) return config

  try {
    const response = await fetch('/config.json')
    config = await response.json()
    return config
  } catch (error) {
    console.error('Error loading config:', error)
    // Fallback config
    return {
      restaurant: {
        name: 'Tu Restaurante',
        address: 'Dirección del restaurante',
        phone: '+34 XXX XXX XXX',
        email: 'contacto@turestaurante.com'
      },
      app: {
        title: 'Sistema de Gestión',
        version: '1.0.0'
      },
      settings: {
        currency: '€',
        taxRate: 5,
        discountRate: 10,
        language: 'es'
      }
    }
  }
}

export const getConfig = () => config

export const useConfig = async () => {
  const cfg = await loadConfig()
  return cfg
}

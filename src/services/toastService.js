export const toastService = {
  success: (mensaje) => {
    window.__toastContainer?.success(mensaje)
  },

  error: (mensaje) => {
    window.__toastContainer?.error(mensaje)
  },

  info: (mensaje) => {
    window.__toastContainer?.info(mensaje)
  },

  loading: (mensaje) => {
    return window.__toastContainer?.loading(mensaje)
  },

  dismiss: (id) => {
    window.__toastContainer?.dismiss(id)
  }
}

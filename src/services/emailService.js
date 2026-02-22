import emailjs from '@emailjs/browser'

// Inicializar EmailJS con tu Public Key
export const initializeEmailJS = () => {
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
}

// Enviar correo con resumen de ventas
export const enviarResumenVentas = async (datos) => {
  try {
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: datos.email,
        nombre_gerente: datos.nombreGerente,
        ventas_totales: datos.ventasTotales,
        fecha_turno: datos.fechaTurno,
        hora_inicio: datos.horaInicio,
        hora_fin: datos.horaFin,
        num_pedidos: datos.numPedidos,
        num_mesas: datos.numMesas,
        restaurante: 'La Toscana'
      }
    )

    console.log('Correo enviado exitosamente:', response)
    return { success: true, message: 'Correo enviado exitosamente' }
  } catch (error) {
    console.error('Error enviando correo:', error)
    return { success: false, message: 'Error al enviar correo', error }
  }
}

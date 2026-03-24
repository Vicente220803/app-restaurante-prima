# Guía de Configuración de la App

La app ahora es completamente genérica. Para personalizar para un nuevo cliente, solo necesitas editar un archivo:

## 📋 Pasos para configurar un nuevo cliente

### 1. Editar `public/config.json`

Este es el único archivo que necesitas cambiar. Contiene toda la información del restaurante:

```json
{
  "restaurant": {
    "name": "Tu Restaurante",
    "address": "Dirección del restaurante",
    "phone": "+34 XXX XXX XXX",
    "email": "contacto@turestaurante.com"
  },
  "app": {
    "title": "Sistema de Gestión",
    "version": "1.0.0"
  },
  "settings": {
    "currency": "€",
    "taxRate": 5,
    "discountRate": 10,
    "language": "es"
  }
}
```

### 2. Campos disponibles

#### `restaurant` (Requerido)
- **name**: Nombre del restaurante (aparece en menú, carrito, tickets)
- **address**: Dirección del local
- **phone**: Teléfono de contacto
- **email**: Email de contacto

#### `app`
- **title**: Título de la app
- **version**: Versión actual

#### `settings`
- **currency**: Símbolo de moneda (€, $, etc.)
- **taxRate**: Porcentaje de impuestos (ej: 5 para 5%)
- **discountRate**: Porcentaje de descuento por defecto (ej: 10 para 10%)
- **language**: Idioma (es, en, etc.)

## 🚀 Ejemplo de uso

Para **La Toscana**:
```json
{
  "restaurant": {
    "name": "La Toscana",
    "address": "Calle Principal 123, Ciudad",
    "phone": "+34 912 345 678",
    "email": "info@latoscana.es"
  },
  ...
}
```

Para **Pizza Palace**:
```json
{
  "restaurant": {
    "name": "Pizza Palace",
    "address": "Avenida Central 456, Madrid",
    "phone": "+34 934 567 890",
    "email": "contacto@pizzapalace.es"
  },
  ...
}
```

## ℹ️ Notas importantes

- Los cambios en `config.json` se aplican **automáticamente** sin necesidad de recompilación
- El archivo está en `/public/` para que sea accesible desde el navegador
- La app tiene valores por defecto si no se carga la config (muestra "Tu Restaurante")

## 📝 Dónde aparece la configuración

El nombre y contacto del restaurante aparece en:
- ✅ Menú (bienvenida)
- ✅ Carrito
- ✅ Tickets (recibo)
- ✅ Impresora térmica (datos del restaurante)

# Guía de Despliegue - App Restaurante Prima

Esta es una aplicación Vue.js SPA (Single Page Application) que requiere configuración especial del servidor para funcionar correctamente en producción.

## Problema: "Page not found" en móvil/al recargar

Si ves un error "Page not found" al recargar la página o acceder desde el móvil, es porque el servidor NO está redirigiendo correctamente las rutas al `index.html`.

## Soluciones según tu servidor

### 1. **Apache** (Recomendado para hosting tradicional)

✅ Ya incluimos un archivo `.htaccess` en la raíz del proyecto. Solo necesitas:

- Asegúrate que `mod_rewrite` está habilitado en Apache
- Deploy la carpeta `dist` a tu servidor
- El archivo `.htaccess` debe estar en la misma carpeta que `index.html`

### 2. **Nginx** (Servidores moderno)

Agrega esto a tu configuración de Nginx:

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/app-restaurante-prima/dist;
    index index.html;

    location / {
        # Intenta servir el archivo si existe
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. **Node.js / Express**

Si usas un servidor Express:

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

// Redirige todas las rutas a index.html (debe ser lo último)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000);
```

### 4. **Vercel** (Hosting moderno)

Crea un archivo `vercel.json` en la raíz:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 5. **Netlify** (Hosting moderno)

Crea un archivo `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 6. **GitHub Pages**

Para GitHub Pages, agrega a `vite.config.js`:

```javascript
export default {
  base: '/app-restaurante-prima/',
  // ... resto de config
}
```

## Para Desarrollo Local

Si estás desarrollando localmente:

1. Ejecuta: `npm run dev`
2. Accede a: `http://localhost:5173`
3. Las rutas funcionarán correctamente automáticamente en desarrollo

## Para Probar en Producción Localmente

```bash
npm run build      # Compila la app
npm run preview    # Sirve la carpeta dist localmente
```

Luego accede a `http://localhost:4173` y prueba las rutas.

## Checklist de Despliegue

- [ ] Ejecutar `npm run build`
- [ ] Subir la carpeta `dist` a tu servidor
- [ ] Configurar el servidor según tu plataforma (ver arriba)
- [ ] Subir el archivo `.htaccess` si usas Apache
- [ ] Probar la app en móvil recargando la página
- [ ] Probar navegación entre rutas

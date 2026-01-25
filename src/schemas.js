// Schemas de base de datos para Supabase
// Ejecutar estos SQL en Supabase para crear las tablas

// Tabla productos mejorada
export const productosSchema = `
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ingredientes TEXT,
  precio DECIMAL(10,2) NOT NULL,
  imagen_url VARCHAR(500),
  categoria VARCHAR(100),
  destino VARCHAR(50) CHECK (destino IN ('BARRA', 'COCINA')),
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Si la tabla ya existe, ejecutar esto para añadir la columna:
-- ALTER TABLE productos ADD COLUMN ingredientes TEXT;

-- Índices para mejor rendimiento
CREATE INDEX idx_productos_restaurant_id ON productos(restaurant_id);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_destino ON productos(destino);
`;

// Tabla opciones de productos
export const opcionesSchema = `
CREATE TABLE opciones (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL, -- ej: "Tamaño mediano", "Extra queso"
  precio_adicional DECIMAL(10,2) DEFAULT 0,
  disponible BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0, -- Para ordenar las opciones
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para opciones
CREATE INDEX idx_opciones_producto_id ON opciones(producto_id);
CREATE INDEX idx_opciones_disponible ON opciones(disponible);
`;

// Tabla pedidos
export const pedidosSchema = `
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  mesa_id INTEGER, -- Opcional para identificar mesa
  items JSONB NOT NULL, -- Array de items con id, nombre, precio_base, opciones_seleccionadas, precio_total, cantidad
  total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'preparando', 'listo', 'entregado', 'cancelado')),
  notas TEXT, -- Notas especiales del pedido
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pedidos_restaurant_id ON pedidos(restaurant_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_created_at ON pedidos(created_at);
`;

// Tabla usuarios/restaurantes (para multi-tenancy)
export const restaurantesSchema = `
CREATE TABLE restaurantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- Para URLs amigables
  owner_id UUID REFERENCES auth.users(id),
  configuracion JSONB, -- Configuración específica del restaurante
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS (Row Level Security) para multi-tenancy
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas para productos
CREATE POLICY "Users can view products from their restaurant" ON productos
  FOR SELECT USING (restaurant_id IN (
    SELECT id FROM restaurantes WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert products for their restaurant" ON productos
  FOR INSERT WITH CHECK (restaurant_id IN (
    SELECT id FROM restaurantes WHERE owner_id = auth.uid()
  ));

-- Políticas para pedidos (similar)
CREATE POLICY "Users can view orders from their restaurant" ON pedidos
  FOR SELECT USING (restaurant_id IN (
    SELECT id FROM restaurantes WHERE owner_id = auth.uid()
  ));
`;
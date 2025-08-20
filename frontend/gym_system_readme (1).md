# Sistema de Gestión de Gimnasios - Backend

## 📋 Descripción del Proyecto

Sistema completo de gestión para gimnasios pequeños con capacidades offline, desarrollado con **Electron + React + TypeScript + Node.js + SQLite**.

### Arquitectura del Sistema
```
Frontend (React + TypeScript) ← v0.dev
Backend (Node.js + Express + SQLite) ← GitHub Copilot + Claude Sonnet 4
Empaquetado (Electron) ← Integración final
```

## 🎯 Objetivos Principales

1. **Sistema Offline**: Funciona completamente sin internet
2. **Gestión Integral**: Miembros, pagos, productos, ventas
3. **Fácil Instalación**: Un solo ejecutable .exe
4. **Interfaz Moderna**: React + TypeScript con diseño profesional

## 🏗️ Estructura del Proyecto

```
gym-system/
├── frontend/                 # React + TypeScript (v0.dev)
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Utilidades
├── backend/                  # Node.js + Express (Copilot + Claude)
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Rutas API REST
│   │   ├── middleware/      # Middleware personalizado
│   │   ├── database/        # Configuración SQLite
│   │   └── utils/           # Utilidades backend
├── electron/                 # Configuración Electron
├── database/                 # Archivo SQLite
└── dist/                    # Build final
```

## 🛠️ Stack Tecnológico

### Backend (Responsabilidad de GitHub Copilot + Claude)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de Datos**: SQLite3
- **ORM/Query Builder**: Mejor3 o consultas SQL nativas
- **Validación**: Joi o Zod
- **Logging**: Winston
- **Testing**: Jest (opcional)

## 📊 Modelo de Base de Datos

### Tablas Principales

#### 1. `miembros`
```sql
CREATE TABLE miembros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(20),
    documento VARCHAR(50) UNIQUE,
    fecha_nacimiento DATE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_membresia_id INTEGER,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    foto_url TEXT,
    direccion TEXT,
    contacto_emergencia VARCHAR(255),
    telefono_emergencia VARCHAR(20),
    FOREIGN KEY (tipo_membresia_id) REFERENCES tipos_membresia(id)
);
```

#### 2. `tipos_membresia`
```sql
CREATE TABLE tipos_membresia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    duracion_dias INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `pagos`
```sql
CREATE TABLE pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    miembro_id INTEGER NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE,
    concepto VARCHAR(255),
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') DEFAULT 'efectivo',
    estado ENUM('pagado', 'pendiente', 'vencido') DEFAULT 'pagado',
    notas TEXT,
    FOREIGN KEY (miembro_id) REFERENCES miembros(id)
);
```

#### 4. `productos`
```sql
CREATE TABLE productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    codigo_barras VARCHAR(100) UNIQUE,
    descripcion TEXT,
    categoria ENUM('suplementos', 'bebidas', 'accesorios', 'ropa') NOT NULL,
    precio_compra DECIMAL(10,2),
    precio_venta DECIMAL(10,2) NOT NULL,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    fecha_vencimiento DATE,
    proveedor VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. `ventas`
```sql
CREATE TABLE ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    miembro_id INTEGER,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'cuenta_miembro') DEFAULT 'efectivo',
    estado ENUM('completada', 'cancelada') DEFAULT 'completada',
    notas TEXT,
    FOREIGN KEY (miembro_id) REFERENCES miembros(id)
);
```

#### 6. `detalle_ventas`
```sql
CREATE TABLE detalle_ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

#### 7. `accesos`
```sql
CREATE TABLE accesos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    miembro_id INTEGER NOT NULL,
    fecha_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_salida DATETIME,
    FOREIGN KEY (miembro_id) REFERENCES miembros(id)
);
```

## 🔧 APIs REST Requeridas

### Miembros
- `GET /api/miembros` - Listar todos los miembros
- `GET /api/miembros/:id` - Obtener miembro por ID
- `POST /api/miembros` - Crear nuevo miembro
- `PUT /api/miembros/:id` - Actualizar miembro
- `DELETE /api/miembros/:id` - Eliminar miembro (soft delete)
- `GET /api/miembros/buscar/:query` - Buscar miembros

### Membresías
- `GET /api/membresias` - Listar tipos de membresía
- `POST /api/membresias` - Crear tipo de membresía
- `PUT /api/membresias/:id` - Actualizar membresía

### Pagos
- `GET /api/pagos` - Listar pagos
- `GET /api/pagos/miembro/:id` - Pagos de un miembro
- `POST /api/pagos` - Registrar pago
- `GET /api/pagos/pendientes` - Pagos pendientes

### Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `GET /api/productos/stock-bajo` - Productos con stock bajo

### Ventas
- `GET /api/ventas` - Listar ventas
- `POST /api/ventas` - Procesar venta
- `GET /api/ventas/:id` - Detalle de venta
- `GET /api/ventas/reporte/:fecha` - Reporte diario

### Accesos
- `POST /api/accesos/entrada` - Registrar entrada
- `PUT /api/accesos/salida/:id` - Registrar salida
- `GET /api/accesos/activos` - Miembros actualmente en el gym

### Reportes
- `GET /api/reportes/dashboard` - Datos para dashboard
- `GET /api/reportes/ingresos/:periodo` - Reporte de ingresos
- `GET /api/reportes/miembros-activos` - Estadísticas de miembros

## ⚙️ Instrucciones para GitHub Copilot

### ✅ LO QUE DEBE HACER:

1. **Estructura Backend**:
   - Crear servidor Express con arquitectura limpia
   - Implementar todas las rutas API especificadas
   - Configurar middleware de CORS, body-parser, error handling
   - Estructurar controladores por entidad

2. **Base de Datos**:
   - Configurar SQLite3 con better-sqlite3
   - Crear scripts de inicialización de BD
   - Implementar migraciones básicas
   - Insertar datos de prueba realistas

3. **Validaciones**:
   - Validar datos de entrada en todas las APIs
   - Manejar errores de manera consistente
   - Implementar respuestas JSON estandarizadas

4. **Funcionalidades Específicas**:
   - Sistema de check-in/check-out
   - Cálculo automático de vencimientos
   - Control de stock y alertas
   - Generación de reportes básicos

5. **Optimización**:
   - Consultas SQL eficientes
   - Índices en campos clave
   - Paginación para listados grandes

### ❌ LO QUE NO DEBE HACER:

1. **NO crear frontend** - Solo backend APIs
2. **NO usar MongoDB** - Solo SQLite
3. **NO implementar autenticación** por ahora
4. **NO usar ORMs pesados** - Consultas SQL directas o query builders ligeros
5. **NO crear configuraciones complejas** - Mantener simplicidad
6. **NO usar dependencias innecesarias** - Mantener bundle pequeño

### 🔒 Restricciones Importantes:

- **Puerto fijo**: 3001 para el servidor
- **CORS**: Permitir solo localhost:3000 (React)
- **Archivo de BD**: `/database/gym.db`
- **Logs**: Solo errores importantes
- **Respuestas**: Siempre en formato JSON con estructura consistente

## 📱 Formato de Respuestas API

```typescript
// Éxito
{
  success: true,
  data: any,
  message?: string
}

// Error
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## 🧪 Datos de Prueba

Incluir datos realistas para:
- 20 miembros de ejemplo
- 5 tipos de membresía
- 50 productos variados
- 100 registros de ventas
- Accesos de los últimos 30 días

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Inicializar BD
npm run init-db

# Poblar con datos de prueba
npm run seed

# Build para producción
npm run build
```

## 📋 Checklist de Implementación

- [ ] Configuración inicial del servidor Express
- [ ] Configuración de SQLite y creación de tablas
- [ ] APIs de miembros (CRUD completo)
- [ ] APIs de productos y control de stock
- [ ] APIs de ventas y punto de venta
- [ ] APIs de pagos y membresías
- [ ] Sistema de accesos (check-in/out)
- [ ] APIs de reportes básicos
- [ ] Datos de prueba
- [ ] Manejo de errores
- [ ] Documentación de APIs

---

## 🎯 Objetivo Final

Un backend robusto y eficiente que maneje completamente la lógica de negocio de un gimnasio pequeño, preparado para integración con frontend React y empaquetado con Electron.

**Prioridad**: Funcionalidad > Perfección. Crear un sistema que funcione bien antes que uno perfectamente optimizado.
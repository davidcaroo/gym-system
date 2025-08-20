# Backend - Sistema de Gestión de Gimnasios

Backend desarrollado con **Express.js + TypeScript + SQLite** para el sistema de gestión de gimnasios.

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Inicializar base de datos
```bash
npm run init-db
```

### 3. Insertar datos de prueba
```bash
npm run seed
```

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
```

El servidor estará disponible en: `http://localhost:3001`

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/     # Controladores de la API
│   ├── models/         # Modelos de datos
│   ├── routes/         # Rutas de la API
│   ├── middleware/     # Middleware personalizado
│   ├── database/       # Configuración SQLite
│   ├── utils/          # Utilidades y validaciones
│   ├── types/          # Definiciones TypeScript
│   └── scripts/        # Scripts de inicialización
├── logs/               # Archivos de log
└── database/          # Archivo SQLite
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Compilar TypeScript
- `npm run start` - Ejecutar versión compilada
- `npm run init-db` - Inicializar base de datos
- `npm run seed` - Insertar datos de prueba
- `npm run clean` - Limpiar archivos compilados

## 📊 APIs Disponibles

### Miembros
- `GET /api/miembros` - Listar todos los miembros
- `GET /api/miembros/activos` - Listar miembros activos
- `GET /api/miembros/stats` - Estadísticas de miembros
- `GET /api/miembros/buscar/:query` - Buscar miembros
- `GET /api/miembros/:id` - Obtener miembro por ID
- `POST /api/miembros` - Crear nuevo miembro
- `PUT /api/miembros/:id` - Actualizar miembro
- `DELETE /api/miembros/:id` - Eliminar miembro

### Otras APIs (pendientes de implementación)
- `/api/membresias` - Gestión de tipos de membresía
- `/api/pagos` - Gestión de pagos
- `/api/productos` - Gestión de productos
- `/api/ventas` - Punto de venta
- `/api/accesos` - Control de accesos
- `/api/reportes` - Reportes y estadísticas

## ✅ Estado Actual

### ✅ Completado
- [x] Configuración inicial del servidor Express
- [x] Configuración de TypeScript
- [x] Configuración de SQLite con better-sqlite3
- [x] Creación de todas las tablas de la BD
- [x] Sistema de logging con Winston
- [x] Middleware de manejo de errores
- [x] Validaciones con Joi
- [x] CRUD completo de Miembros
- [x] Datos de prueba (20 miembros, 5 membresías, 20 productos)
- [x] Respuestas JSON estandarizadas

### 🔄 En Progreso
- [ ] APIs de productos y control de stock
- [ ] APIs de ventas y punto de venta
- [ ] APIs de pagos y membresías
- [ ] Sistema de accesos (check-in/out)
- [ ] APIs de reportes básicos

## 🎯 Próximos Pasos

1. Implementar CRUD de productos
2. Implementar sistema de ventas
3. Implementar gestión de pagos
4. Implementar control de accesos
5. Implementar reportes y dashboard
6. Testing básico
7. Optimizaciones de rendimiento

## 📝 Notas de Desarrollo

- **Puerto**: 3001 (configurado para no conflicto con React en 3000)
- **CORS**: Configurado para localhost:3000
- **Base de datos**: SQLite en `/database/gym.db`
- **Logs**: Guardados en `/logs/`
- **Validaciones**: Joi para validación de entrada
- **Respuestas**: Formato JSON estandarizado

## 🐛 Troubleshooting

### Error: "Cannot find module"
Si encuentras errores de módulos faltantes:
```bash
npm install
```

### Error de base de datos
Para reinicializar la base de datos:
```bash
npm run init-db
npm run seed
```

### Puerto en uso
Si el puerto 3001 está ocupado, cambiar en `src/index.ts`:
```typescript
const PORT = process.env.PORT || 3002; // Cambiar puerto
```

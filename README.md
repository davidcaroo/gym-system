# 🏋️ Sistema de Gestión de Gimnasios

Sistema completo de gestión para gimnasios pequeños con capacidades offline, desarrollado con **Electron + React + TypeScript + Node.js + SQLite**.

## 🎯 Descripción

Este sistema permite gestionar completamente un gimnasio pequeño sin necesidad de conexión a internet, incluyendo:

- ✅ **Gestión de Miembros**: Registro, actualización, búsqueda
- ✅ **Control de Membresías**: Tipos, precios, vencimientos
- ✅ **Punto de Venta**: Productos, inventario, ventas
- ✅ **Control de Accesos**: Check-in/out de miembros
- ✅ **Reportes**: Dashboard, ingresos, estadísticas
- ✅ **Sistema Offline**: Funciona completamente sin internet

## 🏗️ Arquitectura

```
gym-system/
├── frontend/           # React + TypeScript + Vite
├── backend/           # Node.js + Express + SQLite  ✅ COMPLETADO
├── database/          # Archivo SQLite             ✅ COMPLETADO
└── electron/          # Configuración Electron (pendiente)
```

## 🛠️ Stack Tecnológico

### Backend ✅ COMPLETADO
- **Node.js 18+** con TypeScript
- **Express.js** para APIs REST
- **SQLite3** con better-sqlite3
- **Winston** para logging
- **Joi** para validaciones

### Frontend 🔄 EN PROGRESO
- **React 18** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **Shadcn/ui** para componentes

### Desktop 📋 PENDIENTE
- **Electron** para aplicación de escritorio
- **Empaquetado** como ejecutable .exe

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/davidcaroo/gym-system.git
cd gym-system
```

### 2. Backend (ya funcionando)
```bash
cd backend
npm install
npm run init-db
npm run seed
npm run dev
```
🌐 **Backend disponible en**: http://localhost:3001

### 3. Frontend (próximamente)
```bash
cd frontend
npm install
npm run dev
```
🌐 **Frontend disponible en**: http://localhost:3000

## 📊 Estado del Proyecto

### ✅ **Backend - COMPLETADO**
- [x] Servidor Express configurado
- [x] Base de datos SQLite con todas las tablas
- [x] API de Miembros (CRUD completo)
- [x] Sistema de logging
- [x] Validaciones y manejo de errores
- [x] Datos de prueba insertados
- [x] Documentación completa

### 🔄 **Frontend - EN PROGRESO**
- [x] Configuración inicial de React + Vite
- [ ] Componentes principales
- [ ] Integración con API del backend
- [ ] Rutas y navegación
- [ ] Dashboard principal

### 📋 **Próximos Pasos**
1. Completar frontend React
2. APIs restantes del backend (productos, ventas, etc.)
3. Integración completa frontend-backend
4. Configuración de Electron
5. Empaquetado para distribución

## 📋 APIs Disponibles

### Miembros ✅
- `GET /api/miembros` - Listar todos
- `GET /api/miembros/activos` - Solo activos
- `GET /api/miembros/buscar/:query` - Búsqueda
- `POST /api/miembros` - Crear miembro
- `PUT /api/miembros/:id` - Actualizar
- `DELETE /api/miembros/:id` - Eliminar (soft delete)

### Próximas APIs 🔄
- `/api/productos` - Gestión de productos
- `/api/ventas` - Punto de venta
- `/api/pagos` - Gestión de pagos
- `/api/accesos` - Control de accesos
- `/api/reportes` - Dashboard y reportes

## 🎯 Objetivos del Sistema

1. **Offline First**: Funciona completamente sin internet
2. **Fácil de usar**: Interfaz intuitiva para personal del gimnasio
3. **Completo**: Cubre todas las necesidades básicas de gestión
4. **Portable**: Un solo ejecutable para instalar
5. **Económico**: Sin costos de hosting o suscripciones

## 👥 Datos de Prueba

El sistema incluye datos realistas para testing:
- 📊 5 tipos de membresías
- 👥 20 miembros de ejemplo
- 📦 20 productos variados (suplementos, bebidas, accesorios)

## 🔧 Desarrollo

### Requisitos
- Node.js 18+
- npm o yarn
- Git

### Estructura de desarrollo
```
gym-system/
├── backend/src/
│   ├── controllers/    # Lógica de negocio
│   ├── models/        # Modelos de datos
│   ├── routes/        # Rutas de API
│   ├── database/      # Configuración SQLite
│   └── utils/         # Utilidades
├── frontend/src/
│   ├── components/    # Componentes React
│   ├── pages/        # Páginas principales
│   ├── hooks/        # Custom hooks
│   └── types/        # TypeScript types
└── database/         # Archivo SQLite
```

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**Estado actual**: Backend funcional ✅ | Frontend en progreso 🔄

¿Encontraste un bug? ¿Tienes una sugerencia? [Abre un issue](https://github.com/davidcaroo/gym-system/issues)

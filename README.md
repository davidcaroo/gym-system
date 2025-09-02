# 🏋️ Gym System Pro - Sistema de Gestión de Gimnasios

Sistema completo de gestión para gimnasios con interfaz moderna, desarrollado con **Next.js + TypeScript + Node.js + SQLite**.

## 🎯 Descripción

Sistema integral para la gestión completa de gimnasios pequeños y medianos, con capacidades avanzadas de gestión:

- ✅ **Gestión de Miembros**: CRUD completo, búsqueda dinámica, gestión de membresías
- ✅ **Control de Membresías**: Tipos, precios, asignación, opción "Sin membresía"
- ✅ **Frontend Moderno**: Interfaz React con Next.js completamente funcional
- 🔄 **Punto de Venta**: Productos, inventario, ventas (próximamente)
- 🔄 **Control de Accesos**: Check-in/out, validación de membresías (próximamente)
- 🔄 **Reportes y Analytics**: Dashboard KPIs, exportación CSV (próximamente)
- 🔄 **Sistema de Pagos**: Gestión de pagos y suscripciones (próximamente)

## 🏗️ Arquitectura

```
gym-system-pro/
├── frontend/           # Next.js + TypeScript + Tailwind  ✅ CRUD MIEMBROS 100%
├── backend/           # Node.js + Express + SQLite        ✅ COMPLETADO 100%
├── database/          # Archivo SQLite                    ✅ COMPLETADO 100%
└── docs/              # Documentación de fases            ✅ COMPLETADO 100%
```

## 🛠️ Stack Tecnológico

### Backend ✅ COMPLETADO
- **Node.js 18+** con TypeScript
- **Express.js** para APIs REST
- **SQLite3** con better-sqlite3
- **Joi** para validaciones
- **CORS** y middleware de seguridad

### Frontend ✅ CRUD MIEMBROS COMPLETADO
- **Next.js 14** con TypeScript
- **Tailwind CSS** para estilos
- **Shadcn/ui** para componentes
- **Lucide React** para iconografía
- **Sistema de Toast** unificado

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/gym-system-pro.git
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

### 3. Frontend (CRUD Miembros funcional)
```bash
cd frontend
npm install
npm run dev
```
🌐 **Frontend disponible en**: http://localhost:3000
✅ **Estado**: CRUD de Miembros completamente funcional

## 📊 Estado del Proyecto

### ✅ **Backend - COMPLETADO AL 100%**

- [x] **Autenticación**: Login/logout con sesiones seguras
- [x] **Gestión de Miembros**: CRUD completo con historial
- [x] **Gestión de Productos**: Inventario automático con imágenes
- [x] **Sistema POS**: Ventas con descuentos y control de stock
- [x] **Pagos y Membresías**: Gestión completa de suscripciones y renovaciones
- [x] **Control de Accesos**: Check-in/out en tiempo real con validaciones
- [x] **Reportes Avanzados**: Analytics completos, KPIs y exportación CSV
- [x] **Base de datos**: SQLite con 8 tablas relacionadas
- [x] **Validaciones**: Joi schemas para todas las APIs
- [x] **Testing**: 100% de pruebas exitosas
- [x] **Documentación**: APIs completamente documentadas

**🎯 Estado**: Producción ready - 6 módulos completos, 30+ endpoints, 100% funcional

## 📋 PROGRESO DE DESARROLLO

### ✅ **FASE 3.1 - CRUD MIEMBROS COMPLETADA E INTEGRADA**

**🎉 Finalizada y Mergeada: 2 de Septiembre 2025**

- [x] **CRUD Completo**: Create, Read, Update, Delete de miembros
- [x] **Búsqueda Dinámica**: Filtrado instantáneo en tiempo real
- [x] **Gestión de Membresías**: Asignación y "Sin membresía" funcional
- [x] **Interfaz Moderna**: Vista en tarjetas responsive
- [x] **Sistema de Notificaciones**: Toasts unificados con estilo consistente
- [x] **Validación Robusta**: Frontend y backend sincronizados
- [x] **Persistencia Completa**: Eliminación permanente y actualizaciones
- [x] **Integración a Main**: Pull Request exitoso y merge completado
- [x] **Estado Limpio**: Sin conflictos, listo para producción

**📄 Documentación**: [FASE-3.1-COMPLETA.md](./FASE-3.1-COMPLETA.md)

### ✅ **Frontend - CRUD MIEMBROS COMPLETADO AL 100%**
- [x] **Configuración inicial**: Next.js + Tailwind + TypeScript
- [x] **Componentes base**: shadcn/ui completamente integrado
- [x] **Página de gestión de miembros**: Funcional al 100%
- [x] **Sistema de autenticación**: Integrado y operativo
- [x] **Dashboard principal**: Base funcional implementada
- [x] **Routing y navegación**: Sistema básico operativo
- [x] **Sistema de tipos**: TypeScript completamente configurado
- [x] **Estado de la aplicación**: Context API implementado

### 📋 **Próximos Pasos - FASE 3.2**

1. **Implementar Punto de Venta (POS)**
   - Interfaz de venta de productos
   - Carrito de compras funcional
   - Gestión de inventario en tiempo real
   - Sistema de descuentos

2. **Dashboard Analytics Avanzado**
   - Gráficos de ingresos y ventas
   - Métricas de miembros activos
   - Estadísticas de uso del gimnasio
   - Reportes visuales interactivos

3. **Sistema de Pagos y Membresías**
   - Gestión de cuotas y renovaciones
   - Historial de pagos detallado
   - Alertas de vencimiento
   - Control de estados de membresía

4. **Control de Accesos en Tiempo Real**
   - Check-in/check-out de miembros
   - Validación de membresías activas
   - Historial de accesos
   - Dashboard de ocupación actual

5. **Optimización y Deployment**
   - Configuración de Electron para app de escritorio
   - Optimización de rendimiento
   - Empaquetado para distribución
   - Documentación de usuario final

## 📋 APIs Disponibles

### 🔐 Autenticación ✅
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/session` - Verificar sesión

### 👥 Miembros ✅
- `GET /api/miembros` - Listar todos con filtros
- `GET /api/miembros/activos` - Solo miembros activos
- `GET /api/miembros/buscar/:query` - Búsqueda por nombre/email
- `POST /api/miembros` - Crear miembro
- `PUT /api/miembros/:id` - Actualizar miembro
- `DELETE /api/miembros/:id` - Eliminar (soft delete)

### 📦 Productos ✅
- `GET /api/productos` - Listar productos con filtros
- `GET /api/productos/:id` - Obtener producto específico
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### 💰 Ventas ✅
- `GET /api/ventas` - Listar ventas con filtros
- `GET /api/ventas/:id` - Obtener venta específica
- `POST /api/ventas` - Registrar nueva venta
- `PUT /api/ventas/:id/estado` - Actualizar estado

### 💳 Pagos y Membresías ✅
- `GET /api/pagos` - Listar pagos con filtros
- `GET /api/membresias` - Obtener tipos de membresía
- `POST /api/pagos` - Registrar pago
- `POST /api/pagos/:id/renovar` - Renovar membresía
- `GET /api/pagos/estadisticas` - Estadísticas de pagos

### 🚪 Accesos ✅
- `GET /api/accesos` - Listar accesos con filtros
- `POST /api/accesos/entrada` - Registrar entrada
- `POST /api/accesos/salida` - Registrar salida
- `GET /api/accesos/estadisticas` - Estadísticas de uso

### 📊 Reportes Avanzados ✅
- `GET /api/reportes/dashboard` - KPIs del dashboard
- `GET /api/reportes/financiero` - Reporte financiero
- `GET /api/reportes/miembros` - Analytics de miembros
- `GET /api/reportes/uso` - Estadísticas de uso
- `GET /api/reportes/pagos` - Reporte de pagos
- `GET /api/reportes/ventas` - Analytics de ventas
- `GET /api/reportes/completo` - Reporte completo
- `GET /api/reportes/csv` - Exportación CSV

## 🎯 Objetivos del Sistema

1. **Offline First**: Funciona completamente sin internet
2. **Fácil de usar**: Interfaz intuitiva para personal del gimnasio
3. **Completo**: Cubre todas las necesidades básicas de gestión
4. **Portable**: Un solo ejecutable para instalar
5. **Económico**: Sin costos de hosting o suscripciones

## 👥 Datos de Prueba

El sistema incluye datos realistas para testing inmediato:

- 📊 **5 tipos de membresías** con precios desde $15.000 hasta $75.000
- 👥 **20 miembros de ejemplo** con diferentes estados y membresías
- 📦 **20 productos variados** (suplementos, bebidas, accesorios) con stock
- 💰 **Ventas simuladas** con historial de transacciones  
- 📈 **Reportes con datos** mostrando $3.910.350 en ingresos totales
- 🚪 **184 registros de acceso** para analytics de uso del gimnasio

### 📊 Métricas Actuales del Sistema
- **Total miembros**: 20 (18 activos, 2 inactivos)
- **Ingresos totales**: $3.910.350 COP
- **Productos en stock**: 20 productos con inventario automático
- **Accesos registrados**: 184 entradas/salidas
- **Ventas completadas**: 13 transacciones exitosas

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

**🎉 Estado actual**: Backend 100% completo ✅ | Frontend CRUD Miembros 100% funcional ✅

**📈 Rendimiento**: 30+ endpoints REST, 100% tests exitosos, analytics en tiempo real

**🚀 Logros recientes**: FASE 3.1 completada e integrada exitosamente a main branch

¿Encontraste un bug? ¿Tienes una sugerencia? [Abre un issue](https://github.com/davidcaroo/gym-system/issues)

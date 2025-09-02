/**
 * Tipos TypeScript para el frontend - Basados en la estructura del backend
 */

// === TIPOS BASE DEL BACKEND ===

// Tipo de membresía
export interface TipoMembresia {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion_dias: number;
  activo?: boolean;
  created_at?: string;
}

// Miembro
export interface Member {
  id?: number;
  nombre: string;
  email?: string;
  telefono?: string;
  documento?: string;
  fecha_nacimiento?: string;
  fecha_registro?: string;
  tipo_membresia_id?: number;
  estado?: 'activo' | 'inactivo' | 'suspendido';
  foto_url?: string;
  direccion?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  // Campos adicionales de JOIN
  tipo_membresia_nombre?: string;
  precio_membresia?: number;
}

// Alias para compatibilidad
export type Miembro = Member;

// Producto
export interface Product {
  id?: number;
  nombre: string;
  codigo_barras?: string;
  descripcion?: string;
  categoria: 'suplementos' | 'bebidas' | 'accesorios' | 'ropa';
  precio_compra?: number;
  precio_venta: number;
  stock_actual?: number;
  stock_minimo?: number;
  fecha_vencimiento?: string;
  proveedor?: string;
  activo?: boolean;
  created_at?: string;
}

// Venta
export interface Sale {
  id?: number;
  fecha_venta?: string;
  miembro_id?: number;
  subtotal: number;
  descuento?: number;
  total: number;
  metodo_pago?: 'efectivo' | 'tarjeta' | 'cuenta_miembro';
  estado?: 'completada' | 'cancelada';
  notas?: string;
  // Campos adicionales
  detalles?: SaleDetail[];
  nombre_miembro?: string;
}

// Detalle de venta
export interface SaleDetail {
  id?: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  // Campos adicionales
  nombre_producto?: string;
}

// Pago
export interface Payment {
  id?: number;
  miembro_id: number;
  monto: number;
  fecha_pago?: string;
  fecha_vencimiento?: string;
  concepto?: string;
  metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia';
  estado?: 'pagado' | 'pendiente' | 'vencido';
  notas?: string;
  // Campos adicionales de JOIN
  nombre_miembro?: string;
  email_miembro?: string;
  telefono_miembro?: string;
  tipo_membresia?: string;
}

// Acceso
export interface Access {
  id?: number;
  miembro_id: number;
  fecha_entrada: string;
  fecha_salida?: string;
  // Campos adicionales de JOIN
  nombre_miembro?: string;
  email_miembro?: string;
  telefono_miembro?: string;
  documento_miembro?: string;
  tipo_membresia?: string;
  estado_miembro?: string;
  duracion_minutos?: number;
}

// === TIPOS PARA REQUESTS ===

// Request de login
export interface LoginRequest {
  username: string;
  password: string;
}

// Response de login
export interface LoginResponse {
  user: {
    id: number;
    username: string;
    nombre_completo?: string;
    activo?: boolean;
    ultimo_acceso?: string;
  };
  sessionId: string;
}

// Request para crear/actualizar miembro
export interface MemberRequest {
  nombre: string;
  email?: string;
  telefono?: string;
  documento?: string;
  fecha_nacimiento?: string;
<<<<<<< HEAD
  tipo_membresia_id?: number | null;
=======
  tipo_membresia_id?: number;
>>>>>>> origin/main
  estado?: 'activo' | 'inactivo' | 'suspendido';
  foto_url?: string;
  direccion?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
}

// Request para crear/actualizar tipo de membresía
export interface MembershipRequest {
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion_dias: number;
  activo?: boolean;
}

// Request para crear/actualizar producto
export interface ProductRequest {
  nombre: string;
  codigo_barras?: string;
  descripcion?: string;
  categoria: 'suplementos' | 'bebidas' | 'accesorios' | 'ropa';
  precio_compra?: number;
  precio_venta: number;
  stock_actual?: number;
  stock_minimo?: number;
  fecha_vencimiento?: string;
  proveedor?: string;
  activo?: boolean;
}

// Request para crear venta
export interface SaleRequest {
  miembro_id?: number;
  subtotal: number;
  descuento?: number;
  total: number;
  metodo_pago?: 'efectivo' | 'tarjeta' | 'cuenta_miembro';
  notas?: string;
  detalles: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
}

// Request para crear pago
export interface PaymentRequest {
  miembro_id: number;
  monto: number;
  fecha_vencimiento?: string;
  concepto?: string;
  metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia';
  estado?: 'pagado' | 'pendiente' | 'vencido';
  notas?: string;
}

// Request para registrar acceso
export interface AccessRequest {
  miembro_id: number;
}

// === TIPOS PARA REPORTES ===

// Datos del dashboard
export interface DashboardStats {
  fecha_actualizacion: string;
  ingresos_mes_actual: number;
  ingresos_mes_anterior: number;
  crecimiento_ingresos: number;
  miembros_activos: number;
  nuevos_miembros_mes: number;
  tasa_ocupacion_promedio: number;
  total_accesos_mes: number;
  tasa_morosidad: number;
  productos_vendidos_mes: number;
  nps_score?: number;
}

// Datos para gráfico de ingresos (7 días)
export interface IngresosChart {
  fecha: string;
  dia: string;
  ingresos: number;
  membresias: number;
  productos: number;
}

// Actividad reciente
export interface ActividadReciente {
  id: number;
  tipo: 'venta' | 'miembro' | 'pago' | 'acceso';
  descripcion: string;
  monto?: number;
  monto_formateado?: string;
  hora: string;
  fecha: string;
  icono?: string;
  miembro_nombre?: string;
  producto_nombre?: string;
}

// Alertas del sistema
export interface AlertaSistema {
  id: number;
  tipo: 'stock' | 'vencimiento' | 'pago' | 'sistema';
  mensaje: string;
  descripcion?: string;
  prioridad: 'low' | 'medium' | 'high' | 'critical';
  fecha_creacion: string;
  resuelto: boolean;
  accion_requerida?: string;
  url_accion?: string;
}

// Productos con stock bajo
export interface ProductoStockBajo {
  id: number;
  nombre: string;
  categoria: string;
  stock_actual: number;
  stock_minimo: number;
  diferencia: number;
  precio_venta: number;
  fecha_vencimiento?: string;
}

// Reporte de ingresos
export interface ReporteIngresos {
  fecha: string;
  ingresos_membresias: number;
  ingresos_ventas: number;
  total: number;
}

// Estadísticas de acceso
export interface EstadisticasAcceso {
  total_accesos_hoy: number;
  total_accesos_mes: number;
  miembros_actualmente_dentro: number;
  promedio_duracion_hoy: number;
  hora_pico_hoy: string;
  accesos_por_hora: { hora: string; accesos: number }[];
}

// Validación de acceso
export interface ValidacionAcceso {
  permitido: boolean;
  motivo?: string;
  miembro?: Member;
  ultimo_pago?: Payment;
  membresia_vencida?: boolean;
  membresia_activa?: boolean;
}

// === TIPOS PARA FILTROS ===

// Filtros para reportes
export interface ReportFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_reporte?: 'diario' | 'semanal' | 'mensual' | 'anual' | 'personalizado';
  miembro_id?: number;
  tipo_membresia_id?: number;
  categoria_producto?: string;
  incluir_inactivos?: boolean;
}

// === TIPOS GENÉRICOS ===

// Respuesta estándar de la API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Estado de carga
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Paginación
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// === ALIASES PARA COMPATIBILIDAD ===
export type Membership = TipoMembresia;
export type Producto = Product;
export type Venta = Sale;
export type DetalleVenta = SaleDetail;
export type Pago = Payment;
export type Acceso = Access;

// Tipos de reportes específicos (pendientes de implementación en backend)
export interface SalesReport {
  periodo: string;
  total_ventas: number;
  ingresos_totales: number;
  productos_vendidos: number;
  productos_top: Array<{
    producto: string;
    cantidad: number;
    ingresos: number;
  }>;
}

export interface AccessReport {
  periodo: string;
  total_accesos: number;
  miembros_unicos: number;
  promedio_duracion: number;
  distribucion_horaria: Array<{
    hora: string;
    accesos: number;
  }>;
}

export interface InventoryReport {
  productos_totales: number;
  productos_stock_bajo: number;
  valor_inventario: number;
  productos_por_categoria: Array<{
    categoria: string;
    cantidad: number;
    valor: number;
  }>;
}

export interface FinancialReport {
  periodo: string;
  ingresos_totales: number;
  ingresos_membresias: number;
  ingresos_productos: number;
  gastos_totales?: number;
  ganancia_neta?: number;
}

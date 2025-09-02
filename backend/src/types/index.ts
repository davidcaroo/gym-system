// Tipos para las entidades de la base de datos

export interface TipoMembresia {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion_dias: number;
  activo?: boolean;
  created_at?: string;
}

export interface Miembro {
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
}

export interface Pago {
  id?: number;
  miembro_id: number;
  monto: number;
  fecha_pago?: string;
  fecha_vencimiento?: string;
  concepto?: string;
  metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia';
  estado?: 'pagado' | 'pendiente' | 'vencido';
  notas?: string;
  // Campos adicionales para joins
  nombre_miembro?: string;
  email_miembro?: string;
  telefono_miembro?: string;
  tipo_membresia?: string;
}

export interface Producto {
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

export interface Venta {
  id?: number;
  fecha_venta?: string;
  miembro_id?: number;
  subtotal: number;
  descuento?: number;
  total: number;
  metodo_pago?: 'efectivo' | 'tarjeta' | 'cuenta_miembro';
  estado?: 'completada' | 'cancelada';
  notas?: string;
}

export interface DetalleVenta {
  id?: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// Tipos para respuestas de API
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

// Tipos para reportes
export interface DashboardData {
  miembros_activos: number;
  ingresos_hoy: number;
  ingresos_mes: number;
  ventas_hoy: number;
  miembros_actualmente: number;
  productos_stock_bajo: number;
}

export interface ReporteIngresos {
  fecha: string;
  ingresos_membresias: number;
  ingresos_ventas: number;
  total: number;
}

// Tipo para usuario del sistema
export interface Usuario {
  id?: number;
  username: string;
  password_hash: string;
  nombre_completo?: string;
  activo?: boolean;
  ultimo_acceso?: string;
  created_at?: string;
}

// Tipo para datos de login
export interface LoginRequest {
  username: string;
  password: string;
}

// Tipo para respuesta de login
export interface LoginResponse {
  user: Omit<Usuario, 'password_hash'>;
  sessionId: string;
}

// Tipo para cambio de contraseña
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Tipos para el sistema de accesos
export interface Acceso {
  id?: number;
  miembro_id: number;
  fecha_entrada: string;
  fecha_salida?: string;
  // Campos adicionales para joins
  nombre_miembro?: string;
  email_miembro?: string;
  telefono_miembro?: string;
  documento_miembro?: string;
  tipo_membresia?: string;
  estado_miembro?: string;
  duracion_minutos?: number;
}

export interface EstadisticasAcceso {
  total_accesos_hoy: number;
  total_accesos_mes: number;
  miembros_actualmente_dentro: number;
  promedio_duracion_hoy: number;
  hora_pico_hoy: string;
  accesos_por_hora: { hora: string; accesos: number }[];
}

export interface ValidacionAcceso {
  permitido: boolean;
  motivo?: string;
  miembro?: Miembro;
  ultimo_pago?: Pago;
  membresia_vencida?: boolean;
  membresia_activa?: boolean;
}

// Tipos para Reportes Avanzados
export interface ReporteFinanciero {
  periodo: string;
  fecha_inicio: string;
  fecha_fin: string;
  ingresos_totales: number;
  ingresos_membresias: number;
  ingresos_productos: number;
  total_transacciones: number;
  ticket_promedio: number;
  crecimiento_vs_periodo_anterior?: number;
}

export interface AnalyticsMiembros {
  periodo: string;
  total_miembros: number;
  miembros_nuevos: number;
  miembros_activos: number;
  miembros_inactivos: number;
  tasa_retencion: number;
  tasa_churn: number;
  valor_promedio_cliente: number;
  membresias_por_tipo: { tipo: string; cantidad: number; porcentaje: number }[];
}

export interface EstadisticasUso {
  periodo: string;
  total_accesos: number;
  accesos_promedio_dia: number;
  ocupacion_maxima: number;
  ocupacion_promedio: number;
  hora_pico: string;
  duracion_promedio_visita: number;
  dias_mas_concurridos: { dia: string; accesos: number }[];
  distribucion_horaria: { hora: string; accesos: number; porcentaje: number }[];
}

export interface ReportePagos {
  periodo: string;
  total_pagos: number;
  monto_total: number;
  pagos_puntuales: number;
  pagos_tardios: number;
  pagos_vencidos: number;
  tasa_morosidad: number;
  metodos_pago: { metodo: string; cantidad: number; monto: number; porcentaje: number }[];
  tendencia_pagos: { fecha: string; cantidad: number; monto: number }[];
}

export interface AnalyticsVentas {
  periodo: string;
  ventas_totales: number;
  productos_vendidos: number;
  ticket_promedio: number;
  productos_top: { producto: string; cantidad: number; ingresos: number }[];
  categorias_top: { categoria: string; cantidad: number; ingresos: number }[];
  tendencia_ventas: { fecha: string; ventas: number; ingresos: number }[];
}

export interface DashboardKPIs {
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

export interface FiltrosReporte {
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_reporte?: 'diario' | 'semanal' | 'mensual' | 'anual' | 'personalizado';
  miembro_id?: number;
  tipo_membresia_id?: number;
  categoria_producto?: string;
  incluir_inactivos?: boolean;
}

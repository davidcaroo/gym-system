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

export interface Acceso {
  id?: number;
  miembro_id: number;
  fecha_entrada?: string;
  fecha_salida?: string;
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

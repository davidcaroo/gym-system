import Joi from 'joi';

// Validaciones para Miembros
export const miembroSchema = Joi.object({
  nombre: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().optional().allow(''),
  telefono: Joi.string().max(20).optional().allow(''),
  documento: Joi.string().max(50).optional().allow(''),
  fecha_nacimiento: Joi.date().optional(),
  tipo_membresia_id: Joi.number().integer().positive().optional(),
  estado: Joi.string().valid('activo', 'inactivo', 'suspendido').optional(),
  foto_url: Joi.string().uri().optional().allow(''),
  direccion: Joi.string().optional().allow(''),
  contacto_emergencia: Joi.string().max(255).optional().allow(''),
  telefono_emergencia: Joi.string().max(20).optional().allow('')
});

// Validaciones para Tipos de Membresía
export const tipoMembresiaSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  descripcion: Joi.string().optional().allow(''),
  precio: Joi.number().positive().required(),
  duracion_dias: Joi.number().integer().positive().required(),
  activo: Joi.boolean().optional()
});

// Validaciones para Pagos
export const pagoSchema = Joi.object({
  miembro_id: Joi.number().integer().positive().required(),
  monto: Joi.number().positive().required(),
  fecha_vencimiento: Joi.date().optional(),
  concepto: Joi.string().max(255).optional().allow(''),
  metodo_pago: Joi.string().valid('efectivo', 'tarjeta', 'transferencia').optional(),
  estado: Joi.string().valid('pagado', 'pendiente', 'vencido').optional(),
  notas: Joi.string().optional().allow('')
});

// Validaciones para Productos
export const productoSchema = Joi.object({
  nombre: Joi.string().min(2).max(255).required(),
  codigo_barras: Joi.string().max(100).optional().allow(''),
  descripcion: Joi.string().optional().allow(''),
  categoria: Joi.string().valid('suplementos', 'bebidas', 'accesorios', 'ropa').required(),
  precio_compra: Joi.number().positive().optional(),
  precio_venta: Joi.number().positive().required(),
  stock_actual: Joi.number().integer().min(0).optional(),
  stock_minimo: Joi.number().integer().min(0).optional(),
  fecha_vencimiento: Joi.date().optional(),
  proveedor: Joi.string().max(255).optional().allow(''),
  activo: Joi.boolean().optional()
});

// Validaciones para Ventas
export const ventaSchema = Joi.object({
  miembro_id: Joi.number().integer().positive().optional(),
  subtotal: Joi.number().positive().required(),
  descuento: Joi.number().min(0).optional(),
  total: Joi.number().positive().required(),
  metodo_pago: Joi.string().valid('efectivo', 'tarjeta', 'cuenta_miembro').optional(),
  estado: Joi.string().valid('completada', 'cancelada').optional(),
  notas: Joi.string().optional().allow(''),
  detalles: Joi.array().items(
    Joi.object({
      producto_id: Joi.number().integer().positive().required(),
      cantidad: Joi.number().integer().positive().required(),
      precio_unitario: Joi.number().positive().required()
    })
  ).min(1).required()
});

// Validaciones para Accesos
export const accesoSchema = Joi.object({
  miembro_id: Joi.number().integer().positive().required(),
  fecha_salida: Joi.date().optional()
});

// Función helper para validar datos
export const validateData = <T>(schema: Joi.ObjectSchema, data: any): { error?: string; value?: T } => {
  const { error, value } = schema.validate(data, { stripUnknown: true });
  
  if (error) {
    return { error: error.details[0].message };
  }
  
  return { value };
};

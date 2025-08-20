import { Request, Response, NextFunction } from 'express';
import { VentaModel } from '../models/VentaModel';
import { createApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Venta } from '../types';
import Joi from 'joi';

// Esquemas de validación
const ventaSchema = Joi.object({
  miembro_id: Joi.number().optional().allow(null),
  subtotal: Joi.number().required().min(0),
  descuento: Joi.number().optional().min(0).default(0),
  total: Joi.number().required().min(0),
  metodo_pago: Joi.string().valid('efectivo', 'tarjeta', 'cuenta_miembro').default('efectivo'),
  notas: Joi.string().optional().max(500).allow(''),
  items: Joi.array().items(
    Joi.object({
      producto_id: Joi.number().required().min(1),
      cantidad: Joi.number().required().min(1),
      precio_unitario: Joi.number().required().min(0)
    })
  ).min(1).required()
});

const dateRangeSchema = Joi.object({
  fecha_inicio: Joi.date().iso().required(),
  fecha_fin: Joi.date().iso().required()
});

export class VentaController {
  private ventaModel = new VentaModel();

  // Obtener todas las ventas
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const ventas = this.ventaModel.getAll();
      
      // Paginación simple
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedVentas = ventas.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedVentas,
        pagination: {
          current_page: page,
          total_items: ventas.length,
          total_pages: Math.ceil(ventas.length / limit),
          items_per_page: limit
        },
        message: `${paginatedVentas.length} ventas encontradas`
      });
    } catch (error) {
      logger.error('Error al obtener ventas:', error);
      next(createApiError('Error al obtener ventas', 500));
    }
  };

  // Obtener venta por ID
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return next(createApiError('ID de venta inválido', 400, 'INVALID_ID'));
      }

      const venta = this.ventaModel.getById(id);
      
      if (!venta) {
        return next(createApiError('Venta no encontrada', 404, 'SALE_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: venta
      });
    } catch (error) {
      logger.error('Error al obtener venta:', error);
      next(createApiError('Error al obtener venta', 500));
    }
  };

  // Crear nueva venta (procesar venta)
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = ventaSchema.validate(req.body);
      
      if (error) {
        return next(createApiError('Datos de venta inválidos: ' + error.details[0].message, 400, 'INVALID_SALE_DATA'));
      }

      // Validación adicional de negocio
      const validation = this.ventaModel.validateVentaData(value);
      if (!validation.isValid) {
        return next(createApiError('Datos de venta inválidos: ' + validation.errors.join(', '), 400, 'INVALID_SALE_DATA'));
      }

      // Verificar que el total calculado coincida
      const calculatedSubtotal = value.items.reduce((sum: number, item: any) => 
        sum + (item.cantidad * item.precio_unitario), 0
      );
      
      const calculatedTotal = calculatedSubtotal - (value.descuento || 0);
      
      if (Math.abs(calculatedTotal - value.total) > 0.01) {
        return next(createApiError('El total calculado no coincide con el total enviado', 400, 'TOTAL_MISMATCH'));
      }

      const ventaId = this.ventaModel.create(value);
      const nuevaVenta = this.ventaModel.getById(ventaId);

      res.status(201).json({
        success: true,
        data: nuevaVenta,
        message: 'Venta procesada exitosamente'
      });

      logger.info(`Venta procesada: ID ${ventaId}, Total: $${value.total}, Items: ${value.items.length}`);
    } catch (error) {
      logger.error('Error al procesar venta:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Stock insuficiente')) {
          return next(createApiError(error.message, 400, 'INSUFFICIENT_STOCK'));
        }
        if (error.message.includes('no encontrado')) {
          return next(createApiError(error.message, 404, 'PRODUCT_NOT_FOUND'));
        }
      }
      
      next(createApiError('Error al procesar venta', 500));
    }
  };

  // Cancelar venta
  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return next(createApiError('ID de venta inválido', 400, 'INVALID_ID'));
      }

      const cancelled = this.ventaModel.cancel(id);
      
      if (!cancelled) {
        return next(createApiError('No se pudo cancelar la venta', 500, 'CANCEL_FAILED'));
      }

      res.json({
        success: true,
        message: 'Venta cancelada exitosamente'
      });

      logger.info(`Venta cancelada: ID ${id}`);
    } catch (error) {
      logger.error('Error al cancelar venta:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('no encontrada')) {
          return next(createApiError(error.message, 404, 'SALE_NOT_FOUND'));
        }
        if (error.message.includes('ya está cancelada')) {
          return next(createApiError(error.message, 400, 'ALREADY_CANCELLED'));
        }
      }
      
      next(createApiError('Error al cancelar venta', 500));
    }
  };

  // Obtener ventas por fecha
  getByDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fecha = req.params.fecha;
      
      // Validar formato de fecha
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return next(createApiError('Formato de fecha inválido. Use YYYY-MM-DD', 400, 'INVALID_DATE_FORMAT'));
      }

      const ventas = this.ventaModel.getByDate(fecha);

      res.json({
        success: true,
        data: ventas,
        message: `${ventas.length} ventas encontradas para ${fecha}`
      });
    } catch (error) {
      logger.error('Error al obtener ventas por fecha:', error);
      next(createApiError('Error al obtener ventas por fecha', 500));
    }
  };

  // Obtener ventas por rango de fechas
  getByDateRange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = dateRangeSchema.validate(req.query);
      
      if (error) {
        return next(createApiError('Parámetros de fecha inválidos: ' + error.details[0].message, 400, 'INVALID_DATE_PARAMS'));
      }

      const fechaInicio = value.fecha_inicio.toISOString().split('T')[0];
      const fechaFin = value.fecha_fin.toISOString().split('T')[0];

      const ventas = this.ventaModel.getByDateRange(fechaInicio, fechaFin);

      res.json({
        success: true,
        data: ventas,
        message: `${ventas.length} ventas encontradas entre ${fechaInicio} y ${fechaFin}`
      });
    } catch (error) {
      logger.error('Error al obtener ventas por rango de fechas:', error);
      next(createApiError('Error al obtener ventas por rango de fechas', 500));
    }
  };

  // Obtener ventas de un miembro
  getByMiembro = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const miembroId = parseInt(req.params.miembroId);
      
      if (isNaN(miembroId)) {
        return next(createApiError('ID de miembro inválido', 400, 'INVALID_MEMBER_ID'));
      }

      const ventas = this.ventaModel.getByMiembro(miembroId);

      res.json({
        success: true,
        data: ventas,
        message: `${ventas.length} ventas encontradas para el miembro`
      });
    } catch (error) {
      logger.error('Error al obtener ventas del miembro:', error);
      next(createApiError('Error al obtener ventas del miembro', 500));
    }
  };

  // Obtener estadísticas de ventas
  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fecha = req.query.fecha as string;
      
      if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return next(createApiError('Formato de fecha inválido. Use YYYY-MM-DD', 400, 'INVALID_DATE_FORMAT'));
      }

      const stats = this.ventaModel.getStats(fecha);

      res.json({
        success: true,
        data: stats,
        message: fecha ? `Estadísticas de ventas para ${fecha}` : 'Estadísticas generales de ventas'
      });
    } catch (error) {
      logger.error('Error al obtener estadísticas de ventas:', error);
      next(createApiError('Error al obtener estadísticas de ventas', 500));
    }
  };

  // Reporte diario
  getReporteDiario = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fecha = req.params.fecha;
      
      if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return next(createApiError('Formato de fecha inválido. Use YYYY-MM-DD', 400, 'INVALID_DATE_FORMAT'));
      }

      const reporte = this.ventaModel.getReporteDiario(fecha);

      res.json({
        success: true,
        data: reporte,
        message: `Reporte diario generado para ${reporte.fecha}`
      });
    } catch (error) {
      logger.error('Error al generar reporte diario:', error);
      next(createApiError('Error al generar reporte diario', 500));
    }
  };

  // Buscar ventas
  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.params.query;
      
      if (!query || query.trim().length < 2) {
        return next(createApiError('La búsqueda debe tener al menos 2 caracteres', 400, 'INVALID_SEARCH_QUERY'));
      }

      const ventas = this.ventaModel.search(query.trim());

      res.json({
        success: true,
        data: ventas,
        message: `${ventas.length} ventas encontradas para "${query}"`
      });
    } catch (error) {
      logger.error('Error al buscar ventas:', error);
      next(createApiError('Error al buscar ventas', 500));
    }
  };

  // Obtener resumen rápido para dashboard
  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const statsHoy = this.ventaModel.getStats(hoy);
      const statsGeneral = this.ventaModel.getStats();

      res.json({
        success: true,
        data: {
          hoy: {
            ventas: statsHoy.total_ventas,
            ingresos: statsHoy.total_ingresos,
            productos_vendidos: statsHoy.productos_vendidos,
            venta_promedio: statsHoy.venta_promedio
          },
          general: {
            ventas_totales: statsGeneral.total_ventas,
            ingresos_totales: statsGeneral.total_ingresos,
            venta_promedio_general: statsGeneral.venta_promedio
          },
          productos_populares: statsHoy.productos_mas_vendidos.slice(0, 5),
          metodos_pago_hoy: statsHoy.ventas_por_metodo
        },
        message: 'Dashboard de ventas generado'
      });
    } catch (error) {
      logger.error('Error al generar dashboard de ventas:', error);
      next(createApiError('Error al generar dashboard de ventas', 500));
    }
  };
}

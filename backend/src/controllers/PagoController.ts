import { Request, Response } from 'express';
import { PagoModel } from '../models/PagoModel';
import { ApiResponse, Pago } from '../types';
import { logger } from '../utils/logger';
import Joi from 'joi';

export class PagoController {
  private pagoModel = new PagoModel();

  // Esquemas de validación
  private pagoSchema = Joi.object({
    miembro_id: Joi.number().integer().positive().required(),
    monto: Joi.number().positive().required(),
    fecha_vencimiento: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
    concepto: Joi.string().max(255).optional(),
    metodo_pago: Joi.string().valid('efectivo', 'tarjeta', 'transferencia').optional(),
    estado: Joi.string().valid('pagado', 'pendiente', 'vencido').optional(),
    notas: Joi.string().optional()
  });

  private filtrosSchema = Joi.object({
    miembro_id: Joi.number().integer().positive().optional(),
    estado: Joi.string().valid('pagado', 'pendiente', 'vencido').optional(),
    metodo_pago: Joi.string().valid('efectivo', 'tarjeta', 'transferencia').optional(),
    fecha_desde: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
    fecha_hasta: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
    limite: Joi.number().integer().min(1).max(100).optional(),
    offset: Joi.number().integer().min(0).optional()
  });

  // Crear nuevo pago
  public createPago = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📥 Datos recibidos para crear pago:', req.body);
      
      const { error, value } = this.pagoSchema.validate(req.body);
      
      if (error) {
        console.log('❌ Error de validación:', error.details[0].message);
        const response: ApiResponse = {
          success: false,
          message: 'Datos de pago inválidos',
          error: {
            code: 'VALIDATION_ERROR',
            message: error.details[0].message
          }
        };
        res.status(400).json(response);
        return;
      }

      console.log('✅ Datos validados correctamente:', value);
      const nuevoPago = await this.pagoModel.createPago(value);
      
      const response: ApiResponse<Pago> = {
        success: true,
        data: nuevoPago,
        message: 'Pago creado exitosamente'
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('💥 Error detallado en createPago:', error);
      logger.error('Error en createPago:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
      res.status(500).json(response);
    }
  };

  // Obtener pago por ID
  public getPago = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          message: 'ID de pago inválido'
        };
        res.status(400).json(response);
        return;
      }

      const pago = await this.pagoModel.getPagoById(id);
      
      if (!pago) {
        const response: ApiResponse = {
          success: false,
          message: 'Pago no encontrado'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Pago> = {
        success: true,
        data: pago
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error en getPago:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
      res.status(500).json(response);
    }
  };

  // Obtener todos los pagos con filtros
  public getAllPagos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = this.filtrosSchema.validate(req.query);
      
      if (error) {
        const response: ApiResponse = {
          success: false,
          message: 'Filtros inválidos',
          error: {
            code: 'VALIDATION_ERROR',
            message: error.details[0].message
          }
        };
        res.status(400).json(response);
        return;
      }

      const resultado = await this.pagoModel.getAllPagos(value);
      
      const response: ApiResponse<{pagos: Pago[], total: number, pagina?: number, limite?: number}> = {
        success: true,
        data: {
          ...resultado,
          pagina: value.offset && value.limite ? Math.floor(value.offset / value.limite) + 1 : undefined,
          limite: value.limite
        }
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error en getAllPagos:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
      res.status(500).json(response);
    }
  };

  // Actualizar estado de pago
  public updateEstadoPago = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { estado, notas } = req.body;
      
      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          message: 'ID de pago inválido'
        };
        res.status(400).json(response);
        return;
      }

      const estadoSchema = Joi.object({
        estado: Joi.string().valid('pagado', 'pendiente', 'vencido').required(),
        notas: Joi.string().optional()
      });

      const { error } = estadoSchema.validate({ estado, notas });
      
      if (error) {
        const response: ApiResponse = {
          success: false,
          message: 'Datos inválidos',
          error: {
            code: 'VALIDATION_ERROR',
            message: error.details[0].message
          }
        };
        res.status(400).json(response);
        return;
      }

      const actualizado = await this.pagoModel.updateEstadoPago(id, estado, notas);
      
      if (!actualizado) {
        const response: ApiResponse = {
          success: false,
          message: 'Pago no encontrado'
        };
        res.status(404).json(response);
        return;
      }

      const pagoActualizado = await this.pagoModel.getPagoById(id);
      
      const response: ApiResponse<Pago> = {
        success: true,
        data: pagoActualizado!,
        message: 'Estado de pago actualizado exitosamente'
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error en updateEstadoPago:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
      res.status(500).json(response);
    }
  };

  // Renovar membresía
  public renovarMembresia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { miembro_id, tipo_membresia_id } = req.body;
      
      const renovacionSchema = Joi.object({
        miembro_id: Joi.number().integer().positive().required(),
        tipo_membresia_id: Joi.number().integer().positive().required()
      });

      const { error } = renovacionSchema.validate({ miembro_id, tipo_membresia_id });
      
      if (error) {
        const response: ApiResponse = {
          success: false,
          message: 'Datos de renovación inválidos',
          error: {
            code: 'VALIDATION_ERROR',
            message: error.details[0].message
          }
        };
        res.status(400).json(response);
        return;
      }

      const nuevoPago = await this.pagoModel.renovarMembresia(miembro_id, tipo_membresia_id);
      
      const response: ApiResponse<Pago> = {
        success: true,
        data: nuevoPago,
        message: 'Membresía renovada exitosamente'
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('Error en renovarMembresia:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
      res.status(500).json(response);
    }
  };

  // Obtener pagos próximos a vencer
  public getPagosProximosVencer = async (req: Request, res: Response): Promise<void> => {
    try {
      const dias = parseInt(req.query.dias as string) || 7;
      
      if (dias < 1 || dias > 365) {
        const response: ApiResponse = {
          success: false,
          message: 'El número de días debe estar entre 1 y 365'
        };
        res.status(400).json(response);
        return;
      }

      const pagos = await this.pagoModel.getPagosProximosVencer(dias);
      
      const response: ApiResponse<{pagos: Pago[], dias_limite: number}> = {
        success: true,
        data: {
          pagos,
          dias_limite: dias
        }
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error en getPagosProximosVencer:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
      res.status(500).json(response);
    }
  };

  // Obtener estadísticas de pagos
  public getEstadisticasPagos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      const estadisticas = await this.pagoModel.getEstadisticasPagos(
        fecha_desde as string,
        fecha_hasta as string
      );
      
      const response: ApiResponse = {
        success: true,
        data: estadisticas
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error en getEstadisticasPagos:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
      res.status(500).json(response);
    }
  };

  // Marcar pagos vencidos
  public marcarPagosVencidos = async (req: Request, res: Response): Promise<void> => {
    try {
      const pagosAfectados = await this.pagoModel.marcarPagosVencidos();
      
      const response: ApiResponse<{pagos_marcados: number}> = {
        success: true,
        data: {
          pagos_marcados: pagosAfectados
        },
        message: `${pagosAfectados} pagos marcados como vencidos`
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error en marcarPagosVencidos:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
      res.status(500).json(response);
    }
  };

  // Obtener historial de pagos de un miembro
  public getHistorialPagosMiembro = async (req: Request, res: Response): Promise<void> => {
    try {
      const miembro_id = parseInt(req.params.miembro_id);
      
      if (isNaN(miembro_id)) {
        const response: ApiResponse = {
          success: false,
          message: 'ID de miembro inválido'
        };
        res.status(400).json(response);
        return;
      }

      const historial = await this.pagoModel.getHistorialPagosMiembro(miembro_id);
      
      const response: ApiResponse<{historial: Pago[], miembro_id: number}> = {
        success: true,
        data: {
          historial,
          miembro_id
        }
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error en getHistorialPagosMiembro:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
      res.status(500).json(response);
    }
  };
}

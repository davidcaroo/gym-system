import { Request, Response } from 'express';
import { AccesoModel } from '../models/AccesoModel';
import { logger } from '../utils/logger';
import Joi from 'joi';

export class AccesoController {
  private accesoModel: AccesoModel;

  constructor() {
    this.accesoModel = new AccesoModel();
  }

  // Validar acceso por documento
  validarAcceso = async (req: Request, res: Response): Promise<void> => {
    try {
      const { documento } = req.params;

      if (!documento) {
        res.status(400).json({
          success: false,
          message: 'Documento es requerido'
        });
        return;
      }

      const validacion = await this.accesoModel.validarAcceso(documento);

      res.json({
        success: true,
        data: validacion
      });
    } catch (error) {
      logger.error('Error en validarAcceso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Registrar entrada
  registrarEntrada = async (req: Request, res: Response): Promise<void> => {
    try {
      const schema = Joi.object({
        documento: Joi.string().required().messages({
          'string.empty': 'Documento es requerido',
          'any.required': 'Documento es requerido'
        })
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      const { documento } = value;

      // Primero validar acceso
      const validacion = await this.accesoModel.validarAcceso(documento);

      if (!validacion.permitido) {
        res.status(403).json({
          success: false,
          message: validacion.motivo,
          data: validacion
        });
        return;
      }

      // Registrar entrada
      const acceso = await this.accesoModel.registrarEntrada(validacion.miembro!.id!);

      res.status(201).json({
        success: true,
        data: {
          acceso,
          miembro: validacion.miembro,
          validacion
        },
        message: `Entrada registrada para ${validacion.miembro!.nombre}`
      });
    } catch (error) {
      logger.error('Error en registrarEntrada:', error);
      
      if (error instanceof Error && error.message.includes('ya se encuentra dentro')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Registrar salida
  registrarSalida = async (req: Request, res: Response): Promise<void> => {
    try {
      const schema = Joi.object({
        documento: Joi.string().required().messages({
          'string.empty': 'Documento es requerido',
          'any.required': 'Documento es requerido'
        })
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      const { documento } = value;

      // Buscar miembro por documento
      const validacion = await this.accesoModel.validarAcceso(documento);

      if (!validacion.miembro) {
        res.status(404).json({
          success: false,
          message: 'Miembro no encontrado'
        });
        return;
      }

      // Registrar salida
      const acceso = await this.accesoModel.registrarSalida(validacion.miembro.id!);

      res.json({
        success: true,
        data: {
          acceso,
          miembro: validacion.miembro
        },
        message: `Salida registrada para ${validacion.miembro.nombre}`
      });
    } catch (error) {
      logger.error('Error en registrarSalida:', error);
      
      if (error instanceof Error && error.message.includes('No se encontró registro de entrada')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener miembros actualmente dentro
  getMiembrosActualmenteDentro = async (req: Request, res: Response): Promise<void> => {
    try {
      const miembros = await this.accesoModel.getMiembrosActualmenteDentro();

      res.json({
        success: true,
        data: miembros,
        total: miembros.length,
        message: `${miembros.length} miembros actualmente en el gimnasio`
      });
    } catch (error) {
      logger.error('Error en getMiembrosActualmenteDentro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener historial de accesos
  getHistorialAccesos = async (req: Request, res: Response): Promise<void> => {
    try {
      const schema = Joi.object({
        miembro_id: Joi.number().integer().positive().optional(),
        fecha_inicio: Joi.date().iso().optional(),
        fecha_fin: Joi.date().iso().optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50)
      });

      const { error, value } = schema.validate(req.query);

      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      const { miembro_id, fecha_inicio, fecha_fin, page, limit } = value;

      // Convertir fechas a string si es necesario
      let fechaInicioStr: string | undefined;
      let fechaFinStr: string | undefined;

      if (fecha_inicio) {
        fechaInicioStr = fecha_inicio instanceof Date ? fecha_inicio.toISOString().split('T')[0] : fecha_inicio;
      }

      if (fecha_fin) {
        fechaFinStr = fecha_fin instanceof Date ? fecha_fin.toISOString().split('T')[0] : fecha_fin;
      }

      const resultado = await this.accesoModel.getHistorialAccesos(
        miembro_id,
        fechaInicioStr,
        fechaFinStr,
        page,
        limit
      );

      res.json({
        success: true,
        data: resultado.accesos,
        pagination: {
          page,
          limit,
          total: resultado.total,
          pages: Math.ceil(resultado.total / limit)
        },
        message: `${resultado.accesos.length} accesos encontrados`
      });
    } catch (error) {
      logger.error('Error en getHistorialAccesos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener estadísticas de accesos
  getEstadisticasAccesos = async (req: Request, res: Response): Promise<void> => {
    try {
      const estadisticas = await this.accesoModel.getEstadisticasAccesos();

      res.json({
        success: true,
        data: estadisticas,
        message: 'Estadísticas de accesos obtenidas exitosamente'
      });
    } catch (error) {
      logger.error('Error en getEstadisticasAccesos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Forzar salida de todos los miembros
  forzarSalidaTodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const afectados = await this.accesoModel.forzarSalidaTodos();

      res.json({
        success: true,
        data: { miembros_afectados: afectados },
        message: `Salida forzada registrada para ${afectados} miembros`
      });
    } catch (error) {
      logger.error('Error en forzarSalidaTodos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Obtener acceso por ID de miembro (para verificar estado)
  getAccesoActivoPorMiembro = async (req: Request, res: Response): Promise<void> => {
    try {
      const { miembroId } = req.params;

      if (!miembroId || isNaN(Number(miembroId))) {
        res.status(400).json({
          success: false,
          message: 'ID de miembro inválido'
        });
        return;
      }

      const miembros = await this.accesoModel.getMiembrosActualmenteDentro();
      const accesoActivo = miembros.find(m => m.miembro_id === Number(miembroId));

      if (accesoActivo) {
        res.json({
          success: true,
          data: accesoActivo,
          message: 'Miembro actualmente dentro del gimnasio'
        });
      } else {
        res.json({
          success: true,
          data: null,
          message: 'Miembro no se encuentra dentro del gimnasio'
        });
      }
    } catch (error) {
      logger.error('Error en getAccesoActivoPorMiembro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}

import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../database/connection';
import { createApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface TipoMembresia {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_dias: number;
  activo: boolean;
  created_at: string;
}

export class MembresiaController {
  private db = getDatabase();

  // Obtener todas las membresías
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stmt = this.db.prepare(`
        SELECT id, nombre, descripcion, precio, duracion_dias, activo, created_at
        FROM tipos_membresia 
        WHERE activo = 1
        ORDER BY precio ASC
      `);
      
      const membresias = stmt.all() as TipoMembresia[];
      
      res.json({
        success: true,
        data: membresias,
        message: `${membresias.length} tipos de membresía encontrados`
      });
    } catch (error) {
      logger.error('Error al obtener membresías:', error);
      next(createApiError('Error al obtener membresías', 500));
    }
  };

  // Obtener membresía por ID
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return next(createApiError('ID de membresía inválido', 400));
      }

      const stmt = this.db.prepare(`
        SELECT id, nombre, descripcion, precio, duracion_dias, activo, created_at
        FROM tipos_membresia 
        WHERE id = ? AND activo = 1
      `);
      
      const membresia = stmt.get(id) as TipoMembresia | undefined;

      if (!membresia) {
        return next(createApiError('Membresía no encontrada', 404));
      }

      res.json({
        success: true,
        data: membresia,
        message: 'Membresía encontrada'
      });
    } catch (error) {
      logger.error('Error al obtener membresía:', error);
      next(createApiError('Error al obtener membresía', 500));
    }
  };
}

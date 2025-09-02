import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../database/connection';
import { createApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { tipoMembresiaSchema } from '../utils/validation';

export interface TipoMembresia {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_dias: number;
  created_at: string;
}

export class MembresiaController {
  private db = getDatabase();

  // Obtener todas las membresías
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stmt = this.db.prepare(`
        SELECT id, nombre, descripcion, precio, duracion_dias, created_at
        FROM tipos_membresia 
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
        SELECT id, nombre, descripcion, precio, duracion_dias, created_at
        FROM tipos_membresia 
        WHERE id = ?
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

  // Crear nueva membresía
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar datos con Joi
      const { error, value } = tipoMembresiaSchema.validate(req.body);
      if (error) {
        return next(createApiError(`Datos inválidos: ${error.details[0].message}`, 400));
      }

      const { nombre, descripcion, precio, duracion_dias } = value;

      // Verificar si ya existe una membresía con el mismo nombre
      const existingStmt = this.db.prepare(`
        SELECT id FROM tipos_membresia 
        WHERE LOWER(nombre) = LOWER(?)
      `);
      
      const existing = existingStmt.get(nombre);
      if (existing) {
        return next(createApiError('Ya existe una membresía con ese nombre', 409));
      }

      const stmt = this.db.prepare(`
        INSERT INTO tipos_membresia (nombre, descripcion, precio, duracion_dias, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      
      const result = stmt.run(nombre, descripcion || '', precio, duracion_dias);
      
      // Obtener la membresía recién creada
      const newMembership = this.db.prepare(`
        SELECT id, nombre, descripcion, precio, duracion_dias, created_at
        FROM tipos_membresia 
        WHERE id = ?
      `).get(result.lastInsertRowid) as TipoMembresia;

      res.status(201).json({
        success: true,
        data: newMembership,
        message: 'Membresía creada exitosamente'
      });

      logger.info(`Membresía creada: ${nombre} - ID: ${result.lastInsertRowid}`);
    } catch (error) {
      logger.error('Error al crear membresía:', error);
      next(createApiError('Error al crear membresía', 500));
    }
  };

  // Actualizar membresía
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return next(createApiError('ID de membresía inválido', 400));
      }

      // Validar datos parciales con Joi (permitir campos opcionales)
      const partialSchema = tipoMembresiaSchema.fork(['nombre', 'precio', 'duracion_dias'], (schema) => schema.optional());
      const { error, value } = partialSchema.validate(req.body);
      if (error) {
        return next(createApiError(`Datos inválidos: ${error.details[0].message}`, 400));
      }

      const { nombre, descripcion, precio, duracion_dias } = value;

      // Verificar si la membresía existe
      const existingStmt = this.db.prepare(`
        SELECT id FROM tipos_membresia 
        WHERE id = ?
      `);
      
      const existing = existingStmt.get(id);
      if (!existing) {
        return next(createApiError('Membresía no encontrada', 404));
      }

        // Verificar nombre duplicado (solo si se está cambiando)
        if (nombre) {
          const duplicateStmt = this.db.prepare(`
            SELECT id FROM tipos_membresia 
            WHERE LOWER(nombre) = LOWER(?) AND id != ?
          `);        const duplicate = duplicateStmt.get(nombre, id);
        if (duplicate) {
          return next(createApiError('Ya existe una membresía con ese nombre', 409));
        }
      }

      // Construir query dinámico solo con campos proporcionados
      const updates: string[] = [];
      const values: any[] = [];

      if (nombre !== undefined) {
        updates.push('nombre = ?');
        values.push(nombre);
      }
      if (descripcion !== undefined) {
        updates.push('descripcion = ?');
        values.push(descripcion);
      }
      if (precio !== undefined) {
        updates.push('precio = ?');
        values.push(precio);
      }
      if (duracion_dias !== undefined) {
        updates.push('duracion_dias = ?');
        values.push(duracion_dias);
      }

      if (updates.length === 0) {
        return next(createApiError('No se proporcionaron campos para actualizar', 400));
      }

      values.push(id); // Para el WHERE

      const stmt = this.db.prepare(`
        UPDATE tipos_membresia 
        SET ${updates.join(', ')}
        WHERE id = ?
      `);
      
      stmt.run(...values);

      // Obtener la membresía actualizada
      const updatedMembership = this.db.prepare(`
        SELECT id, nombre, descripcion, precio, duracion_dias, created_at
        FROM tipos_membresia 
        WHERE id = ?
      `).get(id) as TipoMembresia;

      res.json({
        success: true,
        data: updatedMembership,
        message: 'Membresía actualizada exitosamente'
      });

      logger.info(`Membresía actualizada: ID ${id}`);
    } catch (error) {
      logger.error('Error al actualizar membresía:', error);
      next(createApiError('Error al actualizar membresía', 500));
    }
  };

  // Eliminar membresía (soft delete)
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return next(createApiError('ID de membresía inválido', 400));
      }

      // Verificar si la membresía existe
      const existingStmt = this.db.prepare(`
        SELECT id, nombre FROM tipos_membresia 
        WHERE id = ?
      `);
      
      const existing = existingStmt.get(id) as { id: number, nombre: string } | undefined;
      if (!existing) {
        return next(createApiError('Membresía no encontrada', 404));
      }

      // Verificar si hay miembros usando esta membresía
      const membersUsingStmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM miembros 
        WHERE tipo_membresia_id = ? AND estado = 'activo'
      `);
      
      const membersUsing = membersUsingStmt.get(id) as { count: number };
      if (membersUsing.count > 0) {
        return next(createApiError(
          `No se puede eliminar la membresía. Hay ${membersUsing.count} miembro(s) activos con esta membresía`,
          409
        ));
      }

      // Hard delete - eliminar completamente
      const stmt = this.db.prepare(`
        DELETE FROM tipos_membresia 
        WHERE id = ?
      `);
      
      stmt.run(id);

      res.json({
        success: true,
        data: { id, nombre: existing.nombre },
        message: 'Membresía eliminada exitosamente'
      });

      logger.info(`Membresía eliminada: ${existing.nombre} - ID: ${id}`);
    } catch (error) {
      logger.error('Error al eliminar membresía:', error);
      next(createApiError('Error al eliminar membresía', 500));
    }
  };
}

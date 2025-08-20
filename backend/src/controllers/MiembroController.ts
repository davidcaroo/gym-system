import { Request, Response, NextFunction } from 'express';
import { MiembroModel } from '../models/MiembroModel';
import { miembroSchema, validateData } from '../utils/validation';
import { createApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Miembro } from '../types';

export class MiembroController {
  private miembroModel = new MiembroModel();

  // Obtener todos los miembros
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const miembros = this.miembroModel.getAll();
      res.json({
        success: true,
        data: miembros,
        message: `${miembros.length} miembros encontrados`
      });
    } catch (error) {
      logger.error('Error al obtener miembros:', error);
      next(createApiError('Error al obtener miembros', 500));
    }
  };

  // Obtener miembro por ID
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return next(createApiError('ID de miembro inválido', 400, 'INVALID_ID'));
      }

      const miembro = this.miembroModel.getById(id);
      
      if (!miembro) {
        return next(createApiError('Miembro no encontrado', 404, 'MEMBER_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: miembro
      });
    } catch (error) {
      logger.error('Error al obtener miembro:', error);
      next(createApiError('Error al obtener miembro', 500));
    }
  };

  // Buscar miembros
  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.params.query;
      
      if (!query || query.length < 2) {
        return next(createApiError('El término de búsqueda debe tener al menos 2 caracteres', 400, 'INVALID_SEARCH'));
      }

      const miembros = this.miembroModel.search(query);
      res.json({
        success: true,
        data: miembros,
        message: `${miembros.length} miembros encontrados para "${query}"`
      });
    } catch (error) {
      logger.error('Error al buscar miembros:', error);
      next(createApiError('Error al buscar miembros', 500));
    }
  };

  // Crear nuevo miembro
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateData<Miembro>(miembroSchema, req.body);
      
      if (error) {
        return next(createApiError(error, 400, 'VALIDATION_ERROR'));
      }

      const miembroData = value!;

      // Verificar documento único
      if (miembroData.documento && this.miembroModel.existsDocument(miembroData.documento)) {
        return next(createApiError('Ya existe un miembro con este documento', 409, 'DOCUMENT_EXISTS'));
      }

      // Verificar email único
      if (miembroData.email && this.miembroModel.existsEmail(miembroData.email)) {
        return next(createApiError('Ya existe un miembro con este email', 409, 'EMAIL_EXISTS'));
      }

      const nuevoMiembro = this.miembroModel.create(miembroData);
      
      logger.info(`Miembro creado: ${nuevoMiembro.nombre} (ID: ${nuevoMiembro.id})`);
      
      res.status(201).json({
        success: true,
        data: nuevoMiembro,
        message: 'Miembro creado exitosamente'
      });
    } catch (error) {
      logger.error('Error al crear miembro:', error);
      next(createApiError('Error al crear miembro', 500));
    }
  };

  // Actualizar miembro
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return next(createApiError('ID de miembro inválido', 400, 'INVALID_ID'));
      }

      const { error, value } = validateData<Partial<Miembro>>(miembroSchema, req.body);
      
      if (error) {
        return next(createApiError(error, 400, 'VALIDATION_ERROR'));
      }

      const miembroData = value!;

      // Verificar si el miembro existe
      const miembroExistente = this.miembroModel.getById(id);
      if (!miembroExistente) {
        return next(createApiError('Miembro no encontrado', 404, 'MEMBER_NOT_FOUND'));
      }

      // Verificar documento único (excluyendo el miembro actual)
      if (miembroData.documento && this.miembroModel.existsDocument(miembroData.documento, id)) {
        return next(createApiError('Ya existe otro miembro con este documento', 409, 'DOCUMENT_EXISTS'));
      }

      // Verificar email único (excluyendo el miembro actual)
      if (miembroData.email && this.miembroModel.existsEmail(miembroData.email, id)) {
        return next(createApiError('Ya existe otro miembro con este email', 409, 'EMAIL_EXISTS'));
      }

      const miembroActualizado = this.miembroModel.update(id, miembroData);
      
      logger.info(`Miembro actualizado: ${miembroActualizado?.nombre} (ID: ${id})`);
      
      res.json({
        success: true,
        data: miembroActualizado,
        message: 'Miembro actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error al actualizar miembro:', error);
      next(createApiError('Error al actualizar miembro', 500));
    }
  };

  // Eliminar miembro (soft delete)
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return next(createApiError('ID de miembro inválido', 400, 'INVALID_ID'));
      }

      const miembro = this.miembroModel.getById(id);
      if (!miembro) {
        return next(createApiError('Miembro no encontrado', 404, 'MEMBER_NOT_FOUND'));
      }

      const eliminado = this.miembroModel.delete(id);
      
      if (!eliminado) {
        return next(createApiError('No se pudo eliminar el miembro', 500));
      }

      logger.info(`Miembro eliminado: ${miembro.nombre} (ID: ${id})`);
      
      res.json({
        success: true,
        message: 'Miembro eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error al eliminar miembro:', error);
      next(createApiError('Error al eliminar miembro', 500));
    }
  };

  // Obtener miembros activos
  getActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const miembros = this.miembroModel.getActive();
      res.json({
        success: true,
        data: miembros,
        message: `${miembros.length} miembros activos encontrados`
      });
    } catch (error) {
      logger.error('Error al obtener miembros activos:', error);
      next(createApiError('Error al obtener miembros activos', 500));
    }
  };

  // Obtener estadísticas de miembros
  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = this.miembroModel.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error al obtener estadísticas de miembros:', error);
      next(createApiError('Error al obtener estadísticas', 500));
    }
  };
}

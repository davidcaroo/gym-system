import { Request, Response, NextFunction } from 'express';
import { createApiError } from './errorHandler';
import { logger } from '../utils/logger';

// Extender tipos de sesión
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    sessionId?: string;
  }
}

// Middleware para proteger rutas que requieren autenticación
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar si hay sesión activa
    if (!req.session || !req.session.userId) {
      logger.warn(`Intento de acceso no autorizado a ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return next(createApiError('Acceso no autorizado. Inicie sesión.', 401, 'UNAUTHORIZED'));
    }

    // Verificar que la sesión sea válida
    if (!req.session.username || !req.session.sessionId) {
      logger.warn(`Sesión inválida detectada para usuario ${req.session.userId}`, {
        ip: req.ip,
        path: req.path
      });
      
      return next(createApiError('Sesión inválida. Inicie sesión nuevamente.', 401, 'INVALID_SESSION'));
    }

    // La sesión es válida, continuar
    next();
  } catch (error) {
    logger.error('Error en middleware de autenticación:', error);
    next(createApiError('Error interno de autenticación', 500));
  }
};

// Middleware opcional - no falla si no hay autenticación
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // Simplemente pasa al siguiente middleware, la autenticación es opcional
  next();
};

import { Request, Response, NextFunction } from 'express';
import { AuthModel } from '../models/AuthModel';
import { createApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { LoginRequest, ChangePasswordRequest } from '../types';
import Joi from 'joi';

// Extender tipos de sesión
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    sessionId?: string;
  }
}

// Esquemas de validación
const loginSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(6).max(100)
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(6).max(100)
});

export class AuthController {
  private authModel = new AuthModel();

  // Login
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar datos de entrada
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return next(createApiError('Datos de login inválidos', 400, 'INVALID_LOGIN_DATA'));
      }

      const { username, password }: LoginRequest = value;

      // Buscar usuario
      const user = this.authModel.findByUsername(username);
      if (!user) {
        return next(createApiError('Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS'));
      }

      // Verificar contraseña
      const isValidPassword = this.authModel.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return next(createApiError('Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS'));
      }

      // Generar ID de sesión
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Actualizar último acceso
      this.authModel.updateLastAccess(user.id!);

      // Guardar sesión
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.sessionId = sessionId;

      // Respuesta exitosa (sin password)
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          sessionId
        },
        message: 'Login exitoso'
      });

      logger.info(`Usuario ${username} inició sesión correctamente`);
    } catch (error) {
      logger.error('Error en login:', error);
      next(createApiError('Error interno en autenticación', 500));
    }
  };

  // Logout
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const username = req.session.username;
      
      req.session.destroy((err) => {
        if (err) {
          logger.error('Error al cerrar sesión:', err);
          return next(createApiError('Error al cerrar sesión', 500));
        }

        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: 'Sesión cerrada correctamente'
        });

        logger.info(`Usuario ${username} cerró sesión`);
      });
    } catch (error) {
      logger.error('Error en logout:', error);
      next(createApiError('Error interno al cerrar sesión', 500));
    }
  };

  // Verificar sesión
  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.userId) {
        return next(createApiError('No hay sesión activa', 401, 'NO_SESSION'));
      }

      const user = this.authModel.getUserById(req.session.userId);
      if (!user) {
        return next(createApiError('Usuario no encontrado', 401, 'USER_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: {
          user,
          sessionId: req.session.sessionId
        }
      });
    } catch (error) {
      logger.error('Error en verificación de sesión:', error);
      next(createApiError('Error interno en verificación', 500));
    }
  };

  // Cambiar contraseña
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.userId) {
        return next(createApiError('No hay sesión activa', 401, 'NO_SESSION'));
      }

      // Validar datos
      const { error, value } = changePasswordSchema.validate(req.body);
      if (error) {
        return next(createApiError('Datos inválidos para cambio de contraseña', 400, 'INVALID_PASSWORD_DATA'));
      }

      const { currentPassword, newPassword }: ChangePasswordRequest = value;

      // Obtener usuario actual
      const user = this.authModel.findByUsername(req.session.username!);
      if (!user) {
        return next(createApiError('Usuario no encontrado', 401, 'USER_NOT_FOUND'));
      }

      // Verificar contraseña actual
      const isValidCurrentPassword = this.authModel.verifyPassword(currentPassword, user.password_hash);
      if (!isValidCurrentPassword) {
        return next(createApiError('Contraseña actual incorrecta', 401, 'INVALID_CURRENT_PASSWORD'));
      }

      // Cambiar contraseña
      const passwordChanged = this.authModel.changePassword(user.id!, newPassword);
      if (!passwordChanged) {
        return next(createApiError('Error al cambiar contraseña', 500, 'PASSWORD_CHANGE_FAILED'));
      }

      res.json({
        success: true,
        message: 'Contraseña cambiada correctamente'
      });

      logger.info(`Usuario ${user.username} cambió su contraseña`);
    } catch (error) {
      logger.error('Error al cambiar contraseña:', error);
      next(createApiError('Error interno al cambiar contraseña', 500));
    }
  };
}

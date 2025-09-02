/**
 * Clase para manejo centralizado de errores de la aplicación
 */

import { ApiError } from './types';
import { ERROR_MESSAGES, HTTP_STATUS } from './constants';

export class AppError extends Error {
  public code: string;
  public status?: number;
  public details?: any;

  constructor(message: string, code: string, status?: number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Procesa errores de respuesta de la API
 */
export function handleApiError(error: any): AppError {
  // Error de red (sin conexión)
  if (!error.response) {
    return new AppError(
      ERROR_MESSAGES.NETWORK_ERROR,
      'NETWORK_ERROR',
      0,
      error
    );
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // Si el backend devuelve un error estructurado
  if (data?.error) {
    return new AppError(
      data.error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      data.error.code || 'API_ERROR',
      status,
      data.error.details
    );
  }

  // Errores HTTP estándar
  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return new AppError(
        ERROR_MESSAGES.UNAUTHORIZED,
        'UNAUTHORIZED',
        status
      );

    case HTTP_STATUS.FORBIDDEN:
      return new AppError(
        'No tienes permisos para realizar esta acción.',
        'FORBIDDEN',
        status
      );

    case HTTP_STATUS.NOT_FOUND:
      return new AppError(
        ERROR_MESSAGES.NOT_FOUND,
        'NOT_FOUND',
        status
      );

    case HTTP_STATUS.BAD_REQUEST:
      return new AppError(
        data?.message || ERROR_MESSAGES.VALIDATION_ERROR,
        'VALIDATION_ERROR',
        status,
        data
      );

    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return new AppError(
        ERROR_MESSAGES.SERVER_ERROR,
        'SERVER_ERROR',
        status
      );

    default:
      return new AppError(
        data?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        'UNKNOWN_ERROR',
        status,
        data
      );
  }
}

/**
 * Procesa errores de timeout
 */
export function handleTimeoutError(): AppError {
  return new AppError(
    ERROR_MESSAGES.TIMEOUT_ERROR,
    'TIMEOUT_ERROR',
    408
  );
}

/**
 * Convierte un error general en ApiError
 */
export function toApiError(error: any): ApiError {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
      details: error.details,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    status: error.status,
    details: error,
  };
}

/**
 * Obtiene un mensaje de error amigable para el usuario
 */
export function getFriendlyErrorMessage(error: AppError | ApiError): string {
  // Mapeo de códigos de error a mensajes amigables
  const friendlyMessages: Record<string, string> = {
    NETWORK_ERROR: 'No se pudo conectar al servidor. Verifica tu conexión.',
    UNAUTHORIZED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    FORBIDDEN: 'No tienes permisos para realizar esta acción.',
    NOT_FOUND: 'El elemento que buscas no existe o fue eliminado.',
    VALIDATION_ERROR: 'Los datos ingresados no son válidos. Revisa los campos.',
    SERVER_ERROR: 'Error en el servidor. Intenta nuevamente en unos minutos.',
    TIMEOUT_ERROR: 'La operación tardó demasiado. Intenta nuevamente.',
  };

  return friendlyMessages[error.code] || error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Determina si un error requiere reautenticación
 */
export function requiresReauth(error: AppError | ApiError): boolean {
  return error.code === 'UNAUTHORIZED' || error.status === HTTP_STATUS.UNAUTHORIZED;
}

/**
 * Determina si un error es recuperable (puede reintentar)
 */
export function isRetriableError(error: AppError | ApiError): boolean {
  const retriableCodes = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'];
  return retriableCodes.includes(error.code);
}

/**
 * Logger de errores (console en desarrollo, servicio externo en producción)
 */
export function logError(error: AppError | ApiError, context?: string): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context: context || 'Unknown',
    code: error.code,
    message: error.message,
    status: error.status,
    details: error.details,
  };

  // En desarrollo, mostrar en consola
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Application Error:', errorInfo);
  }

  // TODO: En producción, enviar a servicio de logging (Sentry, LogRocket, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   sendToLoggingService(errorInfo);
  // }
}

/**
 * Wrapper para manejo de errores en funciones async
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = error instanceof AppError ? error : handleApiError(error);
      logError(appError, context);
      throw appError;
    }
  };
}

/**
 * Hook personalizado para manejo de errores en componentes React
 */
export function useErrorHandler() {
  const handleError = (error: any, context?: string) => {
    const appError = error instanceof AppError ? error : handleApiError(error);
    logError(appError, context);
    
    // TODO: Mostrar toast de error o actualizar estado global
    return appError;
  };

  return { handleError };
}

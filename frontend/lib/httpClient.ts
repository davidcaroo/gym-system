/**
 * Wrapper para fetch con manejo de autenticación, cookies y errores
 */

import { API_CONFIG, HTTP_STATUS } from './constants';
import { handleApiError, handleTimeoutError, AppError } from './errorHandler';

export interface RequestConfig extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

/**
 * Clase para manejo de peticiones HTTP
 */
export class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultTimeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = { ...API_CONFIG.HEADERS };
  }

  /**
   * Método principal para realizar peticiones
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      skipAuth = false,
      ...fetchConfig
    } = config;

    // Construir URL completa
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    // Configurar headers
    const headers = {
      ...this.defaultHeaders,
      ...fetchConfig.headers,
    };

    // Configurar petición
    const requestConfig: RequestInit = {
      ...fetchConfig,
      headers,
      credentials: 'include', // Importante para cookies de sesión
    };

    // Crear AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Realizar petición
      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Verificar si es una respuesta exitosa
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Verificar si hay contenido
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      }

      // Para respuestas no JSON (ej. CSV)
      const text = await response.text();
      return text as unknown as T;

    } catch (error: any) {
      clearTimeout(timeoutId);

      // Error de timeout
      if (error.name === 'AbortError') {
        throw handleTimeoutError();
      }

      // Error HTTP o de red
      throw handleApiError({
        response: {
          status: error.status,
          data: error.message,
        },
      });
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Request para descargar archivos
   */
  async download(endpoint: string, config?: RequestConfig): Promise<Blob> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...config,
      credentials: 'include',
    });

    if (!response.ok) {
      throw handleApiError({
        response: {
          status: response.status,
          data: await response.text(),
        },
      });
    }

    return response.blob();
  }

  /**
   * Configura headers globales
   */
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * Elimina header global
   */
  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  /**
   * Obtiene headers actuales
   */
  getDefaultHeaders(): Record<string, string> {
    return { ...this.defaultHeaders };
  }

  /**
   * Actualiza la URL base
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }
}

// Instancia singleton del cliente HTTP
export const httpClient = new HttpClient();

/**
 * Helper para verificar si una respuesta es exitosa
 */
export function isSuccessResponse<T>(response: any): response is { success: true; data: T } {
  return response && response.success === true;
}

/**
 * Helper para verificar si una respuesta es de error
 */
export function isErrorResponse(response: any): response is { success: false; error: any } {
  return response && response.success === false;
}

/**
 * Helper para extraer datos de una respuesta
 */
export function extractData<T>(response: any): T {
  if (isSuccessResponse<T>(response)) {
    return response.data;
  }
  
  if (isErrorResponse(response)) {
    throw new AppError(
      response.error?.message || 'Error en la respuesta',
      response.error?.code || 'RESPONSE_ERROR',
      undefined,
      response.error
    );
  }

  // Si no tiene la estructura esperada, devolver como está
  return response as T;
}

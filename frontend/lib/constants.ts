/**
 * Constantes de configuración para la aplicación
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  TIMEOUT: 10000, // 10 segundos
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// API Endpoints basados en la estructura real del backend
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify',
    CHANGE_PASSWORD: '/api/auth/cambiar-password',
  },
  
  // Members
  MEMBERS: {
    BASE: '/api/miembros',
    GET_ALL: '/api/miembros',
    GET_BY_ID: (id: number) => `/api/miembros/${id}`,
    CREATE: '/api/miembros',
    UPDATE: (id: number) => `/api/miembros/${id}`,
    DELETE: (id: number) => `/api/miembros/${id}`,
    ACTIVE: '/api/miembros/activos',
    SEARCH: (query: string) => `/api/miembros/buscar/${query}`,
    STATS: '/api/miembros/stats',
  },
  
  // Memberships
  MEMBERSHIPS: {
    BASE: '/api/membresias',
    GET_ALL: '/api/membresias',
    GET_BY_ID: (id: number) => `/api/membresias/${id}`,
    CREATE: '/api/membresias',
    UPDATE: (id: number) => `/api/membresias/${id}`,
    DELETE: (id: number) => `/api/membresias/${id}`,
  },
  
  // Products
  PRODUCTS: {
    BASE: '/api/productos',
    GET_ALL: '/api/productos',
    GET_BY_ID: (id: number) => `/api/productos/${id}`,
    CREATE: '/api/productos',
    UPDATE: (id: number) => `/api/productos/${id}`,
    DELETE: (id: number) => `/api/productos/${id}`,
    SEARCH: (query: string) => `/api/productos/buscar/${query}`,
    STOCK_LOW: '/api/productos/stock-bajo',
    STATS: '/api/productos/stats',
    UPDATE_STOCK: (id: number) => `/api/productos/${id}/stock`,
  },
  
  // Sales
  SALES: {
    BASE: '/api/ventas',
    GET_ALL: '/api/ventas',
    GET_BY_ID: (id: number) => `/api/ventas/${id}`,
    CREATE: '/api/ventas',
    UPDATE: (id: number) => `/api/ventas/${id}`,
    CANCEL: (id: number) => `/api/ventas/${id}/cancelar`,
    TODAY: '/api/ventas/hoy',
    STATS: '/api/ventas/stats',
    BY_DATE_RANGE: '/api/ventas/rango-fechas',
  },
  
  // Payments
  PAYMENTS: {
    BASE: '/api/pagos',
    GET_ALL: '/api/pagos',
    GET_BY_ID: (id: number) => `/api/pagos/${id}`,
    CREATE: '/api/pagos',
    UPDATE: (id: number) => `/api/pagos/${id}`,
    BY_MEMBER: (memberId: number) => `/api/pagos/miembro/${memberId}`,
    PENDING: '/api/pagos/pendientes',
    OVERDUE: '/api/pagos/vencidos',
    STATS: '/api/pagos/stats',
  },
  
  // Access Control
  ACCESS: {
    BASE: '/api/accesos',
    GET_ALL: '/api/accesos',
    GET_BY_ID: (id: number) => `/api/accesos/${id}`,
    CHECK_IN: '/api/accesos/entrada',
    CHECK_OUT: (id: number) => `/api/accesos/${id}/salida`,
    BY_MEMBER: (memberId: number) => `/api/accesos/miembro/${memberId}`,
    ACTIVE: '/api/accesos/activos',
    VALIDATE: (document: string) => `/api/accesos/validar/${document}`,
    STATS: '/api/accesos/stats',
  },
  
  // Reports
  REPORTS: {
    DASHBOARD: '/api/reportes/dashboard',
    ACTIVITY_RECENT: '/api/reportes/actividad-reciente',
    FINANCIAL: '/api/reportes/financiero',
    MEMBERS: '/api/reportes/miembros',
    USAGE: '/api/reportes/uso',
    PAYMENTS: '/api/reportes/pagos',
    SALES: '/api/reportes/ventas',
    COMPLETE: '/api/reportes/completo',
    EXPORT_CSV: '/api/reportes/exportar/csv',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes autorización. Por favor, inicia sesión.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  SERVER_ERROR: 'Error interno del servidor. Intenta nuevamente.',
  VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
  TIMEOUT_ERROR: 'La petición tardó demasiado. Intenta nuevamente.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Sesión iniciada correctamente',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  SAVE_SUCCESS: 'Guardado exitosamente',
  DELETE_SUCCESS: 'Eliminado exitosamente',
  UPDATE_SUCCESS: 'Actualizado exitosamente',
  CREATED_SUCCESS: 'Creado exitosamente',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'GymPro',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 300, // ms para búsquedas
  AUTO_REFRESH_INTERVAL: 30000, // 30 segundos para dashboard
} as const;

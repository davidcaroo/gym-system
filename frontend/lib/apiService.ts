/**
 * Servicio principal para comunicación con el backend
 * Implementa todos los endpoints disponibles en la API
 */

import { API_ENDPOINTS } from './constants';
import { httpClient, extractData } from './httpClient';
import type {
  ApiResponse,
  Member,
  Product,
  Sale,
  Payment,
  Access,
  DashboardStats,
  Membership,
  LoginRequest,
  LoginResponse,
  MembershipRequest,
  ProductRequest,
  SaleRequest,
  PaymentRequest,
  AccessRequest,
  ReportFilters,
  SalesReport,
  AccessReport,
  InventoryReport,
  FinancialReport,
  IngresosChart,
  ActividadReciente,
  AlertaSistema,
  ProductoStockBajo,
} from './types';
import { withErrorHandling } from './errorHandler';

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión
   */
  login: withErrorHandling(async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await httpClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return extractData(response);
  }),

  /**
   * Cerrar sesión
   */
  logout: withErrorHandling(async (): Promise<void> => {
    await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }),

  /**
   * Verificar sesión actual
   */
  verify: withErrorHandling(async (): Promise<LoginResponse> => {
    const response = await httpClient.get<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.VERIFY
    );
    return extractData(response);
  }),
};

/**
 * Servicio de miembros
 */
export const membersService = {
  /**
   * Obtener todos los miembros
   */
  getAll: withErrorHandling(async (): Promise<Member[]> => {
    const response = await httpClient.get<ApiResponse<Member[]>>(
      API_ENDPOINTS.MEMBERS.GET_ALL
    );
    return extractData(response);
  }),

  /**
   * Obtener miembro por ID
   */
  getById: withErrorHandling(async (id: number): Promise<Member> => {
    const response = await httpClient.get<ApiResponse<Member>>(
      API_ENDPOINTS.MEMBERS.GET_BY_ID(id)
    );
    return extractData(response);
  }),

  /**
   * Crear nuevo miembro
   */
  create: withErrorHandling(async (member: Omit<Member, 'id' | 'fecha_registro'>): Promise<Member> => {
    const response = await httpClient.post<ApiResponse<Member>>(
      API_ENDPOINTS.MEMBERS.CREATE,
      member
    );
    return extractData(response);
  }),

  /**
   * Actualizar miembro
   */
  update: withErrorHandling(async (id: number, member: Partial<Member>): Promise<Member> => {
    const response = await httpClient.put<ApiResponse<Member>>(
      API_ENDPOINTS.MEMBERS.UPDATE(id),
      member
    );
    return extractData(response);
  }),

  /**
   * Eliminar miembro
   */
  delete: withErrorHandling(async (id: number): Promise<void> => {
    await httpClient.delete(
      API_ENDPOINTS.MEMBERS.DELETE(id)
    );
  }),

  /**
   * Buscar miembros
   */
  search: withErrorHandling(async (term: string): Promise<Member[]> => {
    const response = await httpClient.get<ApiResponse<Member[]>>(
      API_ENDPOINTS.MEMBERS.SEARCH(term)
    );
    return extractData(response);
  }),

  /**
   * Obtener miembros activos
   */
  getActive: withErrorHandling(async (): Promise<Member[]> => {
    const response = await httpClient.get<ApiResponse<Member[]>>(
      API_ENDPOINTS.MEMBERS.ACTIVE
    );
    return extractData(response);
  }),
};

/**
 * Servicio de membresías
 */
export const membershipsService = {
  /**
   * Obtener todas las membresías
   */
  getAll: withErrorHandling(async (): Promise<Membership[]> => {
    const response = await httpClient.get<ApiResponse<Membership[]>>(
      API_ENDPOINTS.MEMBERSHIPS.GET_ALL
    );
    return extractData(response);
  }),

  /**
   * Obtener membresía por ID
   */
  getById: withErrorHandling(async (id: number): Promise<Membership> => {
    const response = await httpClient.get<ApiResponse<Membership>>(
      API_ENDPOINTS.MEMBERSHIPS.GET_BY_ID(id)
    );
    return extractData(response);
  }),

  /**
   * Crear nueva membresía
   */
  create: withErrorHandling(async (membership: MembershipRequest): Promise<Membership> => {
    const response = await httpClient.post<ApiResponse<Membership>>(
      API_ENDPOINTS.MEMBERSHIPS.CREATE,
      membership
    );
    return extractData(response);
  }),

  /**
   * Actualizar membresía
   */
  update: withErrorHandling(async (id: number, membership: Partial<MembershipRequest>): Promise<Membership> => {
    const response = await httpClient.put<ApiResponse<Membership>>(
      API_ENDPOINTS.MEMBERSHIPS.UPDATE(id),
      membership
    );
    return extractData(response);
  }),

  /**
   * Eliminar membresía
   */
  delete: withErrorHandling(async (id: number): Promise<void> => {
    await httpClient.delete(
      API_ENDPOINTS.MEMBERSHIPS.DELETE(id)
    );
  }),
};

/**
 * Servicio de productos
 */
export const productsService = {
  /**
   * Obtener todos los productos
   */
  getAll: withErrorHandling(async (): Promise<Product[]> => {
    const response = await httpClient.get<ApiResponse<Product[]>>(
      API_ENDPOINTS.PRODUCTS.GET_ALL
    );
    return extractData(response);
  }),

  /**
   * Obtener producto por ID
   */
  getById: withErrorHandling(async (id: number): Promise<Product> => {
    const response = await httpClient.get<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)
    );
    return extractData(response);
  }),

  /**
   * Crear nuevo producto
   */
  create: withErrorHandling(async (product: ProductRequest): Promise<Product> => {
    const response = await httpClient.post<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      product
    );
    return extractData(response);
  }),

  /**
   * Actualizar producto
   */
  update: withErrorHandling(async (id: number, product: Partial<ProductRequest>): Promise<Product> => {
    const response = await httpClient.put<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      product
    );
    return extractData(response);
  }),

  /**
   * Eliminar producto
   */
  delete: withErrorHandling(async (id: number): Promise<void> => {
    await httpClient.delete(
      API_ENDPOINTS.PRODUCTS.DELETE(id)
    );
  }),

  /**
   * Buscar productos
   */
  search: withErrorHandling(async (term: string): Promise<Product[]> => {
    const response = await httpClient.get<ApiResponse<Product[]>>(
      API_ENDPOINTS.PRODUCTS.SEARCH(term)
    );
    return extractData(response);
  }),

  /**
   * Actualizar stock
   */
  updateStock: withErrorHandling(async (id: number, quantity: number): Promise<Product> => {
    const response = await httpClient.patch<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id),
      { stock: quantity }
    );
    return extractData(response);
  }),
};

/**
 * Servicio de ventas
 */
export const salesService = {
  /**
   * Obtener todas las ventas
   */
  getAll: withErrorHandling(async (): Promise<Sale[]> => {
    const response = await httpClient.get<ApiResponse<Sale[]>>(
      API_ENDPOINTS.SALES.GET_ALL
    );
    return extractData(response);
  }),

  /**
   * Obtener venta por ID
   */
  getById: withErrorHandling(async (id: number): Promise<Sale> => {
    const response = await httpClient.get<ApiResponse<Sale>>(
      API_ENDPOINTS.SALES.GET_BY_ID(id)
    );
    return extractData(response);
  }),

  /**
   * Crear nueva venta
   */
  create: withErrorHandling(async (sale: SaleRequest): Promise<Sale> => {
    const response = await httpClient.post<ApiResponse<Sale>>(
      API_ENDPOINTS.SALES.CREATE,
      sale
    );
    return extractData(response);
  }),

  /**
   * Actualizar venta
   */
  update: withErrorHandling(async (id: number, sale: Partial<SaleRequest>): Promise<Sale> => {
    const response = await httpClient.put<ApiResponse<Sale>>(
      API_ENDPOINTS.SALES.UPDATE(id),
      sale
    );
    return extractData(response);
  }),

  /**
   * Cancelar venta
   */
  cancel: withErrorHandling(async (id: number): Promise<Sale> => {
    const response = await httpClient.patch<ApiResponse<Sale>>(
      API_ENDPOINTS.SALES.CANCEL(id)
    );
    return extractData(response);
  }),

  /**
   * Obtener ventas por rango de fechas
   */
  getByDateRange: withErrorHandling(async (startDate: string, endDate: string): Promise<Sale[]> => {
    const response = await httpClient.get<ApiResponse<Sale[]>>(
      `${API_ENDPOINTS.SALES.BY_DATE_RANGE}?start=${startDate}&end=${endDate}`
    );
    return extractData(response);
  }),
};

/**
 * Servicio de pagos
 */
export const paymentsService = {
  /**
   * Obtener todos los pagos
   */
  getAll: withErrorHandling(async (): Promise<Payment[]> => {
    const response = await httpClient.get<ApiResponse<Payment[]>>(
      API_ENDPOINTS.PAYMENTS.GET_ALL
    );
    return extractData(response);
  }),

  /**
   * Obtener pago por ID
   */
  getById: withErrorHandling(async (id: number): Promise<Payment> => {
    const response = await httpClient.get<ApiResponse<Payment>>(
      API_ENDPOINTS.PAYMENTS.GET_BY_ID(id)
    );
    return extractData(response);
  }),

  /**
   * Crear nuevo pago
   */
  create: withErrorHandling(async (payment: PaymentRequest): Promise<Payment> => {
    const response = await httpClient.post<ApiResponse<Payment>>(
      API_ENDPOINTS.PAYMENTS.CREATE,
      payment
    );
    return extractData(response);
  }),

  /**
   * Actualizar pago
   */
  update: withErrorHandling(async (id: number, payment: Partial<PaymentRequest>): Promise<Payment> => {
    const response = await httpClient.put<ApiResponse<Payment>>(
      API_ENDPOINTS.PAYMENTS.UPDATE(id),
      payment
    );
    return extractData(response);
  }),

  /**
   * Obtener pagos por miembro
   */
  getByMember: withErrorHandling(async (memberId: number): Promise<Payment[]> => {
    const response = await httpClient.get<ApiResponse<Payment[]>>(
      API_ENDPOINTS.PAYMENTS.BY_MEMBER(memberId)
    );
    return extractData(response);
  }),

  /**
   * Obtener pagos pendientes
   */
  getPending: withErrorHandling(async (): Promise<Payment[]> => {
    const response = await httpClient.get<ApiResponse<Payment[]>>(
      API_ENDPOINTS.PAYMENTS.PENDING
    );
    return extractData(response);
  }),
};

/**
 * Servicio de accesos
 */
export const accessService = {
  /**
   * Obtener todos los accesos
   */
  getAll: withErrorHandling(async (): Promise<Access[]> => {
    const response = await httpClient.get<ApiResponse<Access[]>>(
      API_ENDPOINTS.ACCESS.GET_ALL
    );
    return extractData(response);
  }),

  /**
   * Obtener acceso por ID
   */
  getById: withErrorHandling(async (id: number): Promise<Access> => {
    const response = await httpClient.get<ApiResponse<Access>>(
      API_ENDPOINTS.ACCESS.GET_BY_ID(id)
    );
    return extractData(response);
  }),

  /**
   * Registrar entrada
   */
  checkIn: withErrorHandling(async (memberId: number): Promise<Access> => {
    const response = await httpClient.post<ApiResponse<Access>>(
      API_ENDPOINTS.ACCESS.CHECK_IN,
      { memberId }
    );
    return extractData(response);
  }),

  /**
   * Registrar salida
   */
  checkOut: withErrorHandling(async (id: number): Promise<Access> => {
    const response = await httpClient.patch<ApiResponse<Access>>(
      API_ENDPOINTS.ACCESS.CHECK_OUT(id)
    );
    return extractData(response);
  }),

  /**
   * Obtener accesos por miembro
   */
  getByMember: withErrorHandling(async (memberId: number): Promise<Access[]> => {
    const response = await httpClient.get<ApiResponse<Access[]>>(
      API_ENDPOINTS.ACCESS.BY_MEMBER(memberId)
    );
    return extractData(response);
  }),

  /**
   * Obtener accesos activos
   */
  getActive: withErrorHandling(async (): Promise<Access[]> => {
    const response = await httpClient.get<ApiResponse<Access[]>>(
      API_ENDPOINTS.ACCESS.ACTIVE
    );
    return extractData(response);
  }),
};

/**
 * Servicio de reportes
 */
export const reportsService = {
  /**
   * Obtener estadísticas del dashboard
   */
  getDashboardStats: withErrorHandling(async (): Promise<DashboardStats> => {
    const response = await httpClient.get<ApiResponse<DashboardStats>>(
      API_ENDPOINTS.REPORTS.DASHBOARD
    );
    return extractData(response);
  }),

  /**
   * Obtener datos para gráfico de ingresos (últimos 7 días)
   */
  getIngresosChart: withErrorHandling(async (): Promise<IngresosChart[]> => {
    const response = await httpClient.get<ApiResponse<IngresosChart[]>>(
      `${API_ENDPOINTS.REPORTS.FINANCIAL}?tipo=ingresos_chart&dias=7`
    );
    return extractData(response);
  }),

  /**
   * Obtener actividad reciente
   */
  getActividadReciente: withErrorHandling(async (limit: number = 10): Promise<ActividadReciente[]> => {
    const response = await httpClient.get<ApiResponse<ActividadReciente[]>>(
      `${API_ENDPOINTS.REPORTS.ACTIVITY_RECENT}?limite=${limit}`
    );
    return extractData(response);
  }),

  /**
   * Obtener alertas del sistema
   */
  getAlertas: withErrorHandling(async (): Promise<AlertaSistema[]> => {
    const response = await httpClient.get<ApiResponse<AlertaSistema[]>>(
      `${API_ENDPOINTS.REPORTS.DASHBOARD}/alertas`
    );
    return extractData(response);
  }),

  /**
   * Obtener productos con stock bajo
   */
  getProductosStockBajo: withErrorHandling(async (): Promise<ProductoStockBajo[]> => {
    const response = await httpClient.get<ApiResponse<ProductoStockBajo[]>>(
      API_ENDPOINTS.PRODUCTS.STOCK_LOW
    );
    return extractData(response);
  }),

  /**
   * Generar reporte de ventas
   */
  getSalesReport: withErrorHandling(async (filters?: ReportFilters): Promise<SalesReport> => {
    const params = new URLSearchParams();
    if (filters?.fecha_inicio) params.append('startDate', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('endDate', filters.fecha_fin);
    if (filters?.miembro_id) params.append('memberId', filters.miembro_id.toString());

    const response = await httpClient.get<ApiResponse<SalesReport>>(
      `${API_ENDPOINTS.REPORTS.SALES}?${params.toString()}`
    );
    return extractData(response);
  }),

  /**
   * Generar reporte de accesos
   */
  getAccessReport: withErrorHandling(async (filters?: ReportFilters): Promise<AccessReport> => {
    const params = new URLSearchParams();
    if (filters?.fecha_inicio) params.append('startDate', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('endDate', filters.fecha_fin);
    if (filters?.miembro_id) params.append('memberId', filters.miembro_id.toString());

    const response = await httpClient.get<ApiResponse<AccessReport>>(
      `${API_ENDPOINTS.REPORTS.USAGE}?${params.toString()}`
    );
    return extractData(response);
  }),

  /**
   * Generar reporte de inventario
   */
  getInventoryReport: withErrorHandling(async (): Promise<InventoryReport> => {
    const response = await httpClient.get<ApiResponse<InventoryReport>>(
      API_ENDPOINTS.REPORTS.COMPLETE
    );
    return extractData(response);
  }),

  /**
   * Generar reporte financiero
   */
  getFinancialReport: withErrorHandling(async (filters?: ReportFilters): Promise<FinancialReport> => {
    const params = new URLSearchParams();
    if (filters?.fecha_inicio) params.append('startDate', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('endDate', filters.fecha_fin);

    const response = await httpClient.get<ApiResponse<FinancialReport>>(
      `${API_ENDPOINTS.REPORTS.FINANCIAL}?${params.toString()}`
    );
    return extractData(response);
  }),

  /**
   * Exportar reporte a CSV
   */
  exportToCsv: withErrorHandling(async (type: string, filters?: ReportFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('type', type);
    if (filters?.fecha_inicio) params.append('startDate', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('endDate', filters.fecha_fin);
    if (filters?.miembro_id) params.append('memberId', filters.miembro_id.toString());

    return await httpClient.download(
      `${API_ENDPOINTS.REPORTS.EXPORT_CSV}?${params.toString()}`
    );
  }),
};

/**
 * Servicio principal que agrupa todos los servicios
 */
export const apiService = {
  auth: authService,
  members: membersService,
  memberships: membershipsService,
  products: productsService,
  sales: salesService,
  payments: paymentsService,
  access: accessService,
  reports: reportsService,
};

export default apiService;

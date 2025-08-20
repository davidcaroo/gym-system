import { Database } from 'better-sqlite3';
import { getDatabase } from '../database/connection';
import { logger } from '../utils/logger';
import {
  ReporteFinanciero,
  AnalyticsMiembros,
  EstadisticasUso,
  ReportePagos,
  AnalyticsVentas,
  DashboardKPIs,
  FiltrosReporte
} from '../types';

export class ReporteModel {
  private db: Database;

  constructor() {
    this.db = getDatabase();
  }

  // REPORTES FINANCIEROS
  async getReporteFinanciero(filtros: FiltrosReporte): Promise<ReporteFinanciero> {
    try {
      const { fecha_inicio, fecha_fin } = this.procesarFechas(filtros);

      // Ingresos por membresías (pagos)
      const ingresosMembresiaQuery = `
        SELECT 
          COALESCE(SUM(monto), 0) as ingresos_membresias,
          COUNT(*) as total_pagos
        FROM pagos 
        WHERE estado = 'pagado' 
        AND DATE(fecha_pago) BETWEEN ? AND ?
      `;

      const ingresosMembresias = this.db.prepare(ingresosMembresiaQuery).get(fecha_inicio, fecha_fin) as any;

      // Ingresos por productos (ventas)
      const ingresosProductosQuery = `
        SELECT 
          COALESCE(SUM(total), 0) as ingresos_productos,
          COUNT(*) as total_ventas
        FROM ventas 
        WHERE DATE(fecha_venta) BETWEEN ? AND ?
      `;

      const ingresosProductos = this.db.prepare(ingresosProductosQuery).get(fecha_inicio, fecha_fin) as any;

      const ingresos_totales = (ingresosMembresias.ingresos_membresias || 0) + (ingresosProductos.ingresos_productos || 0);
      const total_transacciones = (ingresosMembresias.total_pagos || 0) + (ingresosProductos.total_ventas || 0);

      // Calcular crecimiento vs período anterior
      const diasPeriodo = this.calcularDiasPeriodo(fecha_inicio, fecha_fin);
      const fechaInicioAnterior = this.restarDias(fecha_inicio, diasPeriodo);
      const fechaFinAnterior = this.restarDias(fecha_fin, diasPeriodo);

      const ingresosPeriodoAnterior = await this.calcularIngresosPeriodo(fechaInicioAnterior, fechaFinAnterior);
      const crecimiento_vs_periodo_anterior = ingresosPeriodoAnterior > 0 
        ? ((ingresos_totales - ingresosPeriodoAnterior) / ingresosPeriodoAnterior) * 100 
        : 0;

      return {
        periodo: `${fecha_inicio} a ${fecha_fin}`,
        fecha_inicio,
        fecha_fin,
        ingresos_totales,
        ingresos_membresias: ingresosMembresias.ingresos_membresias || 0,
        ingresos_productos: ingresosProductos.ingresos_productos || 0,
        total_transacciones,
        ticket_promedio: total_transacciones > 0 ? ingresos_totales / total_transacciones : 0,
        crecimiento_vs_periodo_anterior: Math.round(crecimiento_vs_periodo_anterior * 100) / 100
      };
    } catch (error) {
      logger.error('Error al generar reporte financiero:', error);
      throw error;
    }
  }

  // ANALYTICS DE MIEMBROS
  async getAnalyticsMiembros(filtros: FiltrosReporte): Promise<AnalyticsMiembros> {
    try {
      const { fecha_inicio, fecha_fin } = this.procesarFechas(filtros);

      // Total de miembros
      const totalMiembrosQuery = `
        SELECT COUNT(*) as total 
        FROM miembros 
        WHERE DATE(fecha_registro) <= ?
      `;
      const totalMiembros = this.db.prepare(totalMiembrosQuery).get(fecha_fin) as { total: number };

      // Miembros nuevos en el período
      const miembrosNuevosQuery = `
        SELECT COUNT(*) as nuevos 
        FROM miembros 
        WHERE DATE(fecha_registro) BETWEEN ? AND ?
      `;
      const miembrosNuevos = this.db.prepare(miembrosNuevosQuery).get(fecha_inicio, fecha_fin) as { nuevos: number };

      // Miembros activos (con pagos recientes)
      const miembrosActivosQuery = `
        SELECT COUNT(DISTINCT m.id) as activos
        FROM miembros m
        INNER JOIN pagos p ON m.id = p.miembro_id
        WHERE p.estado = 'pagado' 
        AND DATE(p.fecha_vencimiento) >= ?
      `;
      const miembrosActivos = this.db.prepare(miembrosActivosQuery).get(fecha_fin) as { activos: number };

      // Distribución por tipo de membresía
      const membresiasPorTipoQuery = `
        SELECT 
          tm.nombre as tipo,
          COUNT(m.id) as cantidad,
          ROUND((COUNT(m.id) * 100.0 / ?), 2) as porcentaje
        FROM miembros m
        INNER JOIN tipos_membresia tm ON m.tipo_membresia_id = tm.id
        WHERE m.estado = 'activo'
        GROUP BY tm.id, tm.nombre
        ORDER BY cantidad DESC
      `;
      const membresias_por_tipo = this.db.prepare(membresiasPorTipoQuery).all(totalMiembros.total) as any[];

      // Calcular métricas
      const miembros_inactivos = totalMiembros.total - miembrosActivos.activos;
      const tasa_retencion = totalMiembros.total > 0 ? (miembrosActivos.activos / totalMiembros.total) * 100 : 0;
      const tasa_churn = 100 - tasa_retencion;

      // Valor promedio del cliente (ingresos por membresías / miembros activos)
      const ingresosMembresiaQuery = `
        SELECT COALESCE(SUM(monto), 0) as total_ingresos
        FROM pagos 
        WHERE estado = 'pagado' 
        AND DATE(fecha_pago) BETWEEN ? AND ?
      `;
      const ingresosMembresia = this.db.prepare(ingresosMembresiaQuery).get(fecha_inicio, fecha_fin) as { total_ingresos: number };
      const valor_promedio_cliente = miembrosActivos.activos > 0 ? ingresosMembresia.total_ingresos / miembrosActivos.activos : 0;

      return {
        periodo: `${fecha_inicio} a ${fecha_fin}`,
        total_miembros: totalMiembros.total,
        miembros_nuevos: miembrosNuevos.nuevos,
        miembros_activos: miembrosActivos.activos,
        miembros_inactivos,
        tasa_retencion: Math.round(tasa_retencion * 100) / 100,
        tasa_churn: Math.round(tasa_churn * 100) / 100,
        valor_promedio_cliente: Math.round(valor_promedio_cliente),
        membresias_por_tipo
      };
    } catch (error) {
      logger.error('Error al generar analytics de miembros:', error);
      throw error;
    }
  }

  // ESTADÍSTICAS DE USO
  async getEstadisticasUso(filtros: FiltrosReporte): Promise<EstadisticasUso> {
    try {
      const { fecha_inicio, fecha_fin } = this.procesarFechas(filtros);

      // Total de accesos en el período
      const totalAccesosQuery = `
        SELECT COUNT(*) as total_accesos
        FROM accesos 
        WHERE DATE(fecha_entrada) BETWEEN ? AND ?
      `;
      const totalAccesos = this.db.prepare(totalAccesosQuery).get(fecha_inicio, fecha_fin) as { total_accesos: number };

      // Días del período para calcular promedio
      const diasPeriodo = this.calcularDiasPeriodo(fecha_inicio, fecha_fin);
      const accesos_promedio_dia = diasPeriodo > 0 ? totalAccesos.total_accesos / diasPeriodo : 0;

      // Ocupación máxima y promedio
      const ocupacionQuery = `
        SELECT 
          DATE(fecha_entrada) as fecha,
          COUNT(*) as accesos_dia,
          MAX(COUNT(*)) OVER() as ocupacion_maxima
        FROM accesos 
        WHERE DATE(fecha_entrada) BETWEEN ? AND ?
        GROUP BY DATE(fecha_entrada)
      `;
      const ocupacionData = this.db.prepare(ocupacionQuery).all(fecha_inicio, fecha_fin) as any[];
      const ocupacion_maxima = ocupacionData.length > 0 ? ocupacionData[0].ocupacion_maxima : 0;
      const ocupacion_promedio = ocupacionData.length > 0 
        ? ocupacionData.reduce((sum, day) => sum + day.accesos_dia, 0) / ocupacionData.length 
        : 0;

      // Hora pico
      const horaPicoQuery = `
        SELECT 
          strftime('%H:00', fecha_entrada) as hora,
          COUNT(*) as accesos
        FROM accesos 
        WHERE DATE(fecha_entrada) BETWEEN ? AND ?
        GROUP BY strftime('%H', fecha_entrada)
        ORDER BY accesos DESC
        LIMIT 1
      `;
      const horaPico = this.db.prepare(horaPicoQuery).get(fecha_inicio, fecha_fin) as { hora: string; accesos: number } | undefined;

      // Duración promedio de visita
      const duracionQuery = `
        SELECT AVG(
          CASE 
            WHEN fecha_salida IS NOT NULL 
            THEN (julianday(fecha_salida) - julianday(fecha_entrada)) * 24 * 60 
            ELSE NULL 
          END
        ) as duracion_promedio
        FROM accesos 
        WHERE DATE(fecha_entrada) BETWEEN ? AND ?
        AND fecha_salida IS NOT NULL
      `;
      const duracion = this.db.prepare(duracionQuery).get(fecha_inicio, fecha_fin) as { duracion_promedio: number | null };

      // Días más concurridos
      const diasConcurridosQuery = `
        SELECT 
          CASE strftime('%w', fecha_entrada)
            WHEN '0' THEN 'Domingo'
            WHEN '1' THEN 'Lunes'
            WHEN '2' THEN 'Martes'
            WHEN '3' THEN 'Miércoles'
            WHEN '4' THEN 'Jueves'
            WHEN '5' THEN 'Viernes'
            WHEN '6' THEN 'Sábado'
          END as dia,
          COUNT(*) as accesos
        FROM accesos 
        WHERE DATE(fecha_entrada) BETWEEN ? AND ?
        GROUP BY strftime('%w', fecha_entrada)
        ORDER BY accesos DESC
      `;
      const dias_mas_concurridos = this.db.prepare(diasConcurridosQuery).all(fecha_inicio, fecha_fin) as any[];

      // Distribución horaria
      const distribucionHorariaQuery = `
        SELECT 
          strftime('%H:00', fecha_entrada) as hora,
          COUNT(*) as accesos,
          ROUND((COUNT(*) * 100.0 / ?), 2) as porcentaje
        FROM accesos 
        WHERE DATE(fecha_entrada) BETWEEN ? AND ?
        GROUP BY strftime('%H', fecha_entrada)
        ORDER BY hora
      `;
      const distribucion_horaria = this.db.prepare(distribucionHorariaQuery).all(totalAccesos.total_accesos, fecha_inicio, fecha_fin) as any[];

      return {
        periodo: `${fecha_inicio} a ${fecha_fin}`,
        total_accesos: totalAccesos.total_accesos,
        accesos_promedio_dia: Math.round(accesos_promedio_dia * 100) / 100,
        ocupacion_maxima,
        ocupacion_promedio: Math.round(ocupacion_promedio * 100) / 100,
        hora_pico: horaPico?.hora || 'N/A',
        duracion_promedio_visita: Math.round((duracion.duracion_promedio || 0) * 100) / 100,
        dias_mas_concurridos,
        distribucion_horaria
      };
    } catch (error) {
      logger.error('Error al generar estadísticas de uso:', error);
      throw error;
    }
  }

  // REPORTES DE PAGOS
  async getReportePagos(filtros: FiltrosReporte): Promise<ReportePagos> {
    try {
      const { fecha_inicio, fecha_fin } = this.procesarFechas(filtros);

      // Estadísticas generales de pagos
      const estadisticasQuery = `
        SELECT 
          COUNT(*) as total_pagos,
          SUM(monto) as monto_total,
          SUM(CASE WHEN estado = 'pagado' THEN 1 ELSE 0 END) as pagos_puntuales,
          SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pagos_tardios,
          SUM(CASE WHEN estado = 'vencido' THEN 1 ELSE 0 END) as pagos_vencidos
        FROM pagos 
        WHERE DATE(fecha_pago) BETWEEN ? AND ?
      `;
      const stats = this.db.prepare(estadisticasQuery).get(fecha_inicio, fecha_fin) as any;

      const tasa_morosidad = stats.total_pagos > 0 
        ? ((stats.pagos_tardios + stats.pagos_vencidos) / stats.total_pagos) * 100 
        : 0;

      // Métodos de pago
      const metodosPagoQuery = `
        SELECT 
          metodo_pago as metodo,
          COUNT(*) as cantidad,
          SUM(monto) as monto,
          ROUND((COUNT(*) * 100.0 / ?), 2) as porcentaje
        FROM pagos 
        WHERE DATE(fecha_pago) BETWEEN ? AND ?
        GROUP BY metodo_pago
        ORDER BY cantidad DESC
      `;
      const metodos_pago = this.db.prepare(metodosPagoQuery).all(stats.total_pagos, fecha_inicio, fecha_fin) as any[];

      // Tendencia de pagos (por día)
      const tendenciaQuery = `
        SELECT 
          DATE(fecha_pago) as fecha,
          COUNT(*) as cantidad,
          SUM(monto) as monto
        FROM pagos 
        WHERE DATE(fecha_pago) BETWEEN ? AND ?
        GROUP BY DATE(fecha_pago)
        ORDER BY fecha
      `;
      const tendencia_pagos = this.db.prepare(tendenciaQuery).all(fecha_inicio, fecha_fin) as any[];

      return {
        periodo: `${fecha_inicio} a ${fecha_fin}`,
        total_pagos: stats.total_pagos || 0,
        monto_total: stats.monto_total || 0,
        pagos_puntuales: stats.pagos_puntuales || 0,
        pagos_tardios: stats.pagos_tardios || 0,
        pagos_vencidos: stats.pagos_vencidos || 0,
        tasa_morosidad: Math.round(tasa_morosidad * 100) / 100,
        metodos_pago,
        tendencia_pagos
      };
    } catch (error) {
      logger.error('Error al generar reporte de pagos:', error);
      throw error;
    }
  }

  // ANALYTICS DE VENTAS
  async getAnalyticsVentas(filtros: FiltrosReporte): Promise<AnalyticsVentas> {
    try {
      const { fecha_inicio, fecha_fin } = this.procesarFechas(filtros);

      // Estadísticas generales de ventas
      const ventasGeneralesQuery = `
        SELECT 
          COUNT(DISTINCT v.id) as ventas_totales,
          SUM(v.total) as monto_total,
          SUM(dv.cantidad) as productos_vendidos
        FROM ventas v
        LEFT JOIN detalle_ventas dv ON v.id = dv.venta_id
        WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      `;
      const ventasGenerales = this.db.prepare(ventasGeneralesQuery).get(fecha_inicio, fecha_fin) as any;

      const ticket_promedio = ventasGenerales.ventas_totales > 0 
        ? ventasGenerales.monto_total / ventasGenerales.ventas_totales 
        : 0;

      // Productos más vendidos
      const productosTopQuery = `
        SELECT 
          p.nombre as producto,
          SUM(dv.cantidad) as cantidad,
          SUM(dv.subtotal) as ingresos
        FROM detalle_ventas dv
        INNER JOIN productos p ON dv.producto_id = p.id
        INNER JOIN ventas v ON dv.venta_id = v.id
        WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        GROUP BY p.id, p.nombre
        ORDER BY cantidad DESC
        LIMIT 10
      `;
      const productos_top = this.db.prepare(productosTopQuery).all(fecha_inicio, fecha_fin) as any[];

      // Categorías más vendidas (simulado por falta de tabla categorías)
      const categoriasTopQuery = `
        SELECT 
          'Suplementos' as categoria,
          SUM(dv.cantidad) as cantidad,
          SUM(dv.subtotal) as ingresos
        FROM detalle_ventas dv
        INNER JOIN productos p ON dv.producto_id = p.id
        INNER JOIN ventas v ON dv.venta_id = v.id
        WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND (p.nombre LIKE '%Proteína%' OR p.nombre LIKE '%Creatina%')
        UNION ALL
        SELECT 
          'Accesorios' as categoria,
          SUM(dv.cantidad) as cantidad,
          SUM(dv.subtotal) as ingresos
        FROM detalle_ventas dv
        INNER JOIN productos p ON dv.producto_id = p.id
        INNER JOIN ventas v ON dv.venta_id = v.id
        WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND p.nombre NOT LIKE '%Proteína%' AND p.nombre NOT LIKE '%Creatina%'
        ORDER BY ingresos DESC
      `;
      const categorias_top = this.db.prepare(categoriasTopQuery).all(fecha_inicio, fecha_fin, fecha_inicio, fecha_fin) as any[];

      // Tendencia de ventas
      const tendenciaQuery = `
        SELECT 
          DATE(fecha_venta) as fecha,
          COUNT(*) as ventas,
          SUM(total) as ingresos
        FROM ventas 
        WHERE DATE(fecha_venta) BETWEEN ? AND ?
        GROUP BY DATE(fecha_venta)
        ORDER BY fecha
      `;
      const tendencia_ventas = this.db.prepare(tendenciaQuery).all(fecha_inicio, fecha_fin) as any[];

      return {
        periodo: `${fecha_inicio} a ${fecha_fin}`,
        ventas_totales: ventasGenerales.ventas_totales || 0,
        productos_vendidos: ventasGenerales.productos_vendidos || 0,
        ticket_promedio: Math.round(ticket_promedio),
        productos_top,
        categorias_top: categorias_top.filter(cat => cat.cantidad > 0),
        tendencia_ventas
      };
    } catch (error) {
      logger.error('Error al generar analytics de ventas:', error);
      throw error;
    }
  }

  // DASHBOARD EJECUTIVO
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    try {
      const fechaActual = new Date().toISOString().split('T')[0];
      const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const primerDiaMesAnterior = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0];
      const ultimoDiaMesAnterior = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0];

      // Ingresos mes actual
      const ingresosMesQuery = `
        SELECT 
          COALESCE(SUM(p.monto), 0) + COALESCE(SUM(v.total), 0) as total_ingresos
        FROM (
          SELECT monto FROM pagos WHERE estado = 'pagado' AND DATE(fecha_pago) BETWEEN ? AND ?
        ) p
        CROSS JOIN (
          SELECT total FROM ventas WHERE DATE(fecha_venta) BETWEEN ? AND ?
        ) v
      `;
      
      // Simplificando la consulta de ingresos
      const ingresosPagosActualQuery = `SELECT COALESCE(SUM(monto), 0) as total FROM pagos WHERE estado = 'pagado' AND DATE(fecha_pago) BETWEEN ? AND ?`;
      const ingresosVentasActualQuery = `SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE DATE(fecha_venta) BETWEEN ? AND ?`;
      
      const ingresosPagosActual = this.db.prepare(ingresosPagosActualQuery).get(primerDiaMes, fechaActual) as { total: number };
      const ingresosVentasActual = this.db.prepare(ingresosVentasActualQuery).get(primerDiaMes, fechaActual) as { total: number };
      const ingresos_mes_actual = ingresosPagosActual.total + ingresosVentasActual.total;

      // Ingresos mes anterior
      const ingresosPagosAnteriorQuery = `SELECT COALESCE(SUM(monto), 0) as total FROM pagos WHERE estado = 'pagado' AND DATE(fecha_pago) BETWEEN ? AND ?`;
      const ingresosVentasAnteriorQuery = `SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE DATE(fecha_venta) BETWEEN ? AND ?`;
      
      const ingresosPagosAnterior = this.db.prepare(ingresosPagosAnteriorQuery).get(primerDiaMesAnterior, ultimoDiaMesAnterior) as { total: number };
      const ingresosVentasAnterior = this.db.prepare(ingresosVentasAnteriorQuery).get(primerDiaMesAnterior, ultimoDiaMesAnterior) as { total: number };
      const ingresos_mes_anterior = ingresosPagosAnterior.total + ingresosVentasAnterior.total;

      const crecimiento_ingresos = ingresos_mes_anterior > 0 
        ? ((ingresos_mes_actual - ingresos_mes_anterior) / ingresos_mes_anterior) * 100 
        : 0;

      // Miembros activos
      const miembrosActivosQuery = `
        SELECT COUNT(DISTINCT m.id) as activos
        FROM miembros m
        INNER JOIN pagos p ON m.id = p.miembro_id
        WHERE p.estado = 'pagado' 
        AND DATE(p.fecha_vencimiento) >= ?
      `;
      const miembrosActivos = this.db.prepare(miembrosActivosQuery).get(fechaActual) as { activos: number };

      // Nuevos miembros este mes
      const nuevosMiembrosQuery = `
        SELECT COUNT(*) as nuevos 
        FROM miembros 
        WHERE DATE(fecha_registro) BETWEEN ? AND ?
      `;
      const nuevosMiembros = this.db.prepare(nuevosMiembrosQuery).get(primerDiaMes, fechaActual) as { nuevos: number };

      // Tasa de ocupación promedio del mes
      const ocupacionQuery = `
        SELECT AVG(accesos_dia) as ocupacion_promedio
        FROM (
          SELECT DATE(fecha_entrada) as fecha, COUNT(*) as accesos_dia
          FROM accesos 
          WHERE DATE(fecha_entrada) BETWEEN ? AND ?
          GROUP BY DATE(fecha_entrada)
        )
      `;
      const ocupacion = this.db.prepare(ocupacionQuery).get(primerDiaMes, fechaActual) as { ocupacion_promedio: number | null };

      // Total accesos del mes
      const accesosQuery = `SELECT COUNT(*) as total FROM accesos WHERE DATE(fecha_entrada) BETWEEN ? AND ?`;
      const accesos = this.db.prepare(accesosQuery).get(primerDiaMes, fechaActual) as { total: number };

      // Tasa de morosidad
      const morosidadQuery = `
        SELECT 
          COUNT(*) as total_pagos,
          SUM(CASE WHEN estado IN ('pendiente', 'vencido') THEN 1 ELSE 0 END) as pagos_morosos
        FROM pagos 
        WHERE DATE(fecha_vencimiento) <= ?
      `;
      const morosidad = this.db.prepare(morosidadQuery).get(fechaActual) as { total_pagos: number; pagos_morosos: number };
      const tasa_morosidad = morosidad.total_pagos > 0 ? (morosidad.pagos_morosos / morosidad.total_pagos) * 100 : 0;

      // Productos vendidos este mes
      const productosVendidosQuery = `
        SELECT COALESCE(SUM(dv.cantidad), 0) as total 
        FROM ventas v
        LEFT JOIN detalle_ventas dv ON v.id = dv.venta_id
        WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      `;
      const productosVendidos = this.db.prepare(productosVendidosQuery).get(primerDiaMes, fechaActual) as { total: number | null };

      return {
        fecha_actualizacion: new Date().toISOString(),
        ingresos_mes_actual,
        ingresos_mes_anterior,
        crecimiento_ingresos: Math.round(crecimiento_ingresos * 100) / 100,
        miembros_activos: miembrosActivos.activos,
        nuevos_miembros_mes: nuevosMiembros.nuevos,
        tasa_ocupacion_promedio: Math.round((ocupacion.ocupacion_promedio || 0) * 100) / 100,
        total_accesos_mes: accesos.total,
        tasa_morosidad: Math.round(tasa_morosidad * 100) / 100,
        productos_vendidos_mes: productosVendidos.total || 0,
        nps_score: 85 // Simulado - en un sistema real vendría de encuestas
      };
    } catch (error) {
      logger.error('Error al generar dashboard KPIs:', error);
      throw error;
    }
  }

  // MÉTODOS AUXILIARES
  private procesarFechas(filtros: FiltrosReporte): { fecha_inicio: string; fecha_fin: string } {
    const hoy = new Date();
    let fecha_inicio: string;
    let fecha_fin: string;

    if (filtros.fecha_inicio && filtros.fecha_fin) {
      fecha_inicio = filtros.fecha_inicio;
      fecha_fin = filtros.fecha_fin;
    } else {
      switch (filtros.tipo_reporte) {
        case 'diario':
          fecha_inicio = fecha_fin = hoy.toISOString().split('T')[0];
          break;
        case 'semanal':
          const inicioSemana = new Date(hoy);
          inicioSemana.setDate(hoy.getDate() - hoy.getDay());
          fecha_inicio = inicioSemana.toISOString().split('T')[0];
          fecha_fin = hoy.toISOString().split('T')[0];
          break;
        case 'mensual':
          fecha_inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
          fecha_fin = hoy.toISOString().split('T')[0];
          break;
        case 'anual':
          fecha_inicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
          fecha_fin = hoy.toISOString().split('T')[0];
          break;
        default:
          // Por defecto, último mes
          fecha_inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
          fecha_fin = hoy.toISOString().split('T')[0];
      }
    }

    return { fecha_inicio, fecha_fin };
  }

  private calcularDiasPeriodo(fecha_inicio: string, fecha_fin: string): number {
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  private restarDias(fecha: string, dias: number): string {
    const date = new Date(fecha);
    date.setDate(date.getDate() - dias);
    return date.toISOString().split('T')[0];
  }

  private async calcularIngresosPeriodo(fecha_inicio: string, fecha_fin: string): Promise<number> {
    const pagoQuery = `SELECT COALESCE(SUM(monto), 0) as total FROM pagos WHERE estado = 'pagado' AND DATE(fecha_pago) BETWEEN ? AND ?`;
    const ventaQuery = `SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE DATE(fecha_venta) BETWEEN ? AND ?`;
    
    const pagos = this.db.prepare(pagoQuery).get(fecha_inicio, fecha_fin) as { total: number };
    const ventas = this.db.prepare(ventaQuery).get(fecha_inicio, fecha_fin) as { total: number };
    
    return pagos.total + ventas.total;
  }
}

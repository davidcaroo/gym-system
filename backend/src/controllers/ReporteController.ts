import { Request, Response } from 'express';
import { ReporteModel } from '../models/ReporteModel';
import { logger } from '../utils/logger';
import Joi from 'joi';
import { FiltrosReporte } from '../types';

export class ReporteController {
  private reporteModel: ReporteModel;

  constructor() {
    this.reporteModel = new ReporteModel();
  }

  // Validar filtros comunes
  private validarFiltros(query: any): { error?: any; filtros?: FiltrosReporte } {
    const schema = Joi.object({
      fecha_inicio: Joi.date().iso().optional(),
      fecha_fin: Joi.date().iso().optional(),
      tipo_reporte: Joi.string().valid('diario', 'semanal', 'mensual', 'anual', 'personalizado').default('mensual'),
      miembro_id: Joi.number().integer().positive().optional(),
      tipo_membresia_id: Joi.number().integer().positive().optional(),
      categoria_producto: Joi.string().optional(),
      incluir_inactivos: Joi.boolean().default(false)
    });

    const { error, value } = schema.validate(query);
    
    if (error) {
      return { error };
    }

    // Convertir fechas a string si son objetos Date
    const filtros: FiltrosReporte = {
      ...value,
      fecha_inicio: value.fecha_inicio ? value.fecha_inicio.toISOString().split('T')[0] : undefined,
      fecha_fin: value.fecha_fin ? value.fecha_fin.toISOString().split('T')[0] : undefined
    };

    return { filtros };
  }

  // Reporte financiero
  getReporteFinanciero = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, filtros } = this.validarFiltros(req.query);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      const reporte = await this.reporteModel.getReporteFinanciero(filtros!);

      res.json({
        success: true,
        data: reporte,
        message: 'Reporte financiero generado exitosamente'
      });
    } catch (error) {
      logger.error('Error en getReporteFinanciero:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Analytics de miembros
  getAnalyticsMiembros = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, filtros } = this.validarFiltros(req.query);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      const analytics = await this.reporteModel.getAnalyticsMiembros(filtros!);

      res.json({
        success: true,
        data: analytics,
        message: 'Analytics de miembros generado exitosamente'
      });
    } catch (error) {
      logger.error('Error en getAnalyticsMiembros:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Estadísticas de uso
  getEstadisticasUso = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, filtros } = this.validarFiltros(req.query);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      const estadisticas = await this.reporteModel.getEstadisticasUso(filtros!);

      res.json({
        success: true,
        data: estadisticas,
        message: 'Estadísticas de uso generadas exitosamente'
      });
    } catch (error) {
      logger.error('Error en getEstadisticasUso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Reporte de pagos
  getReportePagos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, filtros } = this.validarFiltros(req.query);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      const reporte = await this.reporteModel.getReportePagos(filtros!);

      res.json({
        success: true,
        data: reporte,
        message: 'Reporte de pagos generado exitosamente'
      });
    } catch (error) {
      logger.error('Error en getReportePagos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Analytics de ventas
  getAnalyticsVentas = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, filtros } = this.validarFiltros(req.query);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      const analytics = await this.reporteModel.getAnalyticsVentas(filtros!);

      res.json({
        success: true,
        data: analytics,
        message: 'Analytics de ventas generado exitosamente'
      });
    } catch (error) {
      logger.error('Error en getAnalyticsVentas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Dashboard ejecutivo (KPIs)
  getDashboardKPIs = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboard = await this.reporteModel.getDashboardKPIs();

      res.json({
        success: true,
        data: dashboard,
        message: 'Dashboard KPIs generado exitosamente'
      });
    } catch (error) {
      logger.error('Error en getDashboardKPIs:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Reporte completo (todos los datos)
  getReporteCompleto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, filtros } = this.validarFiltros(req.query);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      // Generar todos los reportes en paralelo
      const [
        reporteFinanciero,
        analyticsMiembros,
        estadisticasUso,
        reportePagos,
        analyticsVentas,
        dashboardKPIs
      ] = await Promise.all([
        this.reporteModel.getReporteFinanciero(filtros!),
        this.reporteModel.getAnalyticsMiembros(filtros!),
        this.reporteModel.getEstadisticasUso(filtros!),
        this.reporteModel.getReportePagos(filtros!),
        this.reporteModel.getAnalyticsVentas(filtros!),
        this.reporteModel.getDashboardKPIs()
      ]);

      const reporteCompleto = {
        resumen_ejecutivo: dashboardKPIs,
        financiero: reporteFinanciero,
        miembros: analyticsMiembros,
        uso_instalaciones: estadisticasUso,
        pagos: reportePagos,
        ventas: analyticsVentas,
        generado_en: new Date().toISOString(),
        filtros_aplicados: filtros
      };

      res.json({
        success: true,
        data: reporteCompleto,
        message: 'Reporte completo generado exitosamente'
      });
    } catch (error) {
      logger.error('Error en getReporteCompleto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Exportar reporte a CSV (simplificado)
  exportarReporteCSV = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validación específica para CSV que incluye el parámetro 'reporte'
      const csvSchema = Joi.object({
        reporte: Joi.string().valid('financiero', 'miembros', 'uso', 'pagos', 'ventas').required(),
        fecha_inicio: Joi.date().iso().optional(),
        fecha_fin: Joi.date().iso().optional(),
        tipo_reporte: Joi.string().valid('diario', 'semanal', 'mensual', 'anual', 'personalizado').default('mensual'),
        miembro_id: Joi.number().integer().positive().optional(),
        tipo_membresia_id: Joi.number().integer().positive().optional(),
        categoria_producto: Joi.string().optional(),
        incluir_inactivos: Joi.boolean().default(false)
      });

      const { error, value } = csvSchema.validate(req.query);
      
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }

      const { reporte, ...filtrosRaw } = value;
      
      // Convertir fechas a string si son objetos Date
      const filtros: FiltrosReporte = {
        ...filtrosRaw,
        fecha_inicio: filtrosRaw.fecha_inicio ? filtrosRaw.fecha_inicio.toISOString().split('T')[0] : undefined,
        fecha_fin: filtrosRaw.fecha_fin ? filtrosRaw.fecha_fin.toISOString().split('T')[0] : undefined
      };

      let data: any;
      let filename: string;
      let csvContent: string;

      switch (reporte) {
        case 'financiero':
          data = await this.reporteModel.getReporteFinanciero(filtros);
          filename = `reporte_financiero_${data.fecha_inicio}_${data.fecha_fin}.csv`;
          csvContent = this.generarCSVFinanciero(data);
          break;
        case 'miembros':
          data = await this.reporteModel.getAnalyticsMiembros(filtros);
          filename = `analytics_miembros_${Date.now()}.csv`;
          csvContent = this.generarCSVMiembros(data);
          break;
        case 'uso':
          data = await this.reporteModel.getEstadisticasUso(filtros);
          filename = `estadisticas_uso_${Date.now()}.csv`;
          csvContent = this.generarCSVUso(data);
          break;
        case 'pagos':
          data = await this.reporteModel.getReportePagos(filtros);
          filename = `reporte_pagos_${Date.now()}.csv`;
          csvContent = this.generarCSVPagos(data);
          break;
        case 'ventas':
          data = await this.reporteModel.getAnalyticsVentas(filtros);
          filename = `analytics_ventas_${Date.now()}.csv`;
          csvContent = this.generarCSVVentas(data);
          break;
        default:
          throw new Error('Tipo de reporte no implementado');
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);

    } catch (error) {
      logger.error('Error en exportarReporteCSV:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Métodos auxiliares para generar CSV
  private generarCSVFinanciero(data: any): string {
    return `Período,Ingresos Totales,Ingresos Membresías,Ingresos Productos,Total Transacciones,Ticket Promedio,Crecimiento %
${data.periodo},${data.ingresos_totales},${data.ingresos_membresias},${data.ingresos_productos},${data.total_transacciones},${data.ticket_promedio},${data.crecimiento_vs_periodo_anterior}`;
  }

  private generarCSVMiembros(data: any): string {
    let csv = `Período,Total Miembros,Miembros Nuevos,Miembros Activos,Miembros Inactivos,Tasa Retención %,Tasa Churn %,Valor Promedio Cliente
${data.periodo},${data.total_miembros},${data.miembros_nuevos},${data.miembros_activos},${data.miembros_inactivos},${data.tasa_retencion},${data.tasa_churn},${data.valor_promedio_cliente}

Tipo Membresía,Cantidad,Porcentaje %`;
    
    data.membresias_por_tipo.forEach((tipo: any) => {
      csv += `\n${tipo.tipo},${tipo.cantidad},${tipo.porcentaje}`;
    });
    
    return csv;
  }

  private generarCSVUso(data: any): string {
    let csv = `Período,Total Accesos,Accesos Promedio/Día,Ocupación Máxima,Ocupación Promedio,Hora Pico,Duración Promedio Visita
${data.periodo},${data.total_accesos},${data.accesos_promedio_dia},${data.ocupacion_maxima},${data.ocupacion_promedio},${data.hora_pico},${data.duracion_promedio_visita}

Distribución Horaria
Hora,Accesos,Porcentaje %`;
    
    data.distribucion_horaria.forEach((hora: any) => {
      csv += `\n${hora.hora},${hora.accesos},${hora.porcentaje}`;
    });
    
    return csv;
  }

  private generarCSVPagos(data: any): string {
    return `Período,Total Pagos,Monto Total,Pagos Puntuales,Pagos Tardíos,Pagos Vencidos,Tasa Morosidad %
${data.periodo},${data.total_pagos},${data.monto_total},${data.pagos_puntuales},${data.pagos_tardios},${data.pagos_vencidos},${data.tasa_morosidad}`;
  }

  private generarCSVVentas(data: any): string {
    let csv = `Período,Ventas Totales,Productos Vendidos,Ticket Promedio
${data.periodo},${data.ventas_totales},${data.productos_vendidos},${data.ticket_promedio}

Productos Top
Producto,Cantidad,Ingresos`;
    
    data.productos_top.forEach((producto: any) => {
      csv += `\n${producto.producto},${producto.cantidad},${producto.ingresos}`;
    });
    
    return csv;
  }
}

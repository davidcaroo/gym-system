import { Router } from 'express';
import { ReporteController } from '../controllers/ReporteController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const reporteController = new ReporteController();

// Aplicar middleware de autenticación a todas las rutas de reportes
router.use(requireAuth);

// Dashboard ejecutivo (KPIs principales)
router.get('/dashboard', reporteController.getDashboardKPIs);

// Reportes específicos
router.get('/financiero', reporteController.getReporteFinanciero);
router.get('/miembros', reporteController.getAnalyticsMiembros);
router.get('/uso', reporteController.getEstadisticasUso);
router.get('/pagos', reporteController.getReportePagos);
router.get('/ventas', reporteController.getAnalyticsVentas);

// Reporte completo (todos los reportes juntos)
router.get('/completo', reporteController.getReporteCompleto);

// Exportación a CSV
router.get('/exportar/csv', reporteController.exportarReporteCSV);

export default router;

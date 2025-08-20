import { Router } from 'express';
import { VentaController } from '../controllers/VentaController';

const router = Router();
const ventaController = new VentaController();

// GET /api/ventas - Listar todas las ventas (con paginación)
router.get('/', ventaController.getAll);

// GET /api/ventas/dashboard - Resumen para dashboard
router.get('/dashboard', ventaController.getDashboard);

// GET /api/ventas/stats - Estadísticas de ventas
router.get('/stats', ventaController.getStats);

// GET /api/ventas/reporte/:fecha - Reporte diario
router.get('/reporte/:fecha', ventaController.getReporteDiario);

// GET /api/ventas/fecha/:fecha - Ventas por fecha específica
router.get('/fecha/:fecha', ventaController.getByDate);

// GET /api/ventas/rango - Ventas por rango de fechas
router.get('/rango', ventaController.getByDateRange);

// GET /api/ventas/miembro/:miembroId - Ventas de un miembro
router.get('/miembro/:miembroId', ventaController.getByMiembro);

// GET /api/ventas/buscar/:query - Buscar ventas
router.get('/buscar/:query', ventaController.search);

// GET /api/ventas/:id - Obtener venta por ID
router.get('/:id', ventaController.getById);

// POST /api/ventas - Procesar nueva venta
router.post('/', ventaController.create);

// PUT /api/ventas/:id/cancelar - Cancelar venta
router.put('/:id/cancelar', ventaController.cancel);

export default router;

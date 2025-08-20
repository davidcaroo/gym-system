import { Router } from 'express';
import { PagoController } from '../controllers/PagoController';

const router = Router();
const pagoController = new PagoController();

// Rutas de pagos (el middleware requireAuth ya se aplica globalmente)
router.post('/', (req, res) => {
  console.log('🚀 Ruta POST /pagos ejecutada');
  console.log('📥 Body recibido:', req.body);
  console.log('📋 Headers:', req.headers);
  try {
    pagoController.createPago(req, res);
  } catch (error) {
    console.error('💥 Error en router:', error);
    res.status(500).json({
      success: false,
      message: 'Error en router',
      error: {
        code: 'ROUTER_ERROR',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }
    });
  }
});
router.get('/', pagoController.getAllPagos);
router.get('/estadisticas', pagoController.getEstadisticasPagos);
router.get('/proximos-vencer', pagoController.getPagosProximosVencer);
router.get('/miembro/:miembro_id', pagoController.getHistorialPagosMiembro);
router.get('/:id', pagoController.getPago);
router.put('/:id/estado', pagoController.updateEstadoPago);
router.post('/renovar-membresia', pagoController.renovarMembresia);
router.post('/marcar-vencidos', pagoController.marcarPagosVencidos);

export default router;

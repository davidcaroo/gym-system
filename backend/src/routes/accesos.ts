import { Router } from 'express';
import { AccesoController } from '../controllers/AccesoController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const accesoController = new AccesoController();

// Rutas públicas para dispositivos de control de acceso
// Validar acceso por documento (público para dispositivos)
router.get('/validar/:documento', accesoController.validarAcceso);

// Registrar entrada (público para dispositivos)
router.post('/entrada', accesoController.registrarEntrada);

// Registrar salida (público para dispositivos)
router.post('/salida', accesoController.registrarSalida);

// Rutas protegidas para administración
// Obtener miembros actualmente dentro
router.get('/dentro', requireAuth, accesoController.getMiembrosActualmenteDentro);

// Obtener historial de accesos con filtros
router.get('/historial', requireAuth, accesoController.getHistorialAccesos);

// Obtener estadísticas de accesos
router.get('/estadisticas', requireAuth, accesoController.getEstadisticasAccesos);

// Verificar estado de acceso de un miembro específico
router.get('/miembro/:miembroId', requireAuth, accesoController.getAccesoActivoPorMiembro);

// Forzar salida de todos los miembros (cierre del gimnasio)
router.post('/forzar-salidas', accesoController.forzarSalidaTodos);

export default router;

import { Router } from 'express';
import { MembresiaController } from '../controllers/MembresiaController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const membresiaController = new MembresiaController();

// Aplicar middleware de autenticación a todas las rutas
router.use(requireAuth);

// GET /api/membresias - Obtener todas las membresías
router.get('/', membresiaController.getAll);

// GET /api/membresias/:id - Obtener membresía por ID
router.get('/:id', membresiaController.getById);

export default router;

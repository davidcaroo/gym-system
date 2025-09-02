import { Router } from 'express';
import { MembresiaController } from '../controllers/MembresiaController';

const router = Router();
const membresiaController = new MembresiaController();

// GET /api/membresias - Obtener todas las membresías
router.get('/', membresiaController.getAll);

// GET /api/membresias/:id - Obtener membresía por ID
router.get('/:id', membresiaController.getById);

// POST /api/membresias - Crear nueva membresía
router.post('/', membresiaController.create);

// PUT /api/membresias/:id - Actualizar membresía
router.put('/:id', membresiaController.update);

// DELETE /api/membresias/:id - Eliminar membresía
router.delete('/:id', membresiaController.delete);

export default router;

import { Router } from 'express';
import { MiembroController } from '../controllers/MiembroController';

const router = Router();
const miembroController = new MiembroController();

// GET /api/miembros - Listar todos los miembros
router.get('/', miembroController.getAll);

// GET /api/miembros/activos - Listar miembros activos
router.get('/activos', miembroController.getActive);

// GET /api/miembros/stats - Estadísticas de miembros
router.get('/stats', miembroController.getStats);

// GET /api/miembros/buscar/:query - Buscar miembros
router.get('/buscar/:query', miembroController.search);

// GET /api/miembros/:id - Obtener miembro por ID
router.get('/:id', miembroController.getById);

// POST /api/miembros - Crear nuevo miembro
router.post('/', miembroController.create);

// PUT /api/miembros/:id - Actualizar miembro
router.put('/:id', miembroController.update);

// DELETE /api/miembros/:id - Eliminar miembro (soft delete)
router.delete('/:id', miembroController.delete);

export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// POST /api/auth/login - Iniciar sesión
router.post('/login', authController.login);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', authController.logout);

// GET /api/auth/verify - Verificar sesión activa
router.get('/verify', authController.verify);

// PUT /api/auth/cambiar-password - Cambiar contraseña
router.put('/cambiar-password', authController.changePassword);

export default router;

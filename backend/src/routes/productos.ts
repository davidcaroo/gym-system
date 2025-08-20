import { Router } from 'express';
import { ProductoController } from '../controllers/ProductoController';

const router = Router();
const productoController = new ProductoController();

// GET /api/productos - Listar todos los productos
router.get('/', productoController.getAll);

// GET /api/productos/stats - Estadísticas de productos
router.get('/stats', productoController.getStats);

// GET /api/productos/stock-bajo - Productos con stock bajo
router.get('/stock-bajo', productoController.getStockBajo);

// GET /api/productos/proximos-vencer - Productos próximos a vencer
router.get('/proximos-vencer', productoController.getProximosAVencer);

// GET /api/productos/categoria/:categoria - Productos por categoría
router.get('/categoria/:categoria', productoController.getByCategoria);

// GET /api/productos/barcode/:barcode - Buscar por código de barras
router.get('/barcode/:barcode', productoController.getByBarcode);

// GET /api/productos/buscar/:query - Buscar productos
router.get('/buscar/:query', productoController.search);

// GET /api/productos/:id - Obtener producto por ID
router.get('/:id', productoController.getById);

// POST /api/productos - Crear nuevo producto
router.post('/', productoController.create);

// PUT /api/productos/:id - Actualizar producto
router.put('/:id', productoController.update);

// PUT /api/productos/:id/stock - Actualizar stock
router.put('/:id/stock', productoController.updateStock);

// DELETE /api/productos/:id - Eliminar producto (soft delete)
router.delete('/:id', productoController.delete);

export default router;

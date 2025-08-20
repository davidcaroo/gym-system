import { Request, Response, NextFunction } from 'express';
import { ProductoModel } from '../models/ProductoModel';
import { createApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Producto } from '../types';
import Joi from 'joi';

// Esquemas de validación
const productoSchema = Joi.object({
  nombre: Joi.string().required().min(2).max(255),
  codigo_barras: Joi.string().optional().max(100),
  descripcion: Joi.string().optional().max(1000),
  categoria: Joi.string().valid('suplementos', 'bebidas', 'accesorios', 'ropa').required(),
  precio_compra: Joi.number().optional().min(0),
  precio_venta: Joi.number().required().min(0),
  stock_actual: Joi.number().optional().min(0).default(0),
  stock_minimo: Joi.number().optional().min(0).default(5),
  fecha_vencimiento: Joi.date().optional().iso(),
  proveedor: Joi.string().optional().max(255)
});

const updateProductoSchema = Joi.object({
  nombre: Joi.string().optional().min(2).max(255),
  codigo_barras: Joi.string().optional().max(100),
  descripcion: Joi.string().optional().max(1000),
  categoria: Joi.string().valid('suplementos', 'bebidas', 'accesorios', 'ropa').optional(),
  precio_compra: Joi.number().optional().min(0),
  precio_venta: Joi.number().optional().min(0),
  stock_actual: Joi.number().optional().min(0),
  stock_minimo: Joi.number().optional().min(0),
  fecha_vencimiento: Joi.date().optional().iso().allow(null),
  proveedor: Joi.string().optional().max(255).allow(null)
});

const stockUpdateSchema = Joi.object({
  cantidad: Joi.number().required().min(1),
  operacion: Joi.string().valid('suma', 'resta').default('suma')
});

export class ProductoController {
  private productoModel = new ProductoModel();

  // Obtener todos los productos
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productos = this.productoModel.getAll();
      res.json({
        success: true,
        data: productos,
        message: `${productos.length} productos encontrados`
      });
    } catch (error) {
      logger.error('Error al obtener productos:', error);
      next(createApiError('Error al obtener productos', 500));
    }
  };

  // Obtener producto por ID
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return next(createApiError('ID de producto inválido', 400, 'INVALID_ID'));
      }

      const producto = this.productoModel.getById(id);
      
      if (!producto) {
        return next(createApiError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: producto
      });
    } catch (error) {
      logger.error('Error al obtener producto:', error);
      next(createApiError('Error al obtener producto', 500));
    }
  };

  // Crear nuevo producto
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = productoSchema.validate(req.body);
      
      if (error) {
        return next(createApiError('Datos de producto inválidos: ' + error.details[0].message, 400, 'INVALID_PRODUCT_DATA'));
      }

      const producto: Omit<Producto, 'id'> = value;

      // Verificar código de barras único si se proporciona
      if (producto.codigo_barras && this.productoModel.existsBarcode(producto.codigo_barras)) {
        return next(createApiError('El código de barras ya existe', 400, 'DUPLICATE_BARCODE'));
      }

      const id = this.productoModel.create(producto);
      const nuevoProducto = this.productoModel.getById(id);

      res.status(201).json({
        success: true,
        data: nuevoProducto,
        message: 'Producto creado exitosamente'
      });

      logger.info(`Producto creado: ${producto.nombre} (ID: ${id})`);
    } catch (error) {
      logger.error('Error al crear producto:', error);
      next(createApiError('Error al crear producto', 500));
    }
  };

  // Actualizar producto
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return next(createApiError('ID de producto inválido', 400, 'INVALID_ID'));
      }

      const { error, value } = updateProductoSchema.validate(req.body);
      
      if (error) {
        return next(createApiError('Datos de producto inválidos: ' + error.details[0].message, 400, 'INVALID_PRODUCT_DATA'));
      }

      // Verificar que el producto existe
      const productoExistente = this.productoModel.getById(id);
      if (!productoExistente) {
        return next(createApiError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND'));
      }

      // Verificar código de barras único si se actualiza
      if (value.codigo_barras && this.productoModel.existsBarcode(value.codigo_barras, id)) {
        return next(createApiError('El código de barras ya existe', 400, 'DUPLICATE_BARCODE'));
      }

      const updated = this.productoModel.update(id, value);
      
      if (!updated) {
        return next(createApiError('No se pudo actualizar el producto', 500, 'UPDATE_FAILED'));
      }

      const productoActualizado = this.productoModel.getById(id);

      res.json({
        success: true,
        data: productoActualizado,
        message: 'Producto actualizado exitosamente'
      });

      logger.info(`Producto actualizado: ID ${id}`);
    } catch (error) {
      logger.error('Error al actualizar producto:', error);
      next(createApiError('Error al actualizar producto', 500));
    }
  };

  // Eliminar producto
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return next(createApiError('ID de producto inválido', 400, 'INVALID_ID'));
      }

      // Verificar que el producto existe
      const producto = this.productoModel.getById(id);
      if (!producto) {
        return next(createApiError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND'));
      }

      const deleted = this.productoModel.delete(id);
      
      if (!deleted) {
        return next(createApiError('No se pudo eliminar el producto', 500, 'DELETE_FAILED'));
      }

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });

      logger.info(`Producto eliminado: ${producto.nombre} (ID: ${id})`);
    } catch (error) {
      logger.error('Error al eliminar producto:', error);
      next(createApiError('Error al eliminar producto', 500));
    }
  };

  // Buscar productos
  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.params.query;
      
      if (!query || query.trim().length < 2) {
        return next(createApiError('La búsqueda debe tener al menos 2 caracteres', 400, 'INVALID_SEARCH_QUERY'));
      }

      const productos = this.productoModel.search(query.trim());

      res.json({
        success: true,
        data: productos,
        message: `${productos.length} productos encontrados para "${query}"`
      });
    } catch (error) {
      logger.error('Error al buscar productos:', error);
      next(createApiError('Error al buscar productos', 500));
    }
  };

  // Productos con stock bajo
  getStockBajo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productos = this.productoModel.getStockBajo();

      res.json({
        success: true,
        data: productos,
        message: `${productos.length} productos con stock bajo`
      });
    } catch (error) {
      logger.error('Error al obtener productos con stock bajo:', error);
      next(createApiError('Error al obtener productos con stock bajo', 500));
    }
  };

  // Productos por categoría
  getByCategoria = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categoria = req.params.categoria;
      
      const categoriasValidas = ['suplementos', 'bebidas', 'accesorios', 'ropa'];
      if (!categoriasValidas.includes(categoria)) {
        return next(createApiError('Categoría inválida', 400, 'INVALID_CATEGORY'));
      }

      const productos = this.productoModel.getByCategoria(categoria);

      res.json({
        success: true,
        data: productos,
        message: `Productos de categoría "${categoria}"`
      });
    } catch (error) {
      logger.error('Error al obtener productos por categoría:', error);
      next(createApiError('Error al obtener productos por categoría', 500));
    }
  };

  // Productos próximos a vencer
  getProximosAVencer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productos = this.productoModel.getProximosAVencer();

      res.json({
        success: true,
        data: productos,
        message: `${productos.length} productos próximos a vencer`
      });
    } catch (error) {
      logger.error('Error al obtener productos próximos a vencer:', error);
      next(createApiError('Error al obtener productos próximos a vencer', 500));
    }
  };

  // Actualizar stock
  updateStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return next(createApiError('ID de producto inválido', 400, 'INVALID_ID'));
      }

      const { error, value } = stockUpdateSchema.validate(req.body);
      
      if (error) {
        return next(createApiError('Datos de stock inválidos: ' + error.details[0].message, 400, 'INVALID_STOCK_DATA'));
      }

      // Verificar que el producto existe
      const producto = this.productoModel.getById(id);
      if (!producto) {
        return next(createApiError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND'));
      }

      // Verificar que no se deje el stock en negativo
      if (value.operacion === 'resta' && producto.stock_actual! < value.cantidad) {
        return next(createApiError('Stock insuficiente', 400, 'INSUFFICIENT_STOCK'));
      }

      const updated = this.productoModel.updateStock(id, value.cantidad, value.operacion);
      
      if (!updated) {
        return next(createApiError('No se pudo actualizar el stock', 500, 'STOCK_UPDATE_FAILED'));
      }

      const productoActualizado = this.productoModel.getById(id);

      res.json({
        success: true,
        data: productoActualizado,
        message: `Stock ${value.operacion === 'suma' ? 'aumentado' : 'reducido'} exitosamente`
      });

      logger.info(`Stock actualizado para producto ID ${id}: ${value.operacion} ${value.cantidad}`);
    } catch (error) {
      logger.error('Error al actualizar stock:', error);
      next(createApiError('Error al actualizar stock', 500));
    }
  };

  // Obtener estadísticas
  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = this.productoModel.getStats();

      res.json({
        success: true,
        data: stats,
        message: 'Estadísticas de productos obtenidas'
      });
    } catch (error) {
      logger.error('Error al obtener estadísticas de productos:', error);
      next(createApiError('Error al obtener estadísticas de productos', 500));
    }
  };

  // Buscar por código de barras
  getByBarcode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const codigoBarras = req.params.barcode;
      
      if (!codigoBarras || codigoBarras.trim().length === 0) {
        return next(createApiError('Código de barras requerido', 400, 'BARCODE_REQUIRED'));
      }

      const producto = this.productoModel.getByBarcode(codigoBarras.trim());
      
      if (!producto) {
        return next(createApiError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: producto
      });
    } catch (error) {
      logger.error('Error al buscar producto por código de barras:', error);
      next(createApiError('Error al buscar producto por código de barras', 500));
    }
  };
}

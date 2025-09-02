import Database from 'better-sqlite3';
import { getDatabase } from '../database/connection';
import { Producto } from '../types';

export class ProductoModel {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  // Obtener todos los productos
  getAll(): Producto[] {
    return this.db.prepare(`
      SELECT * FROM productos 
      WHERE activo = 1 
      ORDER BY categoria, nombre
    `).all() as Producto[];
  }

  // Obtener producto por ID
  getById(id: number): Producto | undefined {
    return this.db.prepare(`
      SELECT * FROM productos 
      WHERE id = ? AND activo = 1
    `).get(id) as Producto | undefined;
  }

  // Obtener producto por código de barras
  getByBarcode(codigoBarras: string): Producto | undefined {
    return this.db.prepare(`
      SELECT * FROM productos 
      WHERE codigo_barras = ? AND activo = 1
    `).get(codigoBarras) as Producto | undefined;
  }

  // Crear nuevo producto
  create(producto: Omit<Producto, 'id'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO productos (
        nombre, codigo_barras, descripcion, categoria, 
        precio_compra, precio_venta, stock_actual, stock_minimo,
        fecha_vencimiento, proveedor, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Log para debug
    console.log('Datos para insertar:', {
      nombre: producto.nombre,
      codigo_barras: producto.codigo_barras,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precio_compra: producto.precio_compra,
      precio_venta: producto.precio_venta,
      stock_actual: producto.stock_actual,
      stock_minimo: producto.stock_minimo,
      fecha_vencimiento: producto.fecha_vencimiento,
      proveedor: producto.proveedor
    });

    const result = stmt.run(
      producto.nombre,
      producto.codigo_barras || null,
      producto.descripcion || null,
      producto.categoria,
      producto.precio_compra || null,
      producto.precio_venta,
      Number(producto.stock_actual || 0),
      Number(producto.stock_minimo || 5),
      producto.fecha_vencimiento || null,
      producto.proveedor || null,
      1 // activo
    );

    return result.lastInsertRowid as number;
  }

  // Actualizar producto
  update(id: number, producto: Partial<Producto>): boolean {
    const stmt = this.db.prepare(`
      UPDATE productos SET
        nombre = COALESCE(?, nombre),
        codigo_barras = COALESCE(?, codigo_barras),
        descripcion = COALESCE(?, descripcion),
        categoria = COALESCE(?, categoria),
        precio_compra = COALESCE(?, precio_compra),
        precio_venta = COALESCE(?, precio_venta),
        stock_actual = COALESCE(?, stock_actual),
        stock_minimo = COALESCE(?, stock_minimo),
        fecha_vencimiento = COALESCE(?, fecha_vencimiento),
        proveedor = COALESCE(?, proveedor)
      WHERE id = ? AND activo = 1
    `);

    const result = stmt.run(
      producto.nombre || null,
      producto.codigo_barras || null,
      producto.descripcion || null,
      producto.categoria || null,
      producto.precio_compra || null,
      producto.precio_venta || null,
      producto.stock_actual || null,
      producto.stock_minimo || null,
      producto.fecha_vencimiento || null,
      producto.proveedor || null,
      id
    );

    return result.changes > 0;
  }

  // Eliminar producto (soft delete)
  delete(id: number): boolean {
    const stmt = this.db.prepare(`
      UPDATE productos SET activo = 0 WHERE id = ?
    `);

    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Actualizar stock
  updateStock(id: number, cantidad: number, operacion: 'suma' | 'resta' = 'suma'): boolean {
    const operador = operacion === 'suma' ? '+' : '-';
    
    const stmt = this.db.prepare(`
      UPDATE productos 
      SET stock_actual = stock_actual ${operador} ?
      WHERE id = ? AND activo = 1
    `);

    const result = stmt.run(cantidad, id);
    return result.changes > 0;
  }

  // Buscar productos
  search(query: string): Producto[] {
    return this.db.prepare(`
      SELECT * FROM productos 
      WHERE activo = 1 
      AND (
        nombre LIKE ? OR 
        descripcion LIKE ? OR 
        codigo_barras LIKE ? OR
        categoria LIKE ?
      )
      ORDER BY nombre
    `).all(
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`
    ) as Producto[];
  }

  // Productos con stock bajo
  getStockBajo(): Producto[] {
    return this.db.prepare(`
      SELECT * FROM productos 
      WHERE activo = 1 
      AND stock_actual <= stock_minimo
      ORDER BY stock_actual ASC
    `).all() as Producto[];
  }

  // Productos por categoría
  getByCategoria(categoria: string): Producto[] {
    return this.db.prepare(`
      SELECT * FROM productos 
      WHERE categoria = ? AND activo = 1 
      ORDER BY nombre
    `).all(categoria) as Producto[];
  }

  // Productos próximos a vencer (dentro de 30 días)
  getProximosAVencer(): Producto[] {
    return this.db.prepare(`
      SELECT * FROM productos 
      WHERE activo = 1 
      AND fecha_vencimiento IS NOT NULL
      AND fecha_vencimiento <= DATE('now', '+30 days')
      ORDER BY fecha_vencimiento ASC
    `).all() as Producto[];
  }

  // Estadísticas de productos
  getStats(): {
    total_productos: number;
    stock_bajo: number;
    por_categoria: { categoria: string; cantidad: number }[];
    valor_inventario: number;
  } {
    const totalProductos = this.db.prepare(`
      SELECT COUNT(*) as count FROM productos WHERE activo = 1
    `).get() as { count: number };

    const stockBajo = this.db.prepare(`
      SELECT COUNT(*) as count FROM productos 
      WHERE activo = 1 AND stock_actual <= stock_minimo
    `).get() as { count: number };

    const porCategoria = this.db.prepare(`
      SELECT categoria, COUNT(*) as cantidad 
      FROM productos 
      WHERE activo = 1 
      GROUP BY categoria
    `).all() as { categoria: string; cantidad: number }[];

    const valorInventario = this.db.prepare(`
      SELECT COALESCE(SUM(precio_compra * stock_actual), 0) as valor
      FROM productos 
      WHERE activo = 1 AND precio_compra IS NOT NULL
    `).get() as { valor: number };

    return {
      total_productos: totalProductos.count,
      stock_bajo: stockBajo.count,
      por_categoria: porCategoria,
      valor_inventario: valorInventario.valor
    };
  }

  // Verificar si el código de barras ya existe
  existsBarcode(codigoBarras: string, excludeId?: number): boolean {
    let query = `SELECT id FROM productos WHERE codigo_barras = ? AND activo = 1`;
    let params: any[] = [codigoBarras];

    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }

    const result = this.db.prepare(query).get(...params);
    return !!result;
  }
}

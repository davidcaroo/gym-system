import Database from 'better-sqlite3';
import { getDatabase } from '../database/connection';
import { Venta, DetalleVenta, Producto } from '../types';

export class VentaModel {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  // Obtener todas las ventas con información del miembro
  getAll(): (Venta & { miembro_nombre?: string; items_count?: number })[] {
    return this.db.prepare(`
      SELECT v.*, 
             m.nombre as miembro_nombre,
             COUNT(dv.id) as items_count
      FROM ventas v
      LEFT JOIN miembros m ON v.miembro_id = m.id
      LEFT JOIN detalle_ventas dv ON v.id = dv.venta_id
      GROUP BY v.id
      ORDER BY v.fecha_venta DESC
    `).all() as (Venta & { miembro_nombre?: string; items_count?: number })[];
  }

  // Obtener venta por ID con detalles completos
  getById(id: number): (Venta & { 
    miembro_nombre?: string; 
    detalles?: (DetalleVenta & { producto_nombre?: string; producto_categoria?: string })[] 
  }) | undefined {
    const venta = this.db.prepare(`
      SELECT v.*, m.nombre as miembro_nombre
      FROM ventas v
      LEFT JOIN miembros m ON v.miembro_id = m.id
      WHERE v.id = ?
    `).get(id) as (Venta & { miembro_nombre?: string }) | undefined;

    if (!venta) return undefined;

    // Obtener detalles de la venta
    const detalles = this.db.prepare(`
      SELECT dv.*, p.nombre as producto_nombre, p.categoria as producto_categoria
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = ?
      ORDER BY dv.id
    `).all(id) as (DetalleVenta & { producto_nombre?: string; producto_categoria?: string })[];

    return { ...venta, detalles };
  }

  // Crear nueva venta (transacción completa)
  create(ventaData: {
    miembro_id?: number;
    subtotal: number;
    descuento?: number;
    total: number;
    metodo_pago?: 'efectivo' | 'tarjeta' | 'cuenta_miembro';
    notas?: string;
    items: {
      producto_id: number;
      cantidad: number;
      precio_unitario: number;
    }[];
  }): number {
    return this.db.transaction(() => {
      // 1. Verificar stock disponible para todos los productos
      for (const item of ventaData.items) {
        const producto = this.db.prepare(`
          SELECT stock_actual FROM productos WHERE id = ? AND activo = 1
        `).get(item.producto_id) as { stock_actual: number } | undefined;

        if (!producto) {
          throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
        }

        if (producto.stock_actual < item.cantidad) {
          throw new Error(`Stock insuficiente para producto ID ${item.producto_id}. Stock disponible: ${producto.stock_actual}, requerido: ${item.cantidad}`);
        }
      }

      // 2. Crear la venta
      const ventaStmt = this.db.prepare(`
        INSERT INTO ventas (miembro_id, subtotal, descuento, total, metodo_pago, notas)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const ventaResult = ventaStmt.run(
        ventaData.miembro_id || null,
        ventaData.subtotal,
        ventaData.descuento || 0,
        ventaData.total,
        ventaData.metodo_pago || 'efectivo',
        ventaData.notas || null
      );

      const ventaId = ventaResult.lastInsertRowid as number;

      // 3. Insertar detalles de venta y actualizar stock
      const detalleStmt = this.db.prepare(`
        INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);

      const stockStmt = this.db.prepare(`
        UPDATE productos 
        SET stock_actual = stock_actual - ?
        WHERE id = ?
      `);

      for (const item of ventaData.items) {
        const subtotalItem = item.cantidad * item.precio_unitario;
        
        // Insertar detalle
        detalleStmt.run(
          ventaId,
          item.producto_id,
          item.cantidad,
          item.precio_unitario,
          subtotalItem
        );

        // Reducir stock
        stockStmt.run(item.cantidad, item.producto_id);
      }

      return ventaId;
    })();
  }

  // Cancelar venta (restaurar stock)
  cancel(id: number): boolean {
    return this.db.transaction(() => {
      // 1. Verificar que la venta existe y no está cancelada
      const venta = this.db.prepare(`
        SELECT estado FROM ventas WHERE id = ?
      `).get(id) as { estado: string } | undefined;

      if (!venta) {
        throw new Error('Venta no encontrada');
      }

      if (venta.estado === 'cancelada') {
        throw new Error('La venta ya está cancelada');
      }

      // 2. Obtener detalles de la venta
      const detalles = this.db.prepare(`
        SELECT producto_id, cantidad FROM detalle_ventas WHERE venta_id = ?
      `).all(id) as { producto_id: number; cantidad: number }[];

      // 3. Restaurar stock
      const stockStmt = this.db.prepare(`
        UPDATE productos 
        SET stock_actual = stock_actual + ?
        WHERE id = ?
      `);

      for (const detalle of detalles) {
        stockStmt.run(detalle.cantidad, detalle.producto_id);
      }

      // 4. Marcar venta como cancelada
      const cancelStmt = this.db.prepare(`
        UPDATE ventas SET estado = 'cancelada' WHERE id = ?
      `);

      const result = cancelStmt.run(id);
      return result.changes > 0;
    })();
  }

  // Obtener ventas por fecha
  getByDate(fecha: string): Venta[] {
    return this.db.prepare(`
      SELECT v.*, m.nombre as miembro_nombre
      FROM ventas v
      LEFT JOIN miembros m ON v.miembro_id = m.id
      WHERE DATE(v.fecha_venta) = ?
      ORDER BY v.fecha_venta DESC
    `).all(fecha) as Venta[];
  }

  // Obtener ventas por rango de fechas
  getByDateRange(fechaInicio: string, fechaFin: string): Venta[] {
    return this.db.prepare(`
      SELECT v.*, m.nombre as miembro_nombre
      FROM ventas v
      LEFT JOIN miembros m ON v.miembro_id = m.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      ORDER BY v.fecha_venta DESC
    `).all(fechaInicio, fechaFin) as Venta[];
  }

  // Obtener ventas de un miembro
  getByMiembro(miembroId: number): Venta[] {
    return this.db.prepare(`
      SELECT v.*, m.nombre as miembro_nombre
      FROM ventas v
      LEFT JOIN miembros m ON v.miembro_id = m.id
      WHERE v.miembro_id = ?
      ORDER BY v.fecha_venta DESC
    `).all(miembroId) as Venta[];
  }

  // Estadísticas de ventas
  getStats(fecha?: string): {
    total_ventas: number;
    total_ingresos: number;
    venta_promedio: number;
    productos_vendidos: number;
    ventas_por_metodo: { metodo_pago: string; cantidad: number; total: number }[];
    productos_mas_vendidos: { producto_nombre: string; cantidad_vendida: number; ingresos: number }[];
  } {
    let whereClause = "WHERE v.estado = 'completada'";
    let params: any[] = [];

    if (fecha) {
      whereClause += " AND DATE(v.fecha_venta) = ?";
      params.push(fecha);
    }

    // Estadísticas generales
    const generalStats = this.db.prepare(`
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as total_ingresos,
        COALESCE(AVG(total), 0) as venta_promedio
      FROM ventas v
      ${whereClause}
    `).get(...params) as { total_ventas: number; total_ingresos: number; venta_promedio: number };

    // Total de productos vendidos
    const productosVendidos = this.db.prepare(`
      SELECT COALESCE(SUM(dv.cantidad), 0) as productos_vendidos
      FROM detalle_ventas dv
      JOIN ventas v ON dv.venta_id = v.id
      ${whereClause}
    `).get(...params) as { productos_vendidos: number };

    // Ventas por método de pago
    const ventasPorMetodo = this.db.prepare(`
      SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas v
      ${whereClause}
      GROUP BY metodo_pago
    `).all(...params) as { metodo_pago: string; cantidad: number; total: number }[];

    // Productos más vendidos
    const productosMasVendidos = this.db.prepare(`
      SELECT 
        p.nombre as producto_nombre,
        SUM(dv.cantidad) as cantidad_vendida,
        SUM(dv.subtotal) as ingresos
      FROM detalle_ventas dv
      JOIN ventas v ON dv.venta_id = v.id
      JOIN productos p ON dv.producto_id = p.id
      ${whereClause}
      GROUP BY dv.producto_id, p.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `).all(...params) as { producto_nombre: string; cantidad_vendida: number; ingresos: number }[];

    return {
      ...generalStats,
      productos_vendidos: productosVendidos.productos_vendidos,
      ventas_por_metodo: ventasPorMetodo,
      productos_mas_vendidos: productosMasVendidos
    };
  }

  // Reporte de ventas del día
  getReporteDiario(fecha?: string): {
    fecha: string;
    total_ventas: number;
    total_ingresos: number;
    productos_vendidos: number;
    venta_promedio: number;
    ventas_por_hora: { hora: string; ventas: number; ingresos: number }[];
  } {
    const fechaReporte = fecha || new Date().toISOString().split('T')[0];

    const stats = this.getStats(fechaReporte);

    // Ventas por hora
    const ventasPorHora = this.db.prepare(`
      SELECT 
        PRINTF('%02d:00', CAST(strftime('%H', fecha_venta) AS INTEGER)) as hora,
        COUNT(*) as ventas,
        COALESCE(SUM(total), 0) as ingresos
      FROM ventas
      WHERE DATE(fecha_venta) = ? AND estado = 'completada'
      GROUP BY CAST(strftime('%H', fecha_venta) AS INTEGER)
      ORDER BY hora
    `).all(fechaReporte) as { hora: string; ventas: number; ingresos: number }[];

    return {
      fecha: fechaReporte,
      total_ventas: stats.total_ventas,
      total_ingresos: stats.total_ingresos,
      productos_vendidos: stats.productos_vendidos,
      venta_promedio: stats.venta_promedio,
      ventas_por_hora: ventasPorHora
    };
  }

  // Buscar ventas
  search(query: string): Venta[] {
    return this.db.prepare(`
      SELECT DISTINCT v.*, m.nombre as miembro_nombre
      FROM ventas v
      LEFT JOIN miembros m ON v.miembro_id = m.id
      LEFT JOIN detalle_ventas dv ON v.id = dv.venta_id
      LEFT JOIN productos p ON dv.producto_id = p.id
      WHERE 
        v.id LIKE ? OR
        m.nombre LIKE ? OR
        p.nombre LIKE ? OR
        v.notas LIKE ?
      ORDER BY v.fecha_venta DESC
    `).all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`) as Venta[];
  }

  // Validar datos de venta antes de crear
  validateVentaData(ventaData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!ventaData.items || !Array.isArray(ventaData.items) || ventaData.items.length === 0) {
      errors.push('La venta debe incluir al menos un producto');
    }

    if (ventaData.total <= 0) {
      errors.push('El total de la venta debe ser mayor a 0');
    }

    if (ventaData.subtotal <= 0) {
      errors.push('El subtotal debe ser mayor a 0');
    }

    if (ventaData.descuento && ventaData.descuento < 0) {
      errors.push('El descuento no puede ser negativo');
    }

    if (ventaData.items) {
      for (let i = 0; i < ventaData.items.length; i++) {
        const item = ventaData.items[i];
        
        if (!item.producto_id || item.producto_id <= 0) {
          errors.push(`Item ${i + 1}: ID de producto inválido`);
        }
        
        if (!item.cantidad || item.cantidad <= 0) {
          errors.push(`Item ${i + 1}: Cantidad debe ser mayor a 0`);
        }
        
        if (!item.precio_unitario || item.precio_unitario <= 0) {
          errors.push(`Item ${i + 1}: Precio unitario debe ser mayor a 0`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

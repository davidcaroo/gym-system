import { getDatabase } from '../database/connection';
import { logger } from '../utils/logger';
import { Pago, TipoMembresia } from '../types';

export class PagoModel {
  private db = getDatabase();

  // Crear un nuevo pago
  async createPago(pago: Omit<Pago, 'id' | 'fecha_pago'>): Promise<Pago> {
    try {
      console.log('🔄 NUEVO MODELO - Creando pago con datos:', JSON.stringify(pago, null, 2));
      
      // Preparar datos con tipos explícitos y seguros
      const miembroId = parseInt(String(pago.miembro_id));
      const monto = parseFloat(String(pago.monto));
      const fechaVencimiento = pago.fecha_vencimiento ? String(pago.fecha_vencimiento) : null;
      const concepto = pago.concepto ? String(pago.concepto) : null;
      const metodoPago = pago.metodo_pago ? String(pago.metodo_pago) : 'efectivo';
      const estado = pago.estado ? String(pago.estado) : 'pagado';
      const notas = pago.notas ? String(pago.notas) : null;

      console.log('🔄 NUEVO MODELO - Datos procesados:', {
        miembroId,
        monto,
        fechaVencimiento,
        concepto,
        metodoPago,
        estado,
        notas
      });
      
      const stmt = this.db.prepare(`
        INSERT INTO pagos (miembro_id, monto, fecha_vencimiento, concepto, metodo_pago, estado, notas)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      console.log('✅ NUEVO MODELO - Query preparado, ejecutando...');

      const result = stmt.run(miembroId, monto, fechaVencimiento, concepto, metodoPago, estado, notas);

      console.log('✅ NUEVO MODELO - Insert exitoso, ID:', result.lastInsertRowid);
      
      // Crear el objeto de respuesta manualmente
      const nuevoPago: Pago = {
        id: result.lastInsertRowid as number,
        miembro_id: miembroId,
        monto: monto,
        fecha_pago: new Date().toISOString(),
        fecha_vencimiento: fechaVencimiento || undefined,
        concepto: concepto || undefined,
        metodo_pago: metodoPago as any,
        estado: estado as any,
        notas: notas || undefined
      };

      logger.info(`Pago creado exitosamente: ID ${nuevoPago.id}`);
      return nuevoPago;
    } catch (error) {
      console.error('💥 NUEVO MODELO - Error detallado:', error);
      logger.error('Error al crear pago:', error);
      throw error;
    }
  }

  // Obtener pago por ID
  async getPagoById(id: number): Promise<Pago | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT p.*, m.nombre as nombre_miembro, m.email as email_miembro
        FROM pagos p
        LEFT JOIN miembros m ON p.miembro_id = m.id
        WHERE p.id = ?
      `);

      const row = stmt.get(id) as any;
      
      if (row) {
        return {
          id: row.id,
          miembro_id: row.miembro_id,
          monto: parseFloat(row.monto),
          fecha_pago: row.fecha_pago,
          fecha_vencimiento: row.fecha_vencimiento,
          concepto: row.concepto,
          metodo_pago: row.metodo_pago,
          estado: row.estado,
          notas: row.notas,
          nombre_miembro: row.nombre_miembro,
          email_miembro: row.email_miembro
        };
      }
      
      return null;
    } catch (error) {
      logger.error('Error al obtener pago:', error);
      throw error;
    }
  }

  // Obtener todos los pagos con filtros opcionales
  async getAllPagos(filtros?: {
    miembro_id?: number;
    estado?: string;
    metodo_pago?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    limite?: number;
    offset?: number;
  }): Promise<{pagos: Pago[], total: number}> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (filtros?.miembro_id) {
        whereClause += ' AND p.miembro_id = ?';
        params.push(filtros.miembro_id);
      }

      if (filtros?.estado) {
        whereClause += ' AND p.estado = ?';
        params.push(filtros.estado);
      }

      if (filtros?.metodo_pago) {
        whereClause += ' AND p.metodo_pago = ?';
        params.push(filtros.metodo_pago);
      }

      if (filtros?.fecha_desde) {
        whereClause += ' AND DATE(p.fecha_pago) >= ?';
        params.push(filtros.fecha_desde);
      }

      if (filtros?.fecha_hasta) {
        whereClause += ' AND DATE(p.fecha_pago) <= ?';
        params.push(filtros.fecha_hasta);
      }

      // Contar total
      const countStmt = this.db.prepare(`
        SELECT COUNT(*) as total
        FROM pagos p
        ${whereClause}
      `);
      const totalResult = countStmt.get(...params) as { total: number };

      // Obtener pagos paginados
      let query = `
        SELECT p.*, m.nombre as nombre_miembro, m.email as email_miembro,
               tm.nombre as tipo_membresia
        FROM pagos p
        LEFT JOIN miembros m ON p.miembro_id = m.id
        LEFT JOIN tipos_membresia tm ON m.tipo_membresia_id = tm.id
        ${whereClause}
        ORDER BY p.fecha_pago DESC
      `;

      if (filtros?.limite) {
        query += ' LIMIT ?';
        params.push(filtros.limite);
        
        if (filtros?.offset) {
          query += ' OFFSET ?';
          params.push(filtros.offset);
        }
      }

      const stmt = this.db.prepare(query);
      const rows = stmt.all(...params) as any[];

      const pagos = rows.map(row => ({
        id: row.id,
        miembro_id: row.miembro_id,
        monto: parseFloat(row.monto),
        fecha_pago: row.fecha_pago,
        fecha_vencimiento: row.fecha_vencimiento,
        concepto: row.concepto,
        metodo_pago: row.metodo_pago,
        estado: row.estado,
        notas: row.notas,
        nombre_miembro: row.nombre_miembro,
        email_miembro: row.email_miembro,
        tipo_membresia: row.tipo_membresia
      }));

      return {
        pagos,
        total: totalResult.total
      };
    } catch (error) {
      logger.error('Error al obtener pagos:', error);
      throw error;
    }
  }

  // Actualizar estado de pago
  async updateEstadoPago(id: number, estado: string, notas?: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare(`
        UPDATE pagos 
        SET estado = ?, notas = ?
        WHERE id = ?
      `);

      const result = stmt.run(estado, notas || null, id);
      
      if (result.changes > 0) {
        logger.info(`Estado de pago actualizado: ID ${id} -> ${estado}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error al actualizar estado de pago:', error);
      throw error;
    }
  }

  // Renovar membresía (crear nuevo pago)
  async renovarMembresia(miembro_id: number, tipo_membresia_id: number): Promise<Pago> {
    try {
      // Obtener información del tipo de membresía
      const tipoStmt = this.db.prepare(`
        SELECT * FROM tipos_membresia WHERE id = ?
      `);
      const tipoMembresia = tipoStmt.get(tipo_membresia_id) as TipoMembresia;
      
      if (!tipoMembresia) {
        throw new Error('Tipo de membresía no encontrado');
      }

      // Calcular fecha de vencimiento
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + tipoMembresia.duracion_dias);

      // Crear el pago
      const nuevoPago = await this.createPago({
        miembro_id,
        monto: tipoMembresia.precio,
        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
        concepto: `Renovación - ${tipoMembresia.nombre}`,
        metodo_pago: 'efectivo',
        estado: 'pagado'
      });

      // Actualizar el tipo de membresía del miembro si es diferente
      const updateMiembroStmt = this.db.prepare(`
        UPDATE miembros 
        SET tipo_membresia_id = ? 
        WHERE id = ?
      `);
      updateMiembroStmt.run(tipo_membresia_id, miembro_id);

      logger.info(`Membresía renovada para miembro ${miembro_id}`);
      return nuevoPago;
    } catch (error) {
      logger.error('Error al renovar membresía:', error);
      throw error;
    }
  }

  // Obtener pagos próximos a vencer
  async getPagosProximosVencer(dias: number = 7): Promise<Pago[]> {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + dias);

      const stmt = this.db.prepare(`
        SELECT p.*, m.nombre as nombre_miembro, m.email as email_miembro,
               m.telefono as telefono_miembro
        FROM pagos p
        INNER JOIN miembros m ON p.miembro_id = m.id
        WHERE p.estado = 'pagado' 
        AND DATE(p.fecha_vencimiento) <= DATE(?)
        AND DATE(p.fecha_vencimiento) >= DATE('now')
        ORDER BY p.fecha_vencimiento ASC
      `);

      const rows = stmt.all(fechaLimite.toISOString().split('T')[0]) as any[];

      return rows.map(row => ({
        id: row.id,
        miembro_id: row.miembro_id,
        monto: parseFloat(row.monto),
        fecha_pago: row.fecha_pago,
        fecha_vencimiento: row.fecha_vencimiento,
        concepto: row.concepto,
        metodo_pago: row.metodo_pago,
        estado: row.estado,
        notas: row.notas,
        nombre_miembro: row.nombre_miembro,
        email_miembro: row.email_miembro,
        telefono_miembro: row.telefono_miembro
      }));
    } catch (error) {
      logger.error('Error al obtener pagos próximos a vencer:', error);
      throw error;
    }
  }

  // Obtener estadísticas de pagos
  async getEstadisticasPagos(fecha_desde?: string, fecha_hasta?: string): Promise<any> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (fecha_desde) {
        whereClause += ' AND DATE(fecha_pago) >= ?';
        params.push(fecha_desde);
      }

      if (fecha_hasta) {
        whereClause += ' AND DATE(fecha_pago) <= ?';
        params.push(fecha_hasta);
      }

      // Total de ingresos por estado
      const ingresosPorEstado = this.db.prepare(`
        SELECT estado, 
               COUNT(*) as cantidad,
               SUM(monto) as total
        FROM pagos 
        ${whereClause}
        GROUP BY estado
      `).all(...params);

      // Total de ingresos por método de pago
      const ingresosPorMetodo = this.db.prepare(`
        SELECT metodo_pago, 
               COUNT(*) as cantidad,
               SUM(monto) as total
        FROM pagos 
        ${whereClause}
        GROUP BY metodo_pago
      `).all(...params);

      // Resumen general
      const resumen = this.db.prepare(`
        SELECT 
          COUNT(*) as total_pagos,
          SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END) as ingresos_confirmados,
          SUM(CASE WHEN estado = 'pendiente' THEN monto ELSE 0 END) as ingresos_pendientes,
          SUM(CASE WHEN estado = 'vencido' THEN monto ELSE 0 END) as ingresos_vencidos,
          AVG(CASE WHEN estado = 'pagado' THEN monto ELSE NULL END) as pago_promedio
        FROM pagos 
        ${whereClause}
      `).get(...params) as any;

      return {
        resumen: {
          total_pagos: resumen?.total_pagos || 0,
          ingresos_confirmados: parseFloat(resumen?.ingresos_confirmados || 0),
          ingresos_pendientes: parseFloat(resumen?.ingresos_pendientes || 0),
          ingresos_vencidos: parseFloat(resumen?.ingresos_vencidos || 0),
          pago_promedio: parseFloat(resumen?.pago_promedio || 0)
        },
        por_estado: (ingresosPorEstado as any[]).map((item: any) => ({
          estado: item.estado,
          cantidad: item.cantidad,
          total: parseFloat(item.total || 0)
        })),
        por_metodo: (ingresosPorMetodo as any[]).map((item: any) => ({
          metodo_pago: item.metodo_pago,
          cantidad: item.cantidad,
          total: parseFloat(item.total || 0)
        }))
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas de pagos:', error);
      throw error;
    }
  }

  // Marcar pagos vencidos
  async marcarPagosVencidos(): Promise<number> {
    try {
      const stmt = this.db.prepare(`
        UPDATE pagos 
        SET estado = 'vencido'
        WHERE estado = 'pagado' 
        AND DATE(fecha_vencimiento) < DATE('now')
      `);

      const result = stmt.run();
      
      if (result.changes > 0) {
        logger.info(`${result.changes} pagos marcados como vencidos`);
      }
      
      return result.changes;
    } catch (error) {
      logger.error('Error al marcar pagos vencidos:', error);
      throw error;
    }
  }

  // Obtener historial de pagos de un miembro
  async getHistorialPagosMiembro(miembro_id: number): Promise<Pago[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT p.*, tm.nombre as tipo_membresia
        FROM pagos p
        LEFT JOIN miembros m ON p.miembro_id = m.id
        LEFT JOIN tipos_membresia tm ON m.tipo_membresia_id = tm.id
        WHERE p.miembro_id = ?
        ORDER BY p.fecha_pago DESC
      `);

      const rows = stmt.all(miembro_id) as any[];

      return rows.map(row => ({
        id: row.id,
        miembro_id: row.miembro_id,
        monto: parseFloat(row.monto),
        fecha_pago: row.fecha_pago,
        fecha_vencimiento: row.fecha_vencimiento,
        concepto: row.concepto,
        metodo_pago: row.metodo_pago,
        estado: row.estado,
        notas: row.notas,
        tipo_membresia: row.tipo_membresia
      }));
    } catch (error) {
      logger.error('Error al obtener historial de pagos:', error);
      throw error;
    }
  }
}

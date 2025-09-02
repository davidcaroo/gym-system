import { Database } from 'better-sqlite3';
import { getDatabase } from '../database/connection';
import { logger } from '../utils/logger';
import { Acceso, EstadisticasAcceso, ValidacionAcceso, Miembro, Pago } from '../types';

export class AccesoModel {
  private db: Database;

  constructor() {
    this.db = getDatabase();
  }

  // Validar si un miembro puede acceder al gimnasio
  async validarAcceso(documento: string): Promise<ValidacionAcceso> {
    try {
      // Buscar miembro por documento
      const miembro = this.db.prepare(`
        SELECT m.*, tm.nombre as tipo_membresia, tm.duracion_dias
        FROM miembros m
        LEFT JOIN tipos_membresia tm ON m.tipo_membresia_id = tm.id
        WHERE m.documento = ? AND m.estado = 'activo'
      `).get(documento) as Miembro & { tipo_membresia: string; duracion_dias: number };

      if (!miembro) {
        return {
          permitido: false,
          motivo: 'Miembro no encontrado o inactivo'
        };
      }

      // Verificar si tiene membresía activa
      const ultimoPago = this.db.prepare(`
        SELECT * FROM pagos 
        WHERE miembro_id = ? AND estado = 'pagado'
        ORDER BY fecha_vencimiento DESC
        LIMIT 1
      `).get(miembro.id) as Pago;

      if (!ultimoPago) {
        return {
          permitido: false,
          motivo: 'No tiene pagos registrados',
          miembro
        };
      }

      // Verificar si la membresía está vigente
      const fechaActual = new Date();
      const fechaVencimiento = new Date(ultimoPago.fecha_vencimiento || '');
      const membresiaVencida = fechaVencimiento < fechaActual;

      if (membresiaVencida) {
        return {
          permitido: false,
          motivo: `Membresía vencida el ${fechaVencimiento.toLocaleDateString()}`,
          miembro,
          ultimo_pago: ultimoPago,
          membresia_vencida: true,
          membresia_activa: false
        };
      }

      return {
        permitido: true,
        motivo: 'Acceso autorizado',
        miembro,
        ultimo_pago: ultimoPago,
        membresia_vencida: false,
        membresia_activa: true
      };
    } catch (error) {
      logger.error('Error al validar acceso:', error);
      throw error;
    }
  }

  // Registrar entrada de un miembro
  async registrarEntrada(miembroId: number): Promise<Acceso> {
    try {
      // Verificar si ya está dentro (sin salida registrada)
      const accesoActivo = this.db.prepare(`
        SELECT * FROM accesos 
        WHERE miembro_id = ? AND fecha_salida IS NULL
        ORDER BY fecha_entrada DESC
        LIMIT 1
      `).get(miembroId);

      if (accesoActivo) {
        throw new Error('El miembro ya se encuentra dentro del gimnasio');
      }

      const stmt = this.db.prepare(`
        INSERT INTO accesos (miembro_id, fecha_entrada)
        VALUES (?, ?)
      `);

      const fechaEntrada = new Date().toISOString();
      const result = stmt.run(miembroId, fechaEntrada);

      const nuevoAcceso: Acceso = {
        id: result.lastInsertRowid as number,
        miembro_id: miembroId,
        fecha_entrada: fechaEntrada
      };

      logger.info(`Entrada registrada para miembro ID ${miembroId}`);
      return nuevoAcceso;
    } catch (error) {
      logger.error('Error al registrar entrada:', error);
      throw error;
    }
  }

  // Registrar salida de un miembro
  async registrarSalida(miembroId: number): Promise<Acceso> {
    try {
      // Buscar el acceso activo (sin salida)
      const accesoActivo = this.db.prepare(`
        SELECT * FROM accesos 
        WHERE miembro_id = ? AND fecha_salida IS NULL
        ORDER BY fecha_entrada DESC
        LIMIT 1
      `).get(miembroId) as Acceso;

      if (!accesoActivo) {
        throw new Error('No se encontró registro de entrada para este miembro');
      }

      const fechaSalida = new Date().toISOString();
      
      const stmt = this.db.prepare(`
        UPDATE accesos 
        SET fecha_salida = ?
        WHERE id = ?
      `);

      stmt.run(fechaSalida, accesoActivo.id);

      const accesoActualizado: Acceso = {
        ...accesoActivo,
        fecha_salida: fechaSalida
      };

      logger.info(`Salida registrada para miembro ID ${miembroId}`);
      return accesoActualizado;
    } catch (error) {
      logger.error('Error al registrar salida:', error);
      throw error;
    }
  }

  // Obtener miembros actualmente dentro del gimnasio
  async getMiembrosActualmenteDentro(): Promise<Acceso[]> {
    try {
      const accesos = this.db.prepare(`
        SELECT 
          a.*,
          m.nombre as nombre_miembro,
          m.email as email_miembro,
          m.telefono as telefono_miembro,
          m.documento as documento_miembro,
          tm.nombre as tipo_membresia,
          m.estado as estado_miembro,
          ROUND((julianday('now') - julianday(a.fecha_entrada)) * 24 * 60) as duracion_minutos
        FROM accesos a
        INNER JOIN miembros m ON a.miembro_id = m.id
        LEFT JOIN tipos_membresia tm ON m.tipo_membresia_id = tm.id
        WHERE a.fecha_salida IS NULL
        ORDER BY a.fecha_entrada DESC
      `).all() as Acceso[];

      return accesos;
    } catch (error) {
      logger.error('Error al obtener miembros dentro:', error);
      throw error;
    }
  }

  // Obtener historial de accesos con filtros
  async getHistorialAccesos(
    miembroId?: number,
    fechaInicio?: string,
    fechaFin?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ accesos: Acceso[], total: number }> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (miembroId) {
        whereClause += ' AND a.miembro_id = ?';
        params.push(miembroId);
      }

      if (fechaInicio) {
        whereClause += ' AND DATE(a.fecha_entrada) >= ?';
        params.push(fechaInicio);
      }

      if (fechaFin) {
        whereClause += ' AND DATE(a.fecha_entrada) <= ?';
        params.push(fechaFin);
      }

      // Contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM accesos a
        ${whereClause}
      `;
      const { total } = this.db.prepare(countQuery).get(...params) as { total: number };

      // Obtener registros con paginación
      const offset = (page - 1) * limit;
      const query = `
        SELECT 
          a.*,
          m.nombre as nombre_miembro,
          m.email as email_miembro,
          m.telefono as telefono_miembro,
          m.documento as documento_miembro,
          tm.nombre as tipo_membresia,
          m.estado as estado_miembro,
          CASE 
            WHEN a.fecha_salida IS NOT NULL 
            THEN ROUND((julianday(a.fecha_salida) - julianday(a.fecha_entrada)) * 24 * 60)
            ELSE NULL
          END as duracion_minutos
        FROM accesos a
        INNER JOIN miembros m ON a.miembro_id = m.id
        LEFT JOIN tipos_membresia tm ON m.tipo_membresia_id = tm.id
        ${whereClause}
        ORDER BY a.fecha_entrada DESC
        LIMIT ? OFFSET ?
      `;

      const accesos = this.db.prepare(query).all(...params, limit, offset) as Acceso[];

      return { accesos, total };
    } catch (error) {
      logger.error('Error al obtener historial de accesos:', error);
      throw error;
    }
  }

  // Obtener estadísticas de accesos
  async getEstadisticasAccesos(): Promise<EstadisticasAcceso> {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Total de accesos hoy
      const { total_accesos_hoy } = this.db.prepare(`
        SELECT COUNT(*) as total_accesos_hoy
        FROM accesos
        WHERE DATE(fecha_entrada) = ?
      `).get(hoy) as { total_accesos_hoy: number };

      // Total de accesos este mes
      const { total_accesos_mes } = this.db.prepare(`
        SELECT COUNT(*) as total_accesos_mes
        FROM accesos
        WHERE DATE(fecha_entrada) >= ?
      `).get(inicioMes) as { total_accesos_mes: number };

      // Miembros actualmente dentro
      const { miembros_actualmente_dentro } = this.db.prepare(`
        SELECT COUNT(*) as miembros_actualmente_dentro
        FROM accesos
        WHERE fecha_salida IS NULL
      `).get() as { miembros_actualmente_dentro: number };

      // Promedio de duración de sesiones hoy
      const { promedio_duracion_hoy } = this.db.prepare(`
        SELECT COALESCE(AVG(
          CASE 
            WHEN fecha_salida IS NOT NULL 
            THEN (julianday(fecha_salida) - julianday(fecha_entrada)) * 24 * 60
            ELSE NULL
          END
        ), 0) as promedio_duracion_hoy
        FROM accesos
        WHERE DATE(fecha_entrada) = ?
      `).get(hoy) as { promedio_duracion_hoy: number };

      // Hora pico del día
      const horaPico = this.db.prepare(`
        SELECT strftime('%H', fecha_entrada) as hora, COUNT(*) as accesos
        FROM accesos
        WHERE DATE(fecha_entrada) = ?
        GROUP BY strftime('%H', fecha_entrada)
        ORDER BY accesos DESC
        LIMIT 1
      `).get(hoy) as { hora: string; accesos: number } | undefined;

      // Accesos por hora del día
      const accesosPorHora = this.db.prepare(`
        SELECT strftime('%H', fecha_entrada) as hora, COUNT(*) as accesos
        FROM accesos
        WHERE DATE(fecha_entrada) = ?
        GROUP BY strftime('%H', fecha_entrada)
        ORDER BY hora
      `).all(hoy) as { hora: string; accesos: number }[];

      return {
        total_accesos_hoy,
        total_accesos_mes,
        miembros_actualmente_dentro,
        promedio_duracion_hoy: Math.round(promedio_duracion_hoy),
        hora_pico_hoy: horaPico ? `${horaPico.hora}:00` : 'N/A',
        accesos_por_hora: accesosPorHora
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas de accesos:', error);
      throw error;
    }
  }

  // Forzar salida de todos los miembros (cierre del gimnasio)
  async forzarSalidaTodos(): Promise<number> {
    try {
      const fechaSalida = new Date().toISOString();
      
      const stmt = this.db.prepare(`
        UPDATE accesos 
        SET fecha_salida = ?
        WHERE fecha_salida IS NULL
      `);

      const result = stmt.run(fechaSalida);
      const afectados = result.changes;

      logger.info(`Salida forzada registrada para ${afectados} miembros`);
      return afectados;
    } catch (error) {
      logger.error('Error al forzar salidas:', error);
      throw error;
    }
  }
}

import { getDatabase } from '../database/connection';
import { Miembro } from '../types';

export class MiembroModel {
  private db = getDatabase();

  // Obtener todos los miembros
  getAll(): Miembro[] {
    const stmt = this.db.prepare(`
      SELECT m.*, tm.nombre as tipo_membresia_nombre, tm.precio as precio_membresia
      FROM miembros m
      LEFT JOIN tipos_membresia tm ON m.tipo_membresia_id = tm.id
      ORDER BY m.nombre
    `);
    return stmt.all() as Miembro[];
  }

  // Obtener miembro por ID
  getById(id: number): Miembro | null {
    const stmt = this.db.prepare(`
      SELECT m.*, tm.nombre as tipo_membresia_nombre, tm.precio as precio_membresia
      FROM miembros m
      LEFT JOIN tipos_membresia tm ON m.tipo_membresia_id = tm.id
      WHERE m.id = ?
    `);
    return stmt.get(id) as Miembro | null;
  }

  // Buscar miembros por término
  search(query: string): Miembro[] {
    const stmt = this.db.prepare(`
      SELECT m.*, tm.nombre as tipo_membresia_nombre
      FROM miembros m
      LEFT JOIN tipos_membresia tm ON m.tipo_membresia_id = tm.id
      WHERE m.nombre LIKE ? OR m.documento LIKE ? OR m.email LIKE ?
      ORDER BY m.nombre
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm) as Miembro[];
  }

  // Crear nuevo miembro
  create(miembro: Miembro): Miembro {
    const stmt = this.db.prepare(`
      INSERT INTO miembros (
        nombre, email, telefono, documento, fecha_nacimiento,
        tipo_membresia_id, estado, foto_url, direccion,
        contacto_emergencia, telefono_emergencia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Convertir undefined a null para SQLite, y Date a string
    const convertValue = (value: any) => {
      if (value === undefined) return null;
      if (value instanceof Date) return value.toISOString().split('T')[0]; // Convertir Date a YYYY-MM-DD
      return value;
    };

    // Debug: Log de los valores que se van a insertar (UPDATED)
    const values = [
      miembro.nombre,
      convertValue(miembro.email),
      convertValue(miembro.telefono),
      convertValue(miembro.documento),
      convertValue(miembro.fecha_nacimiento),
      convertValue(miembro.tipo_membresia_id),
      miembro.estado || 'activo',
      convertValue(miembro.foto_url),
      convertValue(miembro.direccion),
      convertValue(miembro.contacto_emergencia),
      convertValue(miembro.telefono_emergencia)
    ];

    console.log('🔍 DEBUG - Valores a insertar:', values);
    console.log('🔍 DEBUG - Tipos de valores:', values.map(v => typeof v));

    const result = stmt.run(...values);

    return this.getById(result.lastInsertRowid as number)!;
  }

  // Actualizar miembro
  update(id: number, miembro: Partial<Miembro>): Miembro | null {
    const fields: string[] = [];
    const values: any[] = [];

    // Convertir undefined a null para SQLite, y Date a string
    const convertValue = (value: any) => {
      if (value === undefined) return null;
      if (value instanceof Date) return value.toISOString().split('T')[0]; // Convertir Date a YYYY-MM-DD
      return value;
    };

    // Construir dinámicamente la consulta UPDATE (FIXED DATE CONVERSION)
    Object.entries(miembro).forEach(([key, value]) => {
      if (key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(convertValue(value));
      }
    });

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE miembros SET ${fields.join(', ')} WHERE id = ?
    `);

    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return null;
    }

    return this.getById(id);
  }

  // Eliminar miembro (eliminación real)
  delete(id: number): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM miembros WHERE id = ?
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Método para soft delete (cambiar estado a inactivo)
  deactivate(id: number): boolean {
    const stmt = this.db.prepare(`
      UPDATE miembros SET estado = 'inactivo' WHERE id = ?
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Obtener miembros activos
  getActive(): Miembro[] {
    const stmt = this.db.prepare(`
      SELECT m.*, tm.nombre as tipo_membresia_nombre
      FROM miembros m
      LEFT JOIN tipos_membresia tm ON m.tipo_membresia_id = tm.id
      WHERE m.estado = 'activo'
      ORDER BY m.nombre
    `);
    return stmt.all() as Miembro[];
  }

  // Verificar si existe documento
  existsDocument(documento: string, excludeId?: number): boolean {
    let stmt;
    let result;

    if (excludeId) {
      stmt = this.db.prepare('SELECT 1 FROM miembros WHERE documento = ? AND id != ?');
      result = stmt.get(documento, excludeId);
    } else {
      stmt = this.db.prepare('SELECT 1 FROM miembros WHERE documento = ?');
      result = stmt.get(documento);
    }

    return !!result;
  }

  // Verificar si existe email
  existsEmail(email: string, excludeId?: number): boolean {
    let stmt;
    let result;

    if (excludeId) {
      stmt = this.db.prepare('SELECT 1 FROM miembros WHERE email = ? AND id != ?');
      result = stmt.get(email, excludeId);
    } else {
      stmt = this.db.prepare('SELECT 1 FROM miembros WHERE email = ?');
      result = stmt.get(email);
    }

    return !!result;
  }

  // Obtener estadísticas de miembros
  getStats(): any {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
        COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) as inactivos,
        COUNT(CASE WHEN estado = 'suspendido' THEN 1 END) as suspendidos
      FROM miembros
    `);
    return stmt.get();
  }
}

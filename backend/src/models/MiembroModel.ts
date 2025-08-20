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

    const result = stmt.run(
      miembro.nombre,
      miembro.email || null,
      miembro.telefono || null,
      miembro.documento || null,
      miembro.fecha_nacimiento || null,
      miembro.tipo_membresia_id || null,
      miembro.estado || 'activo',
      miembro.foto_url || null,
      miembro.direccion || null,
      miembro.contacto_emergencia || null,
      miembro.telefono_emergencia || null
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  // Actualizar miembro
  update(id: number, miembro: Partial<Miembro>): Miembro | null {
    const fields: string[] = [];
    const values: any[] = [];

    // Construir dinámicamente la consulta UPDATE
    Object.entries(miembro).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
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

  // Eliminar miembro (soft delete)
  delete(id: number): boolean {
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

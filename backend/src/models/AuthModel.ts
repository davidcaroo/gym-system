import Database from 'better-sqlite3';
import { getDatabase } from '../database/connection';
import bcrypt from 'bcryptjs';
import { Usuario } from '../types';

export class AuthModel {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  // Crear usuario inicial si no existe
  createDefaultUser(): void {
    const existingUser = this.db.prepare(`
      SELECT id FROM usuarios_sistema WHERE username = ?
    `).get('admin');

    if (!existingUser) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      
      this.db.prepare(`
        INSERT INTO usuarios_sistema (username, password_hash, nombre_completo, activo)
        VALUES (?, ?, ?, ?)
      `).run('admin', hashedPassword, 'Administrador del Sistema', 1);
    }
  }

  // Buscar usuario por username
  findByUsername(username: string): Usuario | undefined {
    return this.db.prepare(`
      SELECT id, username, password_hash, nombre_completo, activo, ultimo_acceso, created_at
      FROM usuarios_sistema 
      WHERE username = ? AND activo = 1
    `).get(username) as Usuario | undefined;
  }

  // Actualizar último acceso
  updateLastAccess(userId: number): void {
    this.db.prepare(`
      UPDATE usuarios_sistema 
      SET ultimo_acceso = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(userId);
  }

  // Cambiar contraseña
  changePassword(userId: number, newPassword: string): boolean {
    try {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      
      const result = this.db.prepare(`
        UPDATE usuarios_sistema 
        SET password_hash = ? 
        WHERE id = ?
      `).run(hashedPassword, userId);

      return result.changes > 0;
    } catch (error) {
      return false;
    }
  }

  // Verificar contraseña
  verifyPassword(plainPassword: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  // Obtener usuario por ID (sin password)
  getUserById(id: number): Omit<Usuario, 'password_hash'> | undefined {
    return this.db.prepare(`
      SELECT id, username, nombre_completo, activo, ultimo_acceso, created_at
      FROM usuarios_sistema 
      WHERE id = ? AND activo = 1
    `).get(id) as Omit<Usuario, 'password_hash'> | undefined;
  }
}

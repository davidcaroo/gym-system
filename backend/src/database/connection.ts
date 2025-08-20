import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

const DB_PATH = path.join(process.cwd(), '..', 'database', 'gym.db');

// Instancia única de la base de datos
let db: Database.Database | null = null;

export const getDatabase = (): Database.Database => {
  if (!db) {
    try {
      // Crear directorio si no existe
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        logger.info(`Directorio de base de datos creado: ${dbDir}`);
      }

      db = new Database(DB_PATH);
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
      logger.info(`Base de datos conectada: ${DB_PATH}`);
    } catch (error) {
      logger.error('Error al conectar con la base de datos:', error);
      throw error;
    }
  }
  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
    logger.info('Conexión a la base de datos cerrada');
  }
};

// Cerrar la base de datos al terminar el proceso
process.on('exit', () => {
  closeDatabase();
});

process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

export default getDatabase;

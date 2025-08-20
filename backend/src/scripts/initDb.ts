import { initializeDatabase } from '../database/init';
import { logger } from '../utils/logger';

async function initDb() {
  try {
    console.log('🔄 Inicializando base de datos...');
    await initializeDatabase();
    console.log('✅ Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    logger.error('Error en inicialización de BD:', error);
    process.exit(1);
  }
}

initDb();

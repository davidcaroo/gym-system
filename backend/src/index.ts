import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { initializeDatabase } from './database/init';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/auth';
import { logger } from './utils/logger';

// Importar rutas
import authRoutes from './routes/auth';
import miembrosRoutes from './routes/miembros';
import membresiaRoutes from './routes/membresias';
import pagosRoutes from './routes/pagos';
import productosRoutes from './routes/productos';
import ventasRoutes from './routes/ventas';
import accesosRoutes from './routes/accesos';
import reportesRoutes from './routes/reportes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
  secret: 'gym-system-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true en producción con HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Rutas de la API
// Rutas públicas (no requieren autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/miembros', requireAuth, miembrosRoutes);
app.use('/api/membresias', requireAuth, membresiaRoutes);
app.use('/api/pagos', requireAuth, pagosRoutes);
app.use('/api/productos', requireAuth, productosRoutes);
app.use('/api/ventas', requireAuth, ventasRoutes);
app.use('/api/accesos', accesosRoutes); // Sin requireAuth global - se maneja individualmente
app.use('/api/reportes', requireAuth, reportesRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Ruta no encontrada'
    }
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Inicializar base de datos y servidor
async function startServer() {
  try {
    // Inicializar base de datos
    await initializeDatabase();
    logger.info('Base de datos inicializada correctamente');

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`Servidor iniciado en http://localhost:${PORT}`);
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
      console.log(`❤️  Health check en http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

startServer();

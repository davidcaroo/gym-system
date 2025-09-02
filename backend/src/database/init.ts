import { getDatabase } from './connection';
import { logger } from '../utils/logger';
import { AuthModel } from '../models/AuthModel';

export const initializeDatabase = async (): Promise<void> => {
  const db = getDatabase();

  try {
    // Crear tabla tipos_membresia
    db.exec(`
      CREATE TABLE IF NOT EXISTS tipos_membresia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10,2) NOT NULL,
        duracion_dias INTEGER NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla miembros
    db.exec(`
      CREATE TABLE IF NOT EXISTS miembros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        telefono VARCHAR(20),
        documento VARCHAR(50) UNIQUE,
        fecha_nacimiento DATE,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
        tipo_membresia_id INTEGER,
        estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
        foto_url TEXT,
        direccion TEXT,
        contacto_emergencia VARCHAR(255),
        telefono_emergencia VARCHAR(20),
        FOREIGN KEY (tipo_membresia_id) REFERENCES tipos_membresia(id)
      )
    `);

    // Crear tabla pagos
    db.exec(`
      CREATE TABLE IF NOT EXISTS pagos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        miembro_id INTEGER NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_vencimiento DATE,
        concepto VARCHAR(255),
        metodo_pago VARCHAR(20) DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
        estado VARCHAR(20) DEFAULT 'pagado' CHECK (estado IN ('pagado', 'pendiente', 'vencido')),
        notas TEXT,
        FOREIGN KEY (miembro_id) REFERENCES miembros(id)
      )
    `);

    // Crear tabla productos
    db.exec(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(255) NOT NULL,
        codigo_barras VARCHAR(100) UNIQUE,
        descripcion TEXT,
        categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('suplementos', 'bebidas', 'accesorios', 'ropa')),
        precio_compra DECIMAL(10,2),
        precio_venta DECIMAL(10,2) NOT NULL,
        stock_actual INTEGER DEFAULT 0,
        stock_minimo INTEGER DEFAULT 5,
        fecha_vencimiento DATE,
        proveedor VARCHAR(255),
        activo BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla ventas
    db.exec(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
        miembro_id INTEGER,
        subtotal DECIMAL(10,2) NOT NULL,
        descuento DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        metodo_pago VARCHAR(20) DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'cuenta_miembro')),
        estado VARCHAR(20) DEFAULT 'completada' CHECK (estado IN ('completada', 'cancelada')),
        notas TEXT,
        FOREIGN KEY (miembro_id) REFERENCES miembros(id)
      )
    `);

    // Crear tabla detalle_ventas
    db.exec(`
      CREATE TABLE IF NOT EXISTS detalle_ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES ventas(id),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      )
    `);

    // Crear tabla accesos
    db.exec(`
      CREATE TABLE IF NOT EXISTS accesos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        miembro_id INTEGER NOT NULL,
        fecha_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_salida DATETIME,
        FOREIGN KEY (miembro_id) REFERENCES miembros(id)
      )
    `);

    // Crear tabla usuarios_sistema
    db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios_sistema (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nombre_completo VARCHAR(255),
        activo BOOLEAN DEFAULT TRUE,
        ultimo_acceso DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear índices para mejorar el rendimiento
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_miembros_documento ON miembros(documento);
      CREATE INDEX IF NOT EXISTS idx_miembros_email ON miembros(email);
      CREATE INDEX IF NOT EXISTS idx_miembros_estado ON miembros(estado);
      CREATE INDEX IF NOT EXISTS idx_pagos_miembro ON pagos(miembro_id);
      CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
      CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
      CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
      CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta);
      CREATE INDEX IF NOT EXISTS idx_accesos_miembro ON accesos(miembro_id);
      CREATE INDEX IF NOT EXISTS idx_accesos_entrada ON accesos(fecha_entrada);
      CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios_sistema(username);
      CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios_sistema(activo);
    `);

    logger.info('Base de datos inicializada correctamente con todas las tablas');
    
    // Insertar tipos de membresía por defecto si no existen
    const existingMemberships = db.prepare('SELECT COUNT(*) as count FROM tipos_membresia').get() as { count: number };
    if (existingMemberships.count === 0) {
      const insertMembership = db.prepare(`
        INSERT INTO tipos_membresia (nombre, descripcion, precio, duracion_dias, activo)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      insertMembership.run('Mensual', 'Membresía mensual con acceso completo al gimnasio', 50000, 30, 1);
      insertMembership.run('Trimestral', 'Membresía trimestral con descuento', 135000, 90, 1);
      insertMembership.run('Anual', 'Membresía anual con mayor descuento', 480000, 365, 1);
      insertMembership.run('Diaria', 'Acceso por un día', 5000, 1, 1);
      
      logger.info('Tipos de membresía iniciales creados');
    }
    
    // Crear usuario administrador inicial
    const authModel = new AuthModel();
    authModel.createDefaultUser();
    logger.info('Usuario administrador inicial creado/verificado');
    
  } catch (error) {
    logger.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

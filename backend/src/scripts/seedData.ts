import { getDatabase } from '../database/connection';
import { initializeDatabase } from '../database/init';
import { logger } from '../utils/logger';

async function seedData() {
  try {
    console.log('🔄 Inicializando base de datos...');
    await initializeDatabase();
    
    const db = getDatabase();
    console.log('🌱 Insertando datos de prueba...');

    // Limpiar datos existentes de las tablas principales
    try {
      db.exec('DELETE FROM detalle_ventas');
    } catch {}
    try {
      db.exec('DELETE FROM ventas');
    } catch {}
    try {
      db.exec('DELETE FROM accesos');
    } catch {}
    try {
      db.exec('DELETE FROM pagos');
    } catch {}
    try {
      db.exec('DELETE FROM productos');
    } catch {}
    try {
      db.exec('DELETE FROM miembros');
    } catch {}
    try {
      db.exec('DELETE FROM tipos_membresia');
    } catch {}

    // Reiniciar contadores de autoincremento
    try {
      db.exec(`UPDATE sqlite_sequence SET seq = 0 WHERE name = 'tipos_membresia'`);
      db.exec(`UPDATE sqlite_sequence SET seq = 0 WHERE name = 'miembros'`);
      db.exec(`UPDATE sqlite_sequence SET seq = 0 WHERE name = 'productos'`);
    } catch {
      // Si no existen los registros en sqlite_sequence, continuar
    }

    // Insertar tipos de membresía
    const insertMembresia = db.prepare(`
      INSERT INTO tipos_membresia (nombre, descripcion, precio, duracion_dias, activo)
      VALUES (?, ?, ?, ?, ?)
    `);

    const membresias = [
      ['Mensual Básica', 'Acceso completo al gimnasio por 30 días', 35000, 30, 1],
      ['Mensual Premium', 'Acceso + clases grupales + entrenador', 55000, 30, 1],
      ['Trimestral', 'Plan de 3 meses con descuento', 90000, 90, 1],
      ['Semestral', 'Plan de 6 meses con mayor descuento', 160000, 180, 1],
      ['Anual', 'Plan anual con máximo descuento', 300000, 365, 1]
    ];

    membresias.forEach(m => insertMembresia.run(...m));

    // Insertar miembros de prueba
    const insertMiembro = db.prepare(`
      INSERT INTO miembros (nombre, email, telefono, documento, fecha_nacimiento, tipo_membresia_id, estado, direccion, contacto_emergencia, telefono_emergencia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const miembros = [
      ['Juan Carlos Pérez', 'juan.perez@email.com', '3001234567', '12345678', '1990-05-15', 1, 'activo', 'Calle 123 #45-67', 'María Pérez', '3007654321'],
      ['Ana María González', 'ana.gonzalez@email.com', '3009876543', '87654321', '1985-08-22', 2, 'activo', 'Carrera 45 #78-90', 'Carlos González', '3006543210'],
      ['Luis Fernando Rodríguez', 'luis.rodriguez@email.com', '3012345678', '11223344', '1992-03-10', 1, 'activo', 'Avenida 67 #12-34', 'Carmen Rodríguez', '3011234567'],
      ['María Claudia López', 'maria.lopez@email.com', '3098765432', '44332211', '1988-11-05', 3, 'activo', 'Diagonal 89 #56-78', 'Pedro López', '3098765431'],
      ['Carlos Alberto Martínez', 'carlos.martinez@email.com', '3045678901', '55667788', '1995-07-18', 2, 'activo', 'Transversal 23 #34-45', 'Laura Martínez', '3045678902'],
      ['Diana Patricia García', 'diana.garcia@email.com', '3076543210', '99887766', '1993-01-25', 1, 'activo', 'Calle 56 #67-78', 'Roberto García', '3076543211'],
      ['Andrés Felipe Herrera', 'andres.herrera@email.com', '3023456789', '66778899', '1991-09-12', 4, 'activo', 'Carrera 78 #89-90', 'Silvia Herrera', '3023456788'],
      ['Carolina Jiménez', 'carolina.jimenez@email.com', '3087654321', '33445566', '1987-04-30', 1, 'activo', 'Avenida 90 #12-23', 'Miguel Jiménez', '3087654322'],
      ['Ricardo Valencia', 'ricardo.valencia@email.com', '3034567890', '77889900', '1989-12-08', 2, 'activo', 'Diagonal 12 #34-56', 'Patricia Valencia', '3034567891'],
      ['Sandra Milena Torres', 'sandra.torres@email.com', '3065432109', '00998877', '1994-06-14', 1, 'activo', 'Transversal 45 #67-89', 'Jorge Torres', '3065432108'],
      ['Javier Alejandro Ruiz', 'javier.ruiz@email.com', '3012349876', '22334455', '1986-10-20', 3, 'inactivo', 'Calle 67 #78-90', 'Elena Ruiz', '3012349877'],
      ['Paola Andrea Castro', 'paola.castro@email.com', '3098761234', '55443322', '1996-02-17', 1, 'suspendido', 'Carrera 89 #01-12', 'Daniel Castro', '3098761235'],
      ['Mauricio Gómez', 'mauricio.gomez@email.com', '3076549876', '88776655', '1983-08-03', 2, 'activo', 'Avenida 12 #23-34', 'Gloria Gómez', '3076549877'],
      ['Liliana Vargas', 'liliana.vargas@email.com', '3045671234', '44556677', '1997-11-28', 1, 'activo', 'Diagonal 34 #45-56', 'Hernán Vargas', '3045671235'],
      ['Héctor Fabián Morales', 'hector.morales@email.com', '3023457890', '11009988', '1984-05-09', 4, 'activo', 'Transversal 56 #78-90', 'Marta Morales', '3023457891'],
      ['Claudia Esperanza León', 'claudia.leon@email.com', '3087659876', '99881100', '1990-07-23', 2, 'activo', 'Calle 78 #90-01', 'Fernando León', '3087659877'],
      ['Oscar David Ramírez', 'oscar.ramirez@email.com', '3065437890', '22113344', '1992-01-16', 1, 'activo', 'Carrera 90 #12-23', 'Isabel Ramírez', '3065437891'],
      ['Adriana Salazar', 'adriana.salazar@email.com', '3034569876', '55664477', '1988-09-11', 3, 'activo', 'Avenida 23 #34-45', 'Rodrigo Salazar', '3034569877'],
      ['German Andrés Vega', 'german.vega@email.com', '3012347890', '88771122', '1995-03-07', 1, 'activo', 'Diagonal 45 #56-67', 'Nancy Vega', '3012347891'],
      ['Yolanda Cristina Mora', 'yolanda.mora@email.com', '3098769876', '44335566', '1987-12-02', 2, 'activo', 'Transversal 67 #89-90', 'Álvaro Mora', '3098769877']
    ];

    miembros.forEach(m => insertMiembro.run(...m));

    // Insertar productos
    const insertProducto = db.prepare(`
      INSERT INTO productos (nombre, codigo_barras, descripcion, categoria, precio_compra, precio_venta, stock_actual, stock_minimo, proveedor, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const productos = [
      ['Proteína Whey 1kg', '7891234567890', 'Proteína en polvo sabor vainilla', 'suplementos', 35000, 55000, 25, 5, 'Suplementos Colombia', 1],
      ['Creatina Monohidratada 300g', '7891234567891', 'Creatina pura micronizada', 'suplementos', 18000, 28000, 30, 5, 'Suplementos Colombia', 1],
      ['BCAA 120 cápsulas', '7891234567892', 'Aminoácidos ramificados', 'suplementos', 25000, 40000, 20, 5, 'Suplementos Colombia', 1],
      ['Pre-entreno 300g', '7891234567893', 'Energizante pre-entrenamiento', 'suplementos', 30000, 48000, 15, 3, 'Suplementos Colombia', 1],
      ['Glutamina 500g', '7891234567894', 'L-Glutamina pura en polvo', 'suplementos', 20000, 32000, 18, 5, 'Suplementos Colombia', 1],
      ['Agua 500ml', '7891234567895', 'Agua purificada', 'bebidas', 500, 1500, 100, 20, 'Distribuidora Local', 1],
      ['Gatorade 500ml', '7891234567896', 'Bebida hidratante', 'bebidas', 1500, 3000, 50, 10, 'Distribuidora Local', 1],
      ['Energizante Red Bull', '7891234567897', 'Bebida energética 250ml', 'bebidas', 3000, 5500, 40, 8, 'Distribuidora Local', 1],
      ['Proteína en barra', '7891234567898', 'Barra de proteína sabor chocolate', 'bebidas', 2000, 4000, 60, 15, 'Distribuidora Local', 1],
      ['Jugo Natural 350ml', '7891234567899', 'Jugo natural de frutas', 'bebidas', 1800, 3500, 35, 10, 'Distribuidora Local', 1],
      ['Guantes de entreno', '7891234567800', 'Guantes para levantamiento', 'accesorios', 15000, 25000, 12, 3, 'Deportes Max', 1],
      ['Correa de cuero', '7891234567801', 'Cinturón para levantamiento', 'accesorios', 45000, 75000, 8, 2, 'Deportes Max', 1],
      ['Toalla deportiva', '7891234567802', 'Toalla de microfibra', 'accesorios', 8000, 15000, 25, 5, 'Deportes Max', 1],
      ['Shaker 600ml', '7891234567803', 'Vaso mezclador con compartimentos', 'accesorios', 5000, 12000, 30, 5, 'Deportes Max', 1],
      ['Straps de agarre', '7891234567804', 'Correas para mejorar agarre', 'accesorios', 12000, 20000, 15, 3, 'Deportes Max', 1],
      ['Camiseta GYM M', '7891234567805', 'Camiseta deportiva talla M', 'ropa', 18000, 35000, 20, 3, 'Textiles Sport', 1],
      ['Camiseta GYM L', '7891234567806', 'Camiseta deportiva talla L', 'ropa', 18000, 35000, 18, 3, 'Textiles Sport', 1],
      ['Pantaloneta M', '7891234567807', 'Short deportivo talla M', 'ropa', 15000, 28000, 15, 3, 'Textiles Sport', 1],
      ['Pantaloneta L', '7891234567808', 'Short deportivo talla L', 'ropa', 15000, 28000, 12, 3, 'Textiles Sport', 1],
      ['Sudadera con capota', '7891234567809', 'Sudadera deportiva unisex', 'ropa', 35000, 65000, 10, 2, 'Textiles Sport', 1]
    ];

    productos.forEach(p => insertProducto.run(...p));

    console.log('✅ Datos de prueba insertados correctamente');
    console.log(`   📊 ${membresias.length} tipos de membresía`);
    console.log(`   👥 ${miembros.length} miembros`);
    console.log(`   📦 ${productos.length} productos`);

    logger.info('Datos de prueba insertados exitosamente');
    
  } catch (error) {
    console.error('❌ Error al insertar datos de prueba:', error);
    logger.error('Error en seed de datos:', error);
    throw error;
  }
}

seedData()
  .then(() => {
    console.log('🎉 Proceso completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error en el proceso:', error);
    process.exit(1);
  });

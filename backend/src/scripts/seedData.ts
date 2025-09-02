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
    console.log(`✅ ${miembros.length} miembros insertados`);

    // Verificar que los miembros se insertaron correctamente
    const miembrosCount = db.prepare('SELECT COUNT(*) as count FROM miembros').get() as any;
    console.log(`📊 Miembros en BD: ${miembrosCount.count}`);

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
    console.log(`✅ ${productos.length} productos insertados`);

    // Verificar que los productos se insertaron correctamente
    const productosCount = db.prepare('SELECT COUNT(*) as count FROM productos').get() as any;
    console.log(`📊 Productos en BD: ${productosCount.count}`);

    // Insertar ventas de ejemplo
    console.log('🔄 Insertando ventas...');
    
    // Verificar productos disponibles
    const productosDisponibles = db.prepare('SELECT id FROM productos ORDER BY id').all() as any[];
    console.log(`📊 IDs de productos disponibles: ${productosDisponibles.map(p => p.id).join(', ')}`);

    const insertVenta = db.prepare(`
      INSERT INTO ventas (miembro_id, subtotal, descuento, total, metodo_pago, fecha_venta, estado, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertDetalleVenta = db.prepare(`
      INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Generar ventas de los últimos 7 días
    const fechas = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      fechas.push(fecha.toISOString().slice(0, 19).replace('T', ' '));
    }

    let ventaId = 1;
    
    // Crear ventas variadas
    const ventasEjemplo = [
      // Venta 1: Proteína + BCAA
      { miembro_id: 1, items: [{ producto_id: 1, cantidad: 1, precio: 55000 }, { producto_id: 3, cantidad: 1, precio: 40000 }], metodo: 'efectivo', fecha: fechas[0] },
      // Venta 2: Solo bebidas
      { miembro_id: 2, items: [{ producto_id: 6, cantidad: 2, precio: 1500 }, { producto_id: 7, cantidad: 1, precio: 3000 }], metodo: 'tarjeta', fecha: fechas[0] },
      // Venta 3: Ropa + accesorios
      { miembro_id: null, items: [{ producto_id: 15, cantidad: 1, precio: 35000 }, { producto_id: 11, cantidad: 1, precio: 25000 }], metodo: 'efectivo', fecha: fechas[1] },
      // Venta 4: Suplementos múltiples
      { miembro_id: 3, items: [{ producto_id: 1, cantidad: 1, precio: 55000 }, { producto_id: 2, cantidad: 1, precio: 28000 }, { producto_id: 5, cantidad: 1, precio: 32000 }], metodo: 'cuenta_miembro', fecha: fechas[1] },
      // Venta 5: Bebidas energéticas
      { miembro_id: 4, items: [{ producto_id: 8, cantidad: 3, precio: 5500 }, { producto_id: 9, cantidad: 2, precio: 4000 }], metodo: 'tarjeta', fecha: fechas[2] },
      // Venta 6: Equipamiento completo
      { miembro_id: 5, items: [{ producto_id: 10, cantidad: 1, precio: 25000 }, { producto_id: 12, cantidad: 1, precio: 75000 }, { producto_id: 13, cantidad: 1, precio: 15000 }], metodo: 'efectivo', fecha: fechas[2] },
      // Venta 7: Compra grande de ropa
      { miembro_id: null, items: [{ producto_id: 15, cantidad: 2, precio: 35000 }, { producto_id: 16, cantidad: 2, precio: 35000 }, { producto_id: 17, cantidad: 1, precio: 28000 }, { producto_id: 19, cantidad: 1, precio: 65000 }], metodo: 'tarjeta', fecha: fechas[3] },
      // Venta 8: Bebidas del día
      { miembro_id: 6, items: [{ producto_id: 6, cantidad: 1, precio: 1500 }, { producto_id: 10, cantidad: 1, precio: 3500 }], metodo: 'efectivo', fecha: fechas[4] },
      // Venta 9: Suplementos premium
      { miembro_id: 7, items: [{ producto_id: 4, cantidad: 1, precio: 48000 }, { producto_id: 5, cantidad: 1, precio: 32000 }], metodo: 'cuenta_miembro', fecha: fechas[4] },
      // Venta 10: Accesorios variados
      { miembro_id: null, items: [{ producto_id: 14, cantidad: 2, precio: 12000 }, { producto_id: 13, cantidad: 3, precio: 15000 }, { producto_id: 11, cantidad: 1, precio: 25000 }], metodo: 'efectivo', fecha: fechas[5] },
      // Ventas de hoy
      { miembro_id: 8, items: [{ producto_id: 1, cantidad: 1, precio: 55000 }, { producto_id: 6, cantidad: 1, precio: 1500 }], metodo: 'tarjeta', fecha: fechas[6] },
      { miembro_id: 9, items: [{ producto_id: 2, cantidad: 1, precio: 28000 }, { producto_id: 3, cantidad: 1, precio: 40000 }], metodo: 'efectivo', fecha: fechas[6] },
      { miembro_id: null, items: [{ producto_id: 7, cantidad: 2, precio: 3000 }, { producto_id: 8, cantidad: 1, precio: 5500 }], metodo: 'efectivo', fecha: fechas[6] }
    ];

    for (const venta of ventasEjemplo) {
      const subtotal = venta.items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
      const descuento = subtotal > 100000 ? Math.floor(subtotal * 0.05) : 0; // 5% descuento en compras grandes
      const total = subtotal - descuento;

      console.log(`🔄 Insertando venta para miembro ${venta.miembro_id}`);

      // Insertar venta
      const ventaResult = insertVenta.run(
        venta.miembro_id,
        subtotal,
        descuento,
        total,
        venta.metodo,
        venta.fecha,
        'completada',
        descuento > 0 ? 'Descuento aplicado por compra mayor a $100,000' : null
      );

      // Obtener el ID real de la venta insertada
      const ventaIdReal = ventaResult.lastInsertRowid as number;
      console.log(`✅ Venta insertada con ID: ${ventaIdReal}`);

      // Insertar detalles
      for (const item of venta.items) {
        const subtotalItem = item.cantidad * item.precio;
        console.log(`  🔄 Insertando detalle: producto ${item.producto_id}, cantidad ${item.cantidad}`);
        try {
          insertDetalleVenta.run(ventaIdReal, item.producto_id, item.cantidad, item.precio, subtotalItem);
          console.log(`  ✅ Detalle insertado exitosamente`);
        } catch (error) {
          console.error(`  ❌ Error insertando detalle para producto ${item.producto_id}:`, error);
          throw error;
        }
      }
    }

    // Insertar pagos de ejemplo para los miembros
    console.log('🔄 Insertando pagos...');
    
    // Verificar que tenemos miembros antes de insertar pagos
    const miembrosDisponibles = db.prepare('SELECT id FROM miembros ORDER BY id').all() as any[];
    console.log(`📊 IDs de miembros disponibles: ${miembrosDisponibles.map(m => m.id).join(', ')}`);

    const insertPago = db.prepare(`
      INSERT INTO pagos (miembro_id, monto, fecha_pago, fecha_vencimiento, concepto, metodo_pago, estado, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const pagosEjemplo = [
      // Pagos del mes pasado (30 días atrás)
      { miembro_id: 1, monto: 150000, fecha_pago: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Mensual', metodo: 'efectivo', estado: 'pagado' },
      { miembro_id: 2, monto: 400000, fecha_pago: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Trimestral', metodo: 'tarjeta', estado: 'pagado' },
      { miembro_id: 3, monto: 120000, fecha_pago: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Estudiantil', metodo: 'transferencia', estado: 'pagado' },
      
      // Pagos recientes (15 días atrás)
      { miembro_id: 4, monto: 200000, fecha_pago: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Bimensual', metodo: 'efectivo', estado: 'pagado' },
      { miembro_id: 5, monto: 1200000, fecha_pago: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 353 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Anual', metodo: 'tarjeta', estado: 'pagado' },
      { miembro_id: 6, monto: 150000, fecha_pago: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Mensual', metodo: 'efectivo', estado: 'pagado' },
      { miembro_id: 7, monto: 400000, fecha_pago: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 82 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Trimestral', metodo: 'transferencia', estado: 'pagado' },
      
      // Pagos de esta semana
      { miembro_id: 8, monto: 120000, fecha_pago: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Estudiantil', metodo: 'efectivo', estado: 'pagado' },
      { miembro_id: 9, monto: 200000, fecha_pago: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 57 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Bimensual', metodo: 'tarjeta', estado: 'pagado' },
      { miembro_id: 10, monto: 150000, fecha_pago: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Mensual', metodo: 'efectivo', estado: 'pagado' },
      
      // Pagos de hoy
      { miembro_id: 1, monto: 150000, fecha_pago: new Date().toISOString(), vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Renovación Membresía Mensual', metodo: 'efectivo', estado: 'pagado' },
      { miembro_id: 12, monto: 400000, fecha_pago: new Date().toISOString(), vencimiento: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Trimestral', metodo: 'tarjeta', estado: 'pagado' },
      
      // Pagos próximos a vencer (advertencias)
      { miembro_id: 13, monto: 150000, fecha_pago: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Mensual', metodo: 'efectivo', estado: 'pagado', notas: 'Recordar renovación' },
      { miembro_id: 14, monto: 120000, fecha_pago: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Estudiantil', metodo: 'transferencia', estado: 'pagado', notas: 'Próximo a vencer' },
      
      // Pagos pendientes
      { miembro_id: 15, monto: 200000, fecha_pago: new Date().toISOString(), vencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Bimensual', metodo: 'efectivo', estado: 'pendiente', notas: 'Pago pendiente por confirmar' },
      { miembro_id: 16, monto: 150000, fecha_pago: new Date().toISOString(), vencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Mensual', metodo: 'tarjeta', estado: 'pendiente', notas: 'Esperando confirmación de pago' },
      
      // Pagos vencidos (para testing)
      { miembro_id: 17, monto: 150000, fecha_pago: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Mensual', metodo: 'efectivo', estado: 'vencido', notas: 'Membresía vencida - contactar miembro' },
      { miembro_id: 18, monto: 120000, fecha_pago: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), vencimiento: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), concepto: 'Membresía Estudiantil', metodo: 'efectivo', estado: 'vencido', notas: 'Membresía vencida - suspendido acceso' }
    ];

    for (const pago of pagosEjemplo) {
      try {
        console.log(`🔄 Insertando pago para miembro ${pago.miembro_id}: ${pago.concepto}`);
        insertPago.run(
          pago.miembro_id,
          pago.monto,
          pago.fecha_pago,
          pago.vencimiento,
          pago.concepto,
          pago.metodo,
          pago.estado,
          pago.notas || null
        );
        console.log(`✅ Pago insertado exitosamente`);
      } catch (error) {
        console.error(`❌ Error insertando pago para miembro ${pago.miembro_id}:`, error);
        throw error;
      }
    }

    console.log('✅ Datos de prueba insertados correctamente');
    console.log(`   📊 ${membresias.length} tipos de membresía`);
    console.log(`   👥 ${miembros.length} miembros`);
    console.log(`   📦 ${productos.length} productos`);
    console.log(`   💰 ${ventasEjemplo.length} ventas de ejemplo`);
    console.log(`   💳 ${pagosEjemplo.length} pagos de ejemplo`);

    // Insertar accesos de ejemplo
    console.log('🔄 Insertando accesos de ejemplo...');
    
    const insertAcceso = db.prepare(`
      INSERT INTO accesos (miembro_id, fecha_entrada, fecha_salida)
      VALUES (?, ?, ?)
    `);

    // Generar accesos históricos de los últimos 7 días
    const accesosFechas = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      accesosFechas.push(fecha);
    }

    const accesosEjemplo = [];

    // Accesos históricos (días anteriores - todos con salida)
    for (let i = 0; i < 6; i++) {
      const fecha = accesosFechas[i];
      
      // Pico matutino (6-10 AM) - 8-12 personas
      for (let j = 0; j < 10; j++) {
        const miembroId = (j % 16) + 1; // Ciclar entre miembros 1-16
        const horaEntrada = 6 + Math.random() * 4; // Entre 6-10 AM
        const duracion = 60 + Math.random() * 60; // 60-120 minutos
        
        const fechaEntrada = new Date(fecha);
        fechaEntrada.setHours(Math.floor(horaEntrada), Math.floor((horaEntrada % 1) * 60));
        
        const fechaSalida = new Date(fechaEntrada);
        fechaSalida.setMinutes(fechaSalida.getMinutes() + duracion);
        
        accesosEjemplo.push({
          miembro_id: miembroId,
          fecha_entrada: fechaEntrada.toISOString(),
          fecha_salida: fechaSalida.toISOString()
        });
      }

      // Pico vespertino (5-9 PM) - 12-18 personas
      for (let j = 0; j < 15; j++) {
        const miembroId = ((j + 10) % 16) + 1; // Ciclar entre miembros diferentes
        const horaEntrada = 17 + Math.random() * 4; // Entre 5-9 PM
        const duracion = 45 + Math.random() * 75; // 45-120 minutos
        
        const fechaEntrada = new Date(fecha);
        fechaEntrada.setHours(Math.floor(horaEntrada), Math.floor((horaEntrada % 1) * 60));
        
        const fechaSalida = new Date(fechaEntrada);
        fechaSalida.setMinutes(fechaSalida.getMinutes() + duracion);
        
        accesosEjemplo.push({
          miembro_id: miembroId,
          fecha_entrada: fechaEntrada.toISOString(),
          fecha_salida: fechaSalida.toISOString()
        });
      }

      // Algunas visitas al mediodía (12-2 PM) - 3-6 personas
      for (let j = 0; j < 4; j++) {
        const miembroId = ((j + 5) % 16) + 1;
        const horaEntrada = 12 + Math.random() * 2; // Entre 12-2 PM
        const duracion = 30 + Math.random() * 60; // 30-90 minutos
        
        const fechaEntrada = new Date(fecha);
        fechaEntrada.setHours(Math.floor(horaEntrada), Math.floor((horaEntrada % 1) * 60));
        
        const fechaSalida = new Date(fechaEntrada);
        fechaSalida.setMinutes(fechaSalida.getMinutes() + duracion);
        
        accesosEjemplo.push({
          miembro_id: miembroId,
          fecha_entrada: fechaEntrada.toISOString(),
          fecha_salida: fechaSalida.toISOString()
        });
      }
    }

    // Accesos de HOY (algunos sin salida para simular personas actualmente en el gym)
    const hoy = accesosFechas[6];
    
    // Accesos matutinos completados
    for (let j = 0; j < 8; j++) {
      const miembroId = (j % 16) + 1;
      const horaEntrada = 6 + Math.random() * 3; // Entre 6-9 AM
      const duracion = 60 + Math.random() * 45; // 60-105 minutos
      
      const fechaEntrada = new Date(hoy);
      fechaEntrada.setHours(Math.floor(horaEntrada), Math.floor((horaEntrada % 1) * 60));
      
      const fechaSalida = new Date(fechaEntrada);
      fechaSalida.setMinutes(fechaSalida.getMinutes() + duracion);
      
      accesosEjemplo.push({
        miembro_id: miembroId,
        fecha_entrada: fechaEntrada.toISOString(),
        fecha_salida: fechaSalida.toISOString()
      });
    }

    // Accesos actuales (sin salida) - personas que están ahora en el gym
    const horaActual = new Date().getHours();
    const personasActuales = [];

    if (horaActual >= 6 && horaActual < 23) { // Si el gym está abierto
      // 4-8 personas actualmente dentro
      for (let j = 0; j < 6; j++) {
        const miembroId = ((j + 8) % 16) + 1;
        const tiempoEntrada = Math.random() * 120; // Entraron hace 0-120 minutos
        
        const fechaEntrada = new Date();
        fechaEntrada.setMinutes(fechaEntrada.getMinutes() - tiempoEntrada);
        
        personasActuales.push({
          miembro_id: miembroId,
          fecha_entrada: fechaEntrada.toISOString(),
          fecha_salida: null
        });
      }
    }

    accesosEjemplo.push(...personasActuales);

    // Insertar todos los accesos
    for (const acceso of accesosEjemplo) {
      try {
        insertAcceso.run(acceso.miembro_id, acceso.fecha_entrada, acceso.fecha_salida);
      } catch (error) {
        console.error(`❌ Error insertando acceso para miembro ${acceso.miembro_id}:`, error);
        // No fallar por un solo error, continuar con los demás
      }
    }

    console.log(`✅ ${accesosEjemplo.length} accesos insertados`);
    console.log(`   👤 ${personasActuales.length} miembros actualmente dentro del gimnasio`);

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

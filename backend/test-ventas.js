// Script de prueba para las APIs de Ventas
// Ejecutar: node test-ventas.js

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testVentas() {
    console.log('🧪 Iniciando pruebas de APIs de Ventas...\n');

    try {
        // 1. Login primero para obtener autenticación
        console.log('1. 🔐 Autenticando...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, {
            withCredentials: true
        });

        const cookies = loginResponse.headers['set-cookie'];
        const authHeaders = { 'Cookie': cookies[0] };
        console.log('✅ Autenticado correctamente\n');

        // 2. Obtener dashboard de ventas
        console.log('2. 📊 Obteniendo dashboard de ventas...');
        const dashboardResponse = await axios.get(`${baseURL}/ventas/dashboard`, {
            headers: authHeaders
        });
        console.log('✅ Dashboard obtenido:');
        console.log('  - Ventas hoy:', dashboardResponse.data.data.hoy.ventas);
        console.log('  - Ingresos hoy: $', dashboardResponse.data.data.hoy.ingresos.toLocaleString());
        console.log('  - Productos vendidos hoy:', dashboardResponse.data.data.hoy.productos_vendidos);
        console.log('  - Ventas totales:', dashboardResponse.data.data.general.ventas_totales);

        // 3. Obtener todas las ventas
        console.log('\n3. 📋 Obteniendo todas las ventas...');
        const allVentasResponse = await axios.get(`${baseURL}/ventas`, {
            headers: authHeaders
        });
        console.log(`✅ ${allVentasResponse.data.data.length} ventas encontradas`);
        console.log('Última venta:', {
            id: allVentasResponse.data.data[0].id,
            total: allVentasResponse.data.data[0].total,
            items: allVentasResponse.data.data[0].items_count
        });

        // 4. Obtener detalle de una venta específica
        console.log('\n4. 🔍 Obteniendo detalle de venta...');
        const ventaId = allVentasResponse.data.data[0].id;
        const ventaDetalleResponse = await axios.get(`${baseURL}/ventas/${ventaId}`, {
            headers: authHeaders
        });
        console.log('✅ Detalle de venta obtenido:');
        console.log('  - ID:', ventaDetalleResponse.data.data.id);
        console.log('  - Total: $', ventaDetalleResponse.data.data.total.toLocaleString());
        console.log('  - Items:', ventaDetalleResponse.data.data.detalles.length);
        console.log('  - Productos:', ventaDetalleResponse.data.data.detalles.map(d => d.producto_nombre));

        // 5. Obtener estadísticas de ventas
        console.log('\n5. 📈 Obteniendo estadísticas de ventas...');
        const statsResponse = await axios.get(`${baseURL}/ventas/stats`, {
            headers: authHeaders
        });
        console.log('✅ Estadísticas generales:');
        console.log('  - Total ventas:', statsResponse.data.data.total_ventas);
        console.log('  - Total ingresos: $', statsResponse.data.data.total_ingresos.toLocaleString());
        console.log('  - Venta promedio: $', Math.round(statsResponse.data.data.venta_promedio).toLocaleString());
        console.log('  - Productos vendidos:', statsResponse.data.data.productos_vendidos);

        // 6. Ventas por método de pago
        console.log('\n  📊 Ventas por método de pago:');
        statsResponse.data.data.ventas_por_metodo.forEach(metodo => {
            console.log(`    - ${metodo.metodo_pago}: ${metodo.cantidad} ventas ($${metodo.total.toLocaleString()})`);
        });

        // 7. Productos más vendidos
        console.log('\n  🏆 Top 5 productos más vendidos:');
        statsResponse.data.data.productos_mas_vendidos.slice(0, 5).forEach((producto, index) => {
            console.log(`    ${index + 1}. ${producto.producto_nombre}: ${producto.cantidad_vendida} unidades ($${producto.ingresos.toLocaleString()})`);
        });

        // 8. Crear nueva venta
        console.log('\n6. ➕ Procesando nueva venta...');
        const nuevaVenta = {
            miembro_id: 1,
            subtotal: 83000,
            descuento: 3000,
            total: 80000,
            metodo_pago: 'tarjeta',
            notas: 'Venta de prueba desde API',
            items: [
                {
                    producto_id: 1, // Proteína Whey
                    cantidad: 1,
                    precio_unitario: 55000
                },
                {
                    producto_id: 3, // BCAA
                    cantidad: 1,
                    precio_unitario: 28000
                }
            ]
        };

        const createVentaResponse = await axios.post(`${baseURL}/ventas`, nuevaVenta, {
            headers: authHeaders
        });
        console.log('✅ Venta procesada exitosamente:');
        console.log('  - ID de venta:', createVentaResponse.data.data.id);
        console.log('  - Total: $', createVentaResponse.data.data.total.toLocaleString());
        console.log('  - Items vendidos:', createVentaResponse.data.data.detalles.length);

        const nuevaVentaId = createVentaResponse.data.data.id;

        // 9. Obtener reporte diario
        console.log('\n7. 📅 Obteniendo reporte diario...');
        const hoy = new Date().toISOString().split('T')[0];
        const reporteResponse = await axios.get(`${baseURL}/ventas/reporte/${hoy}`, {
            headers: authHeaders
        });
        console.log('✅ Reporte diario generado:');
        console.log('  - Fecha:', reporteResponse.data.data.fecha);
        console.log('  - Ventas del día:', reporteResponse.data.data.total_ventas);
        console.log('  - Ingresos del día: $', reporteResponse.data.data.total_ingresos.toLocaleString());
        console.log('  - Productos vendidos:', reporteResponse.data.data.productos_vendidos);

        // 10. Buscar ventas
        console.log('\n8. 🔎 Buscando ventas...');
        const searchResponse = await axios.get(`${baseURL}/ventas/buscar/proteína`, {
            headers: authHeaders
        });
        console.log(`✅ ${searchResponse.data.data.length} ventas encontradas con "proteína"`);

        // 11. Ventas de un miembro específico
        console.log('\n9. 👤 Obteniendo ventas de un miembro...');
        const ventasMiembroResponse = await axios.get(`${baseURL}/ventas/miembro/1`, {
            headers: authHeaders
        });
        console.log(`✅ ${ventasMiembroResponse.data.data.length} ventas encontradas para el miembro`);

        // 12. Cancelar la venta de prueba
        console.log('\n10. ❌ Cancelando venta de prueba...');
        const cancelResponse = await axios.put(`${baseURL}/ventas/${nuevaVentaId}/cancelar`, {}, {
            headers: authHeaders
        });
        console.log('✅ Venta cancelada:', cancelResponse.data.message);

        // 13. Verificar que el stock se restauró
        console.log('\n11. 🔄 Verificando restauración de stock...');
        const productosResponse = await axios.get(`${baseURL}/productos`, {
            headers: authHeaders
        });
        const proteina = productosResponse.data.data.find(p => p.id === 1);
        console.log('✅ Stock de Proteína Whey restaurado:', proteina.stock_actual, 'unidades');

        console.log('\n🎉 ¡Todas las pruebas de ventas pasaron exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testVentas();

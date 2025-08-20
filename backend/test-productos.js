// Script de prueba para las APIs de Productos
// Ejecutar: node test-productos.js

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testProductos() {
    console.log('🧪 Iniciando pruebas de APIs de Productos...\n');

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

        // 2. Obtener todos los productos
        console.log('2. 📦 Obteniendo todos los productos...');
        const allProductsResponse = await axios.get(`${baseURL}/productos`, {
            headers: authHeaders
        });
        console.log(`✅ ${allProductsResponse.data.data.length} productos encontrados`);
        console.log('Primeros 3 productos:', allProductsResponse.data.data.slice(0, 3).map(p => p.nombre));

        // 3. Buscar productos por categoría
        console.log('\n3. 🔍 Buscando productos por categoría "suplementos"...');
        const suplementosResponse = await axios.get(`${baseURL}/productos/categoria/suplementos`, {
            headers: authHeaders
        });
        console.log(`✅ ${suplementosResponse.data.data.length} suplementos encontrados`);

        // 4. Productos con stock bajo
        console.log('\n4. ⚠️ Verificando productos con stock bajo...');
        const stockBajoResponse = await axios.get(`${baseURL}/productos/stock-bajo`, {
            headers: authHeaders
        });
        console.log(`✅ ${stockBajoResponse.data.data.length} productos con stock bajo`);
        if (stockBajoResponse.data.data.length > 0) {
            console.log('Producto con stock más bajo:', stockBajoResponse.data.data[0].nombre, 'Stock:', stockBajoResponse.data.data[0].stock_actual);
        }

        // 5. Buscar productos
        console.log('\n5. 🔎 Buscando productos con "proteína"...');
        const searchResponse = await axios.get(`${baseURL}/productos/buscar/proteína`, {
            headers: authHeaders
        });
        console.log(`✅ ${searchResponse.data.data.length} productos encontrados con "proteína"`);

        // 6. Obtener estadísticas
        console.log('\n6. 📊 Obteniendo estadísticas de productos...');
        const statsResponse = await axios.get(`${baseURL}/productos/stats`, {
            headers: authHeaders
        });
        console.log('✅ Estadísticas:', {
            total: statsResponse.data.data.total_productos,
            stockBajo: statsResponse.data.data.stock_bajo,
            valorInventario: statsResponse.data.data.valor_inventario,
            categorias: statsResponse.data.data.por_categoria
        });

        // 7. Crear nuevo producto
        console.log('\n7. ➕ Creando nuevo producto...');
        const nuevoProducto = {
            nombre: 'Producto de Prueba',
            codigo_barras: '1234567890123',
            descripcion: 'Producto creado para pruebas',
            categoria: 'accesorios',
            precio_compra: 10000,
            precio_venta: 18000,
            stock_actual: 10,
            stock_minimo: 2,
            proveedor: 'Proveedor Test'
        };

        const createResponse = await axios.post(`${baseURL}/productos`, nuevoProducto, {
            headers: authHeaders
        });
        console.log('✅ Producto creado:', createResponse.data.data.nombre, 'ID:', createResponse.data.data.id);
        const productoId = createResponse.data.data.id;

        // 8. Actualizar stock
        console.log('\n8. 📈 Actualizando stock del producto...');
        const stockUpdateResponse = await axios.put(`${baseURL}/productos/${productoId}/stock`, {
            cantidad: 5,
            operacion: 'suma'
        }, {
            headers: authHeaders
        });
        console.log('✅ Stock actualizado. Nuevo stock:', stockUpdateResponse.data.data.stock_actual);

        // 9. Buscar por código de barras
        console.log('\n9. 🏷️ Buscando por código de barras...');
        const barcodeResponse = await axios.get(`${baseURL}/productos/barcode/1234567890123`, {
            headers: authHeaders
        });
        console.log('✅ Producto encontrado por código de barras:', barcodeResponse.data.data.nombre);

        // 10. Actualizar producto
        console.log('\n10. ✏️ Actualizando producto...');
        const updateResponse = await axios.put(`${baseURL}/productos/${productoId}`, {
            nombre: 'Producto de Prueba Actualizado',
            precio_venta: 20000
        }, {
            headers: authHeaders
        });
        console.log('✅ Producto actualizado:', updateResponse.data.data.nombre);

        // 11. Eliminar producto
        console.log('\n11. 🗑️ Eliminando producto de prueba...');
        const deleteResponse = await axios.delete(`${baseURL}/productos/${productoId}`, {
            headers: authHeaders
        });
        console.log('✅ Producto eliminado:', deleteResponse.data.message);

        console.log('\n🎉 ¡Todas las pruebas de productos pasaron exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testProductos();

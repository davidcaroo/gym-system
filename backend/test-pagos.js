const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

class PagosTestSuite {
    constructor() {
        this.sessionId = null;
        this.cookieString = '';
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async login() {
        try {
            console.log('🔑 Iniciando sesión...');
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                username: 'admin',
                password: 'admin123'
            });

            if (response.data.success) {
                // Extraer cookie de sesión
                const cookies = response.headers['set-cookie'];
                if (cookies) {
                    this.cookieString = cookies.join('; ');
                }
                console.log('✅ Login exitoso');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error en login:', error.response?.data || error.message);
            return false;
        }
    }

    async makeRequest(method, url, data = null) {
        try {
            const config = {
                method,
                url: `${BASE_URL}${url}`,
                headers: {
                    'Cookie': this.cookieString,
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                config.data = data;
            }

            return await axios(config);
        } catch (error) {
            throw error;
        }
    }

    async test(description, testFn) {
        this.testResults.total++;
        try {
            console.log(`🧪 ${description}`);
            await testFn();
            console.log(`   ✅ PASÓ`);
            this.testResults.passed++;
        } catch (error) {
            console.log(`   ❌ FALLÓ: ${error.message}`);
            this.testResults.failed++;
        }
    }

    async runTests() {
        console.log('🚀 Iniciando pruebas del sistema de pagos\n');

        // Login inicial
        const loginSuccess = await this.login();
        if (!loginSuccess) {
            console.error('❌ No se pudo hacer login. Abortando pruebas.');
            return;
        }

        console.log('\n📋 PRUEBAS DEL SISTEMA DE PAGOS');
        console.log('================================');

        // Test 1: Obtener todos los pagos
        await this.test('Obtener lista de pagos', async () => {
            const response = await this.makeRequest('GET', '/pagos');
            if (!response.data.success) throw new Error('Respuesta no exitosa');
            if (!Array.isArray(response.data.data.pagos)) throw new Error('No se retornó array de pagos');
            console.log(`   📊 ${response.data.data.pagos.length} pagos encontrados`);
            console.log(`   📈 Total en BD: ${response.data.data.total} registros`);
        });

        // Test 2: Crear nuevo pago
        let nuevoPagoId;
        await this.test('Crear nuevo pago', async () => {
            const nuevoPago = {
                miembro_id: 1,
                monto: 180000,
                fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                concepto: 'Membresía Premium - Test',
                metodo_pago: 'tarjeta',
                notas: 'Pago de prueba automatizada'
            };

            const response = await this.makeRequest('POST', '/pagos', nuevoPago);
            if (!response.data.success) throw new Error('No se pudo crear el pago');
            nuevoPagoId = response.data.data.id;
            console.log(`   💳 Pago creado con ID: ${nuevoPagoId}`);
            console.log(`   💰 Monto: $${response.data.data.monto.toLocaleString()}`);
        });

        // Test 3: Obtener pago por ID
        await this.test('Obtener pago específico', async () => {
            if (!nuevoPagoId) throw new Error('No hay ID de pago para buscar (Test 2 falló)');
            const response = await this.makeRequest('GET', `/pagos/${nuevoPagoId}`);
            if (!response.data.success) throw new Error('No se pudo obtener el pago');
            if (response.data.data.id !== nuevoPagoId) throw new Error('ID no coincide');
            console.log(`   🎯 Pago encontrado: ${response.data.data.concepto}`);
            console.log(`   👤 Miembro: ${response.data.data.nombre_miembro}`);
        });

        // Test 4: Filtrar pagos por miembro
        await this.test('Filtrar pagos por miembro', async () => {
            const response = await this.makeRequest('GET', '/pagos?miembro_id=1');
            if (!response.data.success) throw new Error('Error en filtro por miembro');
            console.log(`   👤 Pagos del miembro 1: ${response.data.data.pagos.length}`);
        });

        // Test 5: Filtrar pagos por estado
        await this.test('Filtrar pagos por estado', async () => {
            const response = await this.makeRequest('GET', '/pagos?estado=pagado');
            if (!response.data.success) throw new Error('Error en filtro por estado');
            console.log(`   💚 Pagos confirmados: ${response.data.data.pagos.length}`);
        });

        // Test 6: Obtener estadísticas de pagos
        await this.test('Obtener estadísticas generales', async () => {
            const response = await this.makeRequest('GET', '/pagos/estadisticas');
            if (!response.data.success) throw new Error('Error al obtener estadísticas');

            const stats = response.data.data;
            console.log(`   📊 Total pagos: ${stats.resumen.total_pagos}`);
            console.log(`   💰 Ingresos confirmados: $${stats.resumen.ingresos_confirmados.toLocaleString()}`);
            console.log(`   ⏳ Ingresos pendientes: $${stats.resumen.ingresos_pendientes.toLocaleString()}`);
            console.log(`   ⚠️  Ingresos vencidos: $${stats.resumen.ingresos_vencidos.toLocaleString()}`);
            console.log(`   📈 Pago promedio: $${stats.resumen.pago_promedio.toLocaleString()}`);
        });

        // Test 7: Obtener pagos próximos a vencer
        await this.test('Obtener pagos próximos a vencer', async () => {
            const response = await this.makeRequest('GET', '/pagos/proximos-vencer?dias=7');
            if (!response.data.success) throw new Error('Error al obtener pagos próximos a vencer');
            console.log(`   ⚠️  Pagos que vencen en 7 días: ${response.data.data.pagos.length}`);

            if (response.data.data.pagos.length > 0) {
                response.data.data.pagos.forEach(pago => {
                    console.log(`      - ${pago.nombre_miembro}: $${pago.monto.toLocaleString()} (vence: ${pago.fecha_vencimiento})`);
                });
            }
        });

        // Test 8: Historial de pagos de un miembro
        await this.test('Obtener historial de pagos de miembro', async () => {
            const response = await this.makeRequest('GET', '/pagos/miembro/1');
            if (!response.data.success) throw new Error('Error al obtener historial');
            console.log(`   📝 Historial del miembro 1: ${response.data.data.historial.length} pagos`);
        });

        // Test 9: Actualizar estado de pago
        await this.test('Actualizar estado de pago', async () => {
            if (!nuevoPagoId) throw new Error('No hay ID de pago para actualizar (Test 2 falló)');
            const response = await this.makeRequest('PUT', `/pagos/${nuevoPagoId}/estado`, {
                estado: 'pendiente',
                notas: 'Pago marcado como pendiente para prueba'
            });
            if (!response.data.success) throw new Error('No se pudo actualizar el estado');
            console.log(`   🔄 Estado actualizado a: ${response.data.data.estado}`);
        });

        // Test 10: Renovar membresía
        await this.test('Renovar membresía de miembro', async () => {
            const response = await this.makeRequest('POST', '/pagos/renovar-membresia', {
                miembro_id: 2,
                tipo_membresia_id: 2
            });
            if (!response.data.success) throw new Error('No se pudo renovar la membresía');
            console.log(`   🔄 Membresía renovada para miembro 2`);
            console.log(`   💰 Nuevo pago: $${response.data.data.monto.toLocaleString()}`);
            console.log(`   📅 Vence: ${response.data.data.fecha_vencimiento}`);
        });

        // Test 11: Marcar pagos vencidos
        await this.test('Marcar pagos vencidos automáticamente', async () => {
            const response = await this.makeRequest('POST', '/pagos/marcar-vencidos');
            if (!response.data.success) throw new Error('Error al marcar pagos vencidos');
            console.log(`   ⏰ ${response.data.data.pagos_marcados} pagos marcados como vencidos`);
        });

        // Test 12: Filtros avanzados con paginación
        await this.test('Filtros avanzados con paginación', async () => {
            const response = await this.makeRequest('GET', '/pagos?limite=5&offset=0&metodo_pago=efectivo');
            if (!response.data.success) throw new Error('Error en filtros avanzados');
            console.log(`   📄 Página 1: ${response.data.data.pagos.length} pagos (método: efectivo)`);
            console.log(`   📊 Total: ${response.data.data.total} registros`);
        });

        // Test 13: Estadísticas por rango de fechas
        await this.test('Estadísticas por rango de fechas', async () => {
            const fechaDesde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const fechaHasta = new Date().toISOString().split('T')[0];

            const response = await this.makeRequest('GET', `/pagos/estadisticas?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`);
            if (!response.data.success) throw new Error('Error en estadísticas por fechas');

            const stats = response.data.data;
            console.log(`   📅 Período: ${fechaDesde} a ${fechaHasta}`);
            console.log(`   💰 Ingresos del período: $${stats.resumen.ingresos_confirmados.toLocaleString()}`);
        });

        // Resumen final
        console.log('\n📊 RESUMEN DE PRUEBAS');
        console.log('====================');
        console.log(`✅ Pruebas exitosas: ${this.testResults.passed}`);
        console.log(`❌ Pruebas fallidas: ${this.testResults.failed}`);
        console.log(`📊 Total ejecutadas: ${this.testResults.total}`);
        console.log(`📈 Tasa de éxito: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);

        if (this.testResults.failed === 0) {
            console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
            console.log('💳 Sistema de pagos y membresías funcionando correctamente');
        } else {
            console.log('\n⚠️  Algunas pruebas fallaron. Revisar implementación.');
        }
    }
}

// Ejecutar las pruebas
const testSuite = new PagosTestSuite();
testSuite.runTests().catch(console.error);

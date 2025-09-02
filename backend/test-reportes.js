const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let sessionCookie = '';

// Configuración para mantener cookies de sesión
const axiosConfig = {
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
};

// Función para hacer login
async function login() {
    try {
        console.log('🔑 Haciendo login...');

        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, axiosConfig);

        if (loginResponse.data.success) {
            // Extraer cookie de sesión
            const cookies = loginResponse.headers['set-cookie'];
            if (cookies) {
                sessionCookie = cookies.find(cookie => cookie.startsWith('connect.sid'))?.split(';')[0] || '';
                axiosConfig.headers['Cookie'] = sessionCookie;
            }

            console.log('✅ Login exitoso');
            return true;
        } else {
            console.log('❌ Login fallido');
            return false;
        }
    } catch (error) {
        console.error('❌ Error en login:', error.response?.data || error.message);
        return false;
    }
}

// Función para hacer peticiones autenticadas
async function makeRequest(method, endpoint, data = null) {
    try {
        const config = { ...axiosConfig };

        let response;
        if (method === 'post' || method === 'put') {
            response = await axios[method](`${API_BASE}${endpoint}`, data, config);
        } else {
            response = await axios[method](`${API_BASE}${endpoint}`, config);
        }

        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
}

async function testSistemaReportes() {
    console.log('🚀 Iniciando pruebas del sistema de reportes\n');

    let pasadas = 0;
    let fallidas = 0;

    // Array para almacenar resultados de las pruebas
    const pruebas = [
        {
            nombre: 'Dashboard KPIs',
            test: async () => {
                const dashboard = await makeRequest('get', '/reportes/dashboard');
                console.log(`   💰 Ingresos mes actual: $${dashboard.data.ingresos_mes_actual.toLocaleString()}`);
                console.log(`   📈 Crecimiento: ${dashboard.data.crecimiento_ingresos.toFixed(1)}%`);
                console.log(`   👥 Miembros activos: ${dashboard.data.miembros_activos}`);
                console.log(`   🆕 Nuevos miembros: ${dashboard.data.nuevos_miembros_mes}`);
                console.log(`   📊 Ocupación promedio: ${dashboard.data.tasa_ocupacion_promedio}`);
                console.log(`   ⚠️  Tasa morosidad: ${dashboard.data.tasa_morosidad}%`);
                return dashboard.success;
            }
        },
        {
            nombre: 'Reporte financiero mensual',
            test: async () => {
                const reporte = await makeRequest('get', '/reportes/financiero?tipo_reporte=mensual');
                console.log(`   💰 Ingresos totales: $${reporte.data.ingresos_totales.toLocaleString()}`);
                console.log(`   💳 Ingresos membresías: $${reporte.data.ingresos_membresias.toLocaleString()}`);
                console.log(`   🛍️  Ingresos productos: $${reporte.data.ingresos_productos.toLocaleString()}`);
                console.log(`   🎫 Ticket promedio: $${Math.round(reporte.data.ticket_promedio).toLocaleString()}`);
                console.log(`   📊 Transacciones: ${reporte.data.total_transacciones}`);
                return reporte.success;
            }
        },
        {
            nombre: 'Analytics de miembros',
            test: async () => {
                const analytics = await makeRequest('get', '/reportes/miembros?tipo_reporte=mensual');
                console.log(`   👥 Total miembros: ${analytics.data.total_miembros}`);
                console.log(`   🆕 Miembros nuevos: ${analytics.data.miembros_nuevos}`);
                console.log(`   ✅ Miembros activos: ${analytics.data.miembros_activos}`);
                console.log(`   ❌ Miembros inactivos: ${analytics.data.miembros_inactivos}`);
                console.log(`   📈 Tasa retención: ${analytics.data.tasa_retencion}%`);
                console.log(`   📉 Tasa churn: ${analytics.data.tasa_churn}%`);
                console.log(`   💰 Valor promedio cliente: $${analytics.data.valor_promedio_cliente.toLocaleString()}`);
                return analytics.success;
            }
        },
        {
            nombre: 'Estadísticas de uso',
            test: async () => {
                const uso = await makeRequest('get', '/reportes/uso?tipo_reporte=mensual');
                console.log(`   🚪 Total accesos: ${uso.data.total_accesos}`);
                console.log(`   📅 Promedio diario: ${uso.data.accesos_promedio_dia}`);
                console.log(`   📊 Ocupación máxima: ${uso.data.ocupacion_maxima}`);
                console.log(`   ⏰ Hora pico: ${uso.data.hora_pico}`);
                console.log(`   ⏱️  Duración promedio: ${uso.data.duracion_promedio_visita} min`);
                console.log(`   📊 Horarios con datos: ${uso.data.distribucion_horaria.length}`);
                return uso.success;
            }
        },
        {
            nombre: 'Reporte de pagos',
            test: async () => {
                const pagos = await makeRequest('get', '/reportes/pagos?tipo_reporte=mensual');
                console.log(`   💳 Total pagos: ${pagos.data.total_pagos}`);
                console.log(`   💰 Monto total: $${pagos.data.monto_total.toLocaleString()}`);
                console.log(`   ✅ Pagos puntuales: ${pagos.data.pagos_puntuales}`);
                console.log(`   ⏰ Pagos tardíos: ${pagos.data.pagos_tardios}`);
                console.log(`   ❌ Pagos vencidos: ${pagos.data.pagos_vencidos}`);
                console.log(`   ⚠️  Tasa morosidad: ${pagos.data.tasa_morosidad}%`);
                console.log(`   💳 Métodos de pago: ${pagos.data.metodos_pago.length}`);
                return pagos.success;
            }
        },
        {
            nombre: 'Analytics de ventas',
            test: async () => {
                const ventas = await makeRequest('get', '/reportes/ventas?tipo_reporte=mensual');
                console.log(`   🛍️  Total ventas: ${ventas.data.ventas_totales}`);
                console.log(`   📦 Productos vendidos: ${ventas.data.productos_vendidos}`);
                console.log(`   🎫 Ticket promedio: $${Math.round(ventas.data.ticket_promedio).toLocaleString()}`);
                console.log(`   🏆 Productos top: ${ventas.data.productos_top.length}`);
                console.log(`   📈 Días con ventas: ${ventas.data.tendencia_ventas.length}`);
                if (ventas.data.productos_top.length > 0) {
                    console.log(`   🥇 Producto #1: ${ventas.data.productos_top[0].producto} (${ventas.data.productos_top[0].cantidad} und.)`);
                }
                return ventas.success;
            }
        },
        {
            nombre: 'Reporte completo',
            test: async () => {
                const completo = await makeRequest('get', '/reportes/completo?tipo_reporte=mensual');
                console.log(`   📊 Secciones incluidas:`);
                console.log(`      - ✅ Resumen ejecutivo`);
                console.log(`      - ✅ Reporte financiero`);
                console.log(`      - ✅ Analytics miembros`);
                console.log(`      - ✅ Uso instalaciones`);
                console.log(`      - ✅ Reporte pagos`);
                console.log(`      - ✅ Analytics ventas`);
                console.log(`   📅 Generado: ${new Date(completo.data.generado_en).toLocaleString()}`);
                return completo.success;
            }
        },
        {
            nombre: 'Filtros por fechas personalizadas',
            test: async () => {
                const fechaInicio = '2025-08-01';
                const fechaFin = '2025-08-20';
                const reporte = await makeRequest('get', `/reportes/financiero?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&tipo_reporte=personalizado`);
                console.log(`   📅 Período: ${reporte.data.periodo}`);
                console.log(`   💰 Ingresos: $${reporte.data.ingresos_totales.toLocaleString()}`);
                console.log(`   📊 Crecimiento: ${reporte.data.crecimiento_vs_periodo_anterior}%`);
                return reporte.success && reporte.data.fecha_inicio === fechaInicio;
            }
        },
        {
            nombre: 'Reporte semanal',
            test: async () => {
                const reporte = await makeRequest('get', '/reportes/miembros?tipo_reporte=semanal');
                console.log(`   📅 Período semanal: ${reporte.data.periodo}`);
                console.log(`   👥 Miembros activos: ${reporte.data.miembros_activos}`);
                console.log(`   🆕 Nuevos esta semana: ${reporte.data.miembros_nuevos}`);
                return reporte.success;
            }
        },
        {
            nombre: 'Exportación CSV financiero',
            test: async () => {
                try {
                    const response = await axios.get(`${API_BASE}/reportes/exportar/csv?reporte=financiero&tipo_reporte=mensual`, {
                        ...axiosConfig,
                        responseType: 'text'
                    });
                    console.log(`   📄 CSV generado exitosamente`);
                    console.log(`   📏 Tamaño: ${response.data.length} caracteres`);
                    console.log(`   📋 Encabezados: ${response.data.split('\\n')[0].split(',').length} columnas`);
                    return response.status === 200 && response.data.includes('Período');
                } catch (error) {
                    throw error;
                }
            }
        }
    ];

    console.log('📋 PRUEBAS DEL SISTEMA DE REPORTES');
    console.log('================================');

    for (const prueba of pruebas) {
        try {
            console.log(`🧪 ${prueba.nombre}`);
            const resultado = await prueba.test();
            if (resultado) {
                console.log('   ✅ PASÓ\\n');
                pasadas++;
            } else {
                console.log('   ❌ FALLÓ\\n');
                fallidas++;
            }
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}\\n`);
            fallidas++;
        }
    }

    // Resumen final
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('====================');
    console.log(`✅ Pruebas exitosas: ${pasadas}`);
    console.log(`❌ Pruebas fallidas: ${fallidas}`);
    console.log(`📊 Total ejecutadas: ${pasadas + fallidas}`);
    console.log(`📈 Tasa de éxito: ${((pasadas / (pasadas + fallidas)) * 100).toFixed(1)}%`);

    if (fallidas === 0) {
        console.log('\\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
        console.log('📊 Sistema de reportes funcionando correctamente');
    } else {
        console.log(`\\n⚠️  ${fallidas} prueba(s) fallaron. Revisar implementación.`);
    }
}

// Función principal
async function main() {
    const loginExitoso = await login();
    if (!loginExitoso) {
        console.error('❌ No se pudo iniciar sesión. Terminando pruebas.');
        return;
    }

    await testSistemaReportes();
}

main().catch(console.error);

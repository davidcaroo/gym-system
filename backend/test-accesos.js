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

async function testSistemaAccesos() {
    console.log('🚀 Iniciando pruebas del sistema de accesos\n');

    let pasadas = 0;
    let fallidas = 0;

    // Array para almacenar resultados de las pruebas
    const pruebas = [
        {
            nombre: 'Obtener estadísticas de accesos',
            test: async () => {
                const stats = await makeRequest('get', '/accesos/estadisticas');
                console.log(`   📊 Accesos hoy: ${stats.data.total_accesos_hoy}`);
                console.log(`   📊 Accesos este mes: ${stats.data.total_accesos_mes}`);
                console.log(`   👥 Miembros actualmente dentro: ${stats.data.miembros_actualmente_dentro}`);
                console.log(`   ⏱️  Duración promedio hoy: ${stats.data.promedio_duracion_hoy} minutos`);
                console.log(`   ⏰ Hora pico: ${stats.data.hora_pico_hoy}`);
                return stats.success;
            }
        },
        {
            nombre: 'Obtener miembros actualmente dentro',
            test: async () => {
                const miembros = await makeRequest('get', '/accesos/dentro');
                console.log(`   👥 ${miembros.total} miembros dentro del gimnasio`);
                if (miembros.data.length > 0) {
                    miembros.data.slice(0, 3).forEach(m => {
                        console.log(`      - ${m.nombre_miembro} (${m.duracion_minutos} min)`);
                    });
                }
                return miembros.success;
            }
        },
        {
            nombre: 'Validar acceso con documento válido',
            test: async () => {
                const validacion = await makeRequest('get', '/accesos/validar/12345678');
                console.log(`   🎯 Miembro: ${validacion.data.miembro?.nombre || 'N/A'}`);
                console.log(`   ✅ Acceso permitido: ${validacion.data.permitido ? 'Sí' : 'No'}`);
                console.log(`   💭 Motivo: ${validacion.data.motivo}`);
                return validacion.success;
            }
        },
        {
            nombre: 'Validar acceso con documento inválido',
            test: async () => {
                const validacion = await makeRequest('get', '/accesos/validar/99999999');
                console.log(`   ❌ Acceso permitido: ${validacion.data.permitido ? 'Sí' : 'No'}`);
                console.log(`   💭 Motivo: ${validacion.data.motivo}`);
                return validacion.success && !validacion.data.permitido; // Debe ser false para pasar
            }
        },
        {
            nombre: 'Registrar entrada de miembro válido',
            test: async () => {
                try {
                    const entrada = await makeRequest('post', '/accesos/entrada', {
                        documento: '87654321'
                    });
                    console.log(`   ✅ Entrada registrada para: ${entrada.data.miembro.nombre}`);
                    console.log(`   🕐 Hora entrada: ${new Date(entrada.data.acceso.fecha_entrada).toLocaleTimeString()}`);
                    return entrada.success;
                } catch (error) {
                    if (error.message.includes('ya se encuentra dentro')) {
                        console.log(`   ⚠️  Miembro ya está dentro (esperado en algunos casos)`);
                        return true; // Es válido que ya esté dentro
                    }
                    throw error;
                }
            }
        },
        {
            nombre: 'Intentar entrada duplicada',
            test: async () => {
                try {
                    await makeRequest('post', '/accesos/entrada', {
                        documento: '87654321'
                    });
                    console.log(`   ❌ Entrada duplicada no fue rechazada`);
                    return false;
                } catch (error) {
                    if (error.message.includes('ya se encuentra dentro')) {
                        console.log(`   ✅ Entrada duplicada correctamente rechazada`);
                        return true;
                    }
                    throw error;
                }
            }
        },
        {
            nombre: 'Registrar salida de miembro',
            test: async () => {
                const salida = await makeRequest('post', '/accesos/salida', {
                    documento: '87654321'
                });
                console.log(`   ✅ Salida registrada para: ${salida.data.miembro.nombre}`);
                console.log(`   🕐 Hora salida: ${new Date(salida.data.acceso.fecha_salida).toLocaleTimeString()}`);
                return salida.success;
            }
        },
        {
            nombre: 'Intentar salida sin entrada previa',
            test: async () => {
                try {
                    await makeRequest('post', '/accesos/salida', {
                        documento: '87654321'
                    });
                    console.log(`   ❌ Salida sin entrada no fue rechazada`);
                    return false;
                } catch (error) {
                    if (error.message.includes('No se encontró registro de entrada')) {
                        console.log(`   ✅ Salida sin entrada correctamente rechazada`);
                        return true;
                    }
                    throw error;
                }
            }
        },
        {
            nombre: 'Obtener historial de accesos',
            test: async () => {
                const historial = await makeRequest('get', '/accesos/historial?limit=10');
                console.log(`   📝 ${historial.data.length} registros de acceso encontrados`);
                console.log(`   📊 Total en BD: ${historial.pagination.total}`);
                return historial.success;
            }
        },
        {
            nombre: 'Filtrar accesos por miembro específico',
            test: async () => {
                const accesos = await makeRequest('get', '/accesos/historial?miembro_id=1&limit=5');
                console.log(`   👤 Accesos del miembro 1: ${accesos.data.length}`);
                return accesos.success;
            }
        },
        {
            nombre: 'Filtrar accesos por fecha',
            test: async () => {
                const hoy = new Date().toISOString().split('T')[0];
                const accesos = await makeRequest('get', `/accesos/historial?fecha_inicio=${hoy}&fecha_fin=${hoy}`);
                console.log(`   📅 Accesos de hoy: ${accesos.data.length}`);
                return accesos.success;
            }
        },
        {
            nombre: 'Verificar estado de acceso de miembro específico',
            test: async () => {
                const estado = await makeRequest('get', '/accesos/miembro/1');
                const dentroStatus = estado.data ? 'DENTRO' : 'FUERA';
                console.log(`   🏠 Miembro 1 está: ${dentroStatus}`);
                if (estado.data) {
                    console.log(`   ⏱️  Tiempo dentro: ${estado.data.duracion_minutos} minutos`);
                }
                return estado.success;
            }
        }
    ];

    console.log('📋 PRUEBAS DEL SISTEMA DE ACCESOS');
    console.log('================================');

    for (let i = 0; i < pruebas.length; i++) {
        const prueba = pruebas[i];
        try {
            console.log(`🧪 ${prueba.nombre}`);
            const resultado = await prueba.test();

            if (resultado) {
                console.log('   ✅ PASÓ');
                pasadas++;
            } else {
                console.log('   ❌ FALLÓ');
                fallidas++;
            }
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            fallidas++;
        }
        console.log('');
    }

    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('====================');
    console.log(`✅ Pruebas exitosas: ${pasadas}`);
    console.log(`❌ Pruebas fallidas: ${fallidas}`);
    console.log(`📊 Total ejecutadas: ${pasadas + fallidas}`);
    console.log(`📈 Tasa de éxito: ${((pasadas / (pasadas + fallidas)) * 100).toFixed(1)}%`);

    if (fallidas === 0) {
        console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
        console.log('🚪 Sistema de accesos funcionando correctamente');
    } else {
        console.log(`\n⚠️  ${fallidas} prueba(s) fallaron. Revisar implementación.`);
    }
}

// Ejecutar las pruebas
login()
    .then(success => {
        if (success) {
            return testSistemaAccesos();
        } else {
            console.log('❌ No se pudo autenticar. Verifica que el servidor esté corriendo.');
        }
    })
    .catch(error => {
        console.error('💥 Error durante las pruebas:', error.message);
    });

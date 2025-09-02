const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let sessionCookie = '';

const axiosConfig = {
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
};

async function login() {
    try {
        console.log('🔑 Haciendo login...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, axiosConfig);

        if (loginResponse.data.success) {
            const cookies = loginResponse.headers['set-cookie'];
            if (cookies) {
                sessionCookie = cookies.find(cookie => cookie.startsWith('connect.sid'))?.split(';')[0] || '';
                axiosConfig.headers['Cookie'] = sessionCookie;
            }
            console.log('✅ Login exitoso');
            return true;
        }
    } catch (error) {
        console.error('❌ Error en login:', error.response?.data || error.message);
        return false;
    }
}

async function testCSV() {
    try {
        console.log('🧪 Probando CSV con diferentes parámetros...');

        // Test 1: Con el parámetro correcto
        console.log('\\n1. Probando con reporte=financiero&tipo_reporte=mensual');
        try {
            const response1 = await axios.get(`${API_BASE}/reportes/exportar/csv?reporte=financiero&tipo_reporte=mensual`, {
                ...axiosConfig,
                responseType: 'text'
            });
            console.log('✅ Exitoso:', response1.status, response1.data.substring(0, 100) + '...');
        } catch (error) {
            console.log('❌ Error:', error.response?.status, error.response?.data);
        }

        // Test 2: Solo con reporte
        console.log('\\n2. Probando solo con reporte=financiero');
        try {
            const response2 = await axios.get(`${API_BASE}/reportes/exportar/csv?reporte=financiero`, {
                ...axiosConfig,
                responseType: 'text'
            });
            console.log('✅ Exitoso:', response2.status, response2.data.substring(0, 100) + '...');
        } catch (error) {
            console.log('❌ Error:', error.response?.status, error.response?.data);
        }

        // Test 3: Ver qué parámetros recibe el endpoint
        console.log('\\n3. Probando con parámetros incorrectos para ver el mensaje de error');
        try {
            const response3 = await axios.get(`${API_BASE}/reportes/exportar/csv?tipo_reporte=financiero`, {
                ...axiosConfig,
                responseType: 'text'
            });
            console.log('✅ Exitoso:', response3.status, response3.data.substring(0, 100) + '...');
        } catch (error) {
            console.log('❌ Error esperado:', error.response?.status, error.response?.data);
        }

    } catch (error) {
        console.error('Error general:', error.message);
    }
}

async function main() {
    const loginExitoso = await login();
    if (!loginExitoso) {
        console.error('❌ No se pudo iniciar sesión');
        return;
    }

    await testCSV();
}

main().catch(console.error);

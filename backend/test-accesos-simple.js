const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAccessosSinAuth() {
    console.log('🧪 Probando endpoints de accesos SIN autenticación');

    try {
        // Test 1: Validar acceso (debería funcionar)
        console.log('\n1. Validando acceso con documento válido...');
        const validacion = await axios.get(`${API_BASE}/accesos/validar/12345678`);
        console.log('✅ Validación exitosa:', validacion.data);

        // Test 2: Registrar entrada (debería funcionar)
        console.log('\n2. Registrando entrada...');
        const entrada = await axios.post(`${API_BASE}/accesos/entrada`, {
            documento: '87654321'
        });
        console.log('✅ Entrada registrada:', entrada.data);

        // Test 3: Registrar salida (debería funcionar)
        console.log('\n3. Registrando salida...');
        const salida = await axios.post(`${API_BASE}/accesos/salida`, {
            documento: '87654321'
        });
        console.log('✅ Salida registrada:', salida.data);

    } catch (error) {
        console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
    }
}

testAccessosSinAuth();

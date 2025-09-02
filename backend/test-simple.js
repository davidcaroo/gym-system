const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testSimple() {
    try {
        console.log('🔑 Haciendo login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });

        if (!loginResponse.data.success) {
            console.error('❌ Login falló');
            return;
        }

        // Extraer cookie de sesión
        const cookies = loginResponse.headers['set-cookie'];
        const cookieString = cookies ? cookies.join('; ') : '';
        console.log('✅ Login exitoso');

        console.log('\n🧪 Probando crear pago...');

        const nuevoPago = {
            miembro_id: 1,
            monto: 180000,
            fecha_vencimiento: '2025-09-20',
            concepto: 'Test Simple',
            metodo_pago: 'efectivo',
            notas: 'Prueba básica'
        };

        console.log('📤 Enviando datos:', nuevoPago);

        const pagoResponse = await axios.post(`${BASE_URL}/pagos`, nuevoPago, {
            headers: {
                'Cookie': cookieString,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Respuesta exitosa:', pagoResponse.data);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error('📊 Status:', error.response.status);
            console.error('📋 Headers:', error.response.headers);
        }
    }
}

testSimple();

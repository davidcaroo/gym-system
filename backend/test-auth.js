// Script de prueba para la autenticación
// Ejecutar: node test-auth.js

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testAuth() {
    console.log('🧪 Iniciando pruebas de autenticación...\n');

    try {
        // 1. Probar login con credenciales correctas
        console.log('1. 🔐 Probando login con credenciales correctas...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, {
            withCredentials: true
        });

        console.log('✅ Login exitoso:', loginResponse.data);
        const cookies = loginResponse.headers['set-cookie'];

        // 2. Probar acceso a ruta protegida sin autenticación
        console.log('\n2. 🚫 Probando acceso a ruta protegida sin autenticación...');
        try {
            await axios.get(`${baseURL}/miembros`);
            console.log('❌ ERROR: Debería haber fallado');
        } catch (error) {
            console.log('✅ Acceso denegado correctamente:', error.response.data);
        }

        // 3. Probar acceso a ruta protegida con autenticación
        console.log('\n3. 🔓 Probando acceso a ruta protegida con autenticación...');
        const protectedResponse = await axios.get(`${baseURL}/miembros`, {
            headers: {
                'Cookie': cookies[0]
            }
        });
        console.log('✅ Acceso autorizado:', protectedResponse.data);

        // 4. Probar verificación de sesión
        console.log('\n4. ✔️ Probando verificación de sesión...');
        const verifyResponse = await axios.get(`${baseURL}/auth/verify`, {
            headers: {
                'Cookie': cookies[0]
            }
        });
        console.log('✅ Sesión verificada:', verifyResponse.data);

        // 5. Probar logout
        console.log('\n5. 👋 Probando logout...');
        const logoutResponse = await axios.post(`${baseURL}/auth/logout`, {}, {
            headers: {
                'Cookie': cookies[0]
            }
        });
        console.log('✅ Logout exitoso:', logoutResponse.data);

        // 6. Probar login con credenciales incorrectas
        console.log('\n6. ❌ Probando login con credenciales incorrectas...');
        try {
            await axios.post(`${baseURL}/auth/login`, {
                username: 'admin',
                password: 'wrongpassword'
            });
            console.log('❌ ERROR: Debería haber fallado');
        } catch (error) {
            console.log('✅ Login rechazado correctamente:', error.response.data);
        }

        console.log('\n🎉 ¡Todas las pruebas de autenticación pasaron exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    }
}

// Solo ejecutar si se instala axios
const exec = require('child_process').exec;
exec('npm list axios', (error, stdout, stderr) => {
    if (error) {
        console.log('📦 Instalando axios para las pruebas...');
        exec('npm install axios', (installError) => {
            if (installError) {
                console.error('❌ Error instalando axios:', installError);
                return;
            }
            testAuth();
        });
    } else {
        testAuth();
    }
});

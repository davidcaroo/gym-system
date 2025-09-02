const http = require('http');

let sessionCookie = '';

function login(callback) {
    const data = JSON.stringify({
        username: "admin",
        password: "admin123"
    });

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = http.request(options, (res) => {
        console.log('Login status:', res.statusCode);

        if (res.headers['set-cookie']) {
            sessionCookie = res.headers['set-cookie'][0].split(';')[0];
            console.log('Session cookie captured');
        }

        let body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            console.log('Login successful');
            callback();
        });
    });

    req.on('error', (error) => {
        console.error('Login error:', error);
    });

    req.write(data);
    req.end();
}

function createMember(memberData, callback) {
    const data = JSON.stringify(memberData);

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/miembros',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
            'Cookie': sessionCookie
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Create member ${memberData.nombre} status:`, res.statusCode);

        let body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            console.log(`Member ${memberData.nombre} response:`, body);
            callback();
        });
    });

    req.on('error', (error) => {
        console.error(`Error creating member ${memberData.nombre}:`, error);
        callback();
    });

    req.write(data);
    req.end();
}

// Datos de los 5 usuarios de prueba
const testUsers = [
    {
        nombre: "María Elena Rodríguez",
        email: "maria.rodriguez@email.com",
        telefono: "3001234567",
        fecha_registro: "2025-08-15",
        tipo_membresia_id: 1, // Diaria
        estado: "activo"
    },
    {
        nombre: "José Luis Hernández",
        email: "jose.hernandez@email.com",
        telefono: "3007654321",
        fecha_registro: "2025-08-20",
        tipo_membresia_id: 2, // Mensual
        estado: "activo"
    },
    {
        nombre: "Carmen Patricia Vega",
        email: "carmen.vega@email.com",
        telefono: "3009876543",
        fecha_registro: "2025-08-25",
        tipo_membresia_id: 3, // Trimestral
        estado: "activo"
    },
    {
        nombre: "Roberto Carlos Mendoza",
        email: "roberto.mendoza@email.com",
        telefono: "3005432109",
        fecha_registro: "2025-08-30",
        tipo_membresia_id: 4, // Anual
        estado: "inactivo"
    },
    {
        nombre: "Ana Sofía Torres",
        email: "ana.torres@email.com",
        telefono: "3002468013",
        fecha_registro: "2025-09-01",
        tipo_membresia_id: 2, // Mensual
        estado: "activo"
    }
];

function createAllUsers() {
    let currentIndex = 0;

    function createNext() {
        if (currentIndex >= testUsers.length) {
            console.log('\n✅ Todos los usuarios de prueba han sido creados!');
            console.log('Puedes verificarlos en la interfaz web.');
            return;
        }

        const user = testUsers[currentIndex];
        console.log(`\n🔄 Creando usuario ${currentIndex + 1}/5: ${user.nombre}`);

        createMember(user, () => {
            currentIndex++;
            setTimeout(createNext, 1000); // Esperar 1 segundo entre cada creación
        });
    }

    createNext();
}

// Ejecutar el script
console.log('🚀 Iniciando creación de usuarios de prueba...');
console.log('Asegúrate de que el backend esté ejecutándose en puerto 3001\n');

login(() => {
    console.log('\n📝 Creando 5 usuarios de prueba con diferentes membresías...');
    createAllUsers();
});

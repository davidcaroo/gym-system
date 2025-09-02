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
        if (res.headers['set-cookie']) {
            sessionCookie = res.headers['set-cookie'][0].split(';')[0];
        }

        let body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            console.log('✅ Login exitoso');
            callback();
        });
    });

    req.on('error', (error) => {
        console.error('❌ Error en login:', error);
    });

    req.write(data);
    req.end();
}

function updateMember(id, updateData, callback) {
    const data = JSON.stringify(updateData);

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: `/api/miembros/${id}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
            'Cookie': sessionCookie
        }
    };

    const req = http.request(options, (res) => {
        console.log(`📝 Actualizar miembro ID ${id} status:`, res.statusCode);

        let body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log(`✅ Miembro ID ${id} actualizado correctamente`);
            } else {
                console.log(`❌ Error actualizando miembro ID ${id}:`, body);
            }
            callback();
        });
    });

    req.on('error', (error) => {
        console.error(`❌ Error actualizando miembro ID ${id}:`, error);
        callback();
    });

    req.write(data);
    req.end();
}

// Actualizar los usuarios creados con sus membresías
const updates = [
    {
        id: 3,
        data: {
            nombre: "María Elena Rodríguez",
            email: "maria.rodriguez@email.com",
            telefono: "3001234567",
            tipo_membresia_id: 1,
            estado: "activo"
        }
    },
    {
        id: 4,
        data: {
            nombre: "José Luis Hernández",
            email: "jose.hernandez@email.com",
            telefono: "3007654321",
            tipo_membresia_id: 2,
            estado: "activo"
        }
    },
    {
        id: 5,
        data: {
            nombre: "Carmen Patricia Vega",
            email: "carmen.vega@email.com",
            telefono: "3009876543",
            tipo_membresia_id: 3,
            estado: "activo"
        }
    },
    {
        id: 6,
        data: {
            nombre: "Roberto Carlos Mendoza",
            email: "roberto.mendoza@email.com",
            telefono: "3005432109",
            tipo_membresia_id: 4,
            estado: "inactivo"
        }
    },
    {
        id: 7,
        data: {
            nombre: "Ana Sofía Torres",
            email: "ana.torres@email.com",
            telefono: "3002468013",
            tipo_membresia_id: 2,
            estado: "activo"
        }
    }
];

function updateAllUsers() {
    let currentIndex = 0;

    function updateNext() {
        if (currentIndex >= updates.length) {
            console.log('\n🎉 Todos los usuarios han sido actualizados con sus membresías!');
            console.log('Ahora puedes ver los datos completos en la interfaz web.');
            return;
        }

        const update = updates[currentIndex];
        console.log(`\n🔄 Actualizando usuario ${currentIndex + 1}/5: ${update.data.nombre}`);

        updateMember(update.id, update.data, () => {
            currentIndex++;
            setTimeout(updateNext, 500);
        });
    }

    updateNext();
}

// Ejecutar el script
console.log('🔧 Actualizando usuarios con sus membresías...');

login(() => {
    updateAllUsers();
});

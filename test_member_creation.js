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

        // Capturar la cookie de sesión
        if (res.headers['set-cookie']) {
            sessionCookie = res.headers['set-cookie'][0].split(';')[0];
            console.log('Session cookie:', sessionCookie);
        }

        let body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            console.log('Login response:', body);
            callback();
        });
    });

    req.on('error', (error) => {
        console.error('Login error:', error);
    });

    req.write(data);
    req.end();
}

function createMember() {
    const data = JSON.stringify({
        nombre: "David Caro",
        email: "david@test.com",
        telefono: "123456789",
        documento: "12345678",
        fecha_nacimiento: "1990-01-01",
        tipo_membresia_id: 1,
        estado: "activo",
        direccion: "Calle 123",
        contacto_emergencia: "Maria Caro",
        telefono_emergencia: "987654321"
    });

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
        console.log('Create member status:', res.statusCode);

        let body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            console.log('Create member response:', body);
        });
    });

    req.on('error', (error) => {
        console.error('Create member error:', error);
    });

    req.write(data);
    req.end();
}

function getMemberships(callback) {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/membresias',
        method: 'GET',
        headers: {
            'Cookie': sessionCookie
        }
    };

    const req = http.request(options, (res) => {
        console.log('Get memberships status:', res.statusCode);

        let body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            console.log('Memberships available:', body);
            callback();
        });
    });

    req.on('error', (error) => {
        console.error('Get memberships error:', error);
    });

    req.end();
}

// Primero hacer login, luego obtener membresías, luego crear miembro
login(() => {
    getMemberships(() => {
        createMember();
    });
});
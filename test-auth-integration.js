// Test rápido de autenticación
const testAuth = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        const result = await response.json();
        console.log('Login result:', result);

        // Test verify
        const verifyResponse = await fetch('http://localhost:3001/api/auth/verify', {
            method: 'GET',
            credentials: 'include',
        });

        const verifyResult = await verifyResponse.json();
        console.log('Verify result:', verifyResult);

    } catch (error) {
        console.error('Error:', error);
    }
};

testAuth();

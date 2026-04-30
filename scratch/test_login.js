const axios = require('axios');

async function testLogin() {
    try {
        const res = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@college.edu',
            password: 'admin'
        });
        console.log('Login Success!');
        console.log('User:', res.data.name);
        console.log('Role:', res.data.role);
    } catch (err) {
        console.log('Login Failed:', err.response?.data?.message || err.message);
    }
}

testLogin();

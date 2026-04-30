const axios = require('axios');
require('dotenv').config({ path: './.env' });

async function testRoute() {
    const port = process.env.PORT || 5001;
    const url = `http://localhost:${port}/api/admin/assign-bus/69f0b5844ebc80802b28810a`;
    console.log('Testing PUT to:', url);
    
    try {
        // We don't have a token here, but we want to see if we get a 401/403 (route exists) or 404 (route doesn't exist)
        const res = await axios.put(url, {}, { validateStatus: false });
        console.log('Status:', res.status);
        console.log('Data:', res.data);
    } catch (err) {
        console.error('Network Error:', err.message);
    }
}

testRoute();

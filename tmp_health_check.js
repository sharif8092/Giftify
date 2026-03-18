const axios = require('axios');

async function checkHealth() {
    const urls = [
        'http://localhost:8080/api/health',
        'http://localhost:5173/api/health',
        'http://localhost:3000/api/health',
        'http://localhost:3002/api/health'
    ];
    
    for (const url of urls) {
        try {
            console.log(`Checking ${url}...`);
            const response = await axios.get(url, { timeout: 2000 });
            console.log(`[OK] ${url}:`, response.data);
        } catch (error) {
            console.log(`[FAIL] ${url}:`, error.message);
        }
    }
}

checkHealth();

const axios = require('axios');

async function testProductApi() {
    const id = '12';
    const url = `http://localhost:8080/api/woo/products/${id}`;
    
    console.log(`Testing API for Product ID ${id}...`);
    console.log(`URL: ${url}`);
    
    try {
        const response = await axios.get(url);
        console.log('Status:', response.status);
        console.log('Data Type:', typeof response.data);
        console.log('Is Array:', Array.isArray(response.data));
        
        if (response.data) {
            console.log('Product Name:', response.data.name);
            console.log('Product ID:', response.data.id);
            console.log('Images Count:', response.data.images ? response.data.images.length : 'N/A');
            // Log first few keys to see structure
            console.log('Keys:', Object.keys(response.data).slice(0, 10));
        } else {
            console.log('Response body is empty');
        }
    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.log('Error Data:', error.response.data);
        }
    }
}

testProductApi();

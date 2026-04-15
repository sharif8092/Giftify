import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const WC_URL = process.env.WC_URL;
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

console.log('--- Testing WooCommerce Connection ---');
console.log('URL:', WC_URL);
console.log('Key:', CONSUMER_KEY ? 'Present' : 'Missing');

const api = axios.create({
    baseURL: `${WC_URL}/wp-json/wc/v3`,
    params: {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
    },
});

async function test() {
    try {
        const res = await api.get('/products', { params: { per_page: 1 } });
        console.log('✅ SUCCESS!');
        console.log('Products found:', res.data.length);
        console.log('Sample:', res.data[0]?.name);
    } catch (err) {
        console.error('❌ FAILED');
        console.error('Status:', err.response?.status);
        console.error('Data:', JSON.stringify(err.response?.data, null, 2));
        console.error('Message:', err.message);
    }
}

test();

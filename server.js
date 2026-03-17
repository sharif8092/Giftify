import express from 'express';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// WooCommerce API Credentials
const WC_URL = process.env.WC_URL;
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

// Middleware to check for credentials
const checkCredentials = (req, res, next) => {
    if (!WC_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
        console.error('CRITICAL: Missing WooCommerce Environment Variables!');
        return res.status(400).json({ 
            error: 'Backend Configuration Error', 
            details: 'One or more environment variables (WC_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET) are missing on the server.' 
        });
    }
    next();
};

app.use('/api/woo', checkCredentials);

// Proxy Endpoints
const wooClient = axios.create({
    baseURL: `${WC_URL}/wp-json/wc/v3`,
    params: {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
    },
});

// WooCommerce Proxy Endpoints
app.get('/api/woo/products', async (req, res) => {
    try {
        const response = await wooClient.get('/products', { params: req.query });
        res.json(response.data);
    } catch (error) {
        console.error('WooCommerce API Error (Products):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch products' });
    }
});

app.get('/api/woo/products/:id', async (req, res) => {
    try {
        const response = await wooClient.get(`/products/${req.params.id}`, { params: req.query });
        res.json(response.data);
    } catch (error) {
        console.error(`WooCommerce API Error (Product ${req.params.id}):`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch product' });
    }
});

app.get('/api/woo/products/categories', async (req, res) => {
    try {
        const response = await wooClient.get('/products/categories', { params: req.query });
        res.json(response.data);
    } catch (error) {
        console.error('WooCommerce API Error (Categories):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch categories' });
    }
});

app.get('/api/woo/coupons', async (req, res) => {
    try {
        const response = await wooClient.get('/coupons', { params: req.query });
        res.json(response.data);
    } catch (error) {
        console.error('WooCommerce API Error (Coupons):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch coupons' });
    }
});

app.post('/api/woo/orders', async (req, res) => {
    try {
        const response = await wooClient.post('/orders', req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error('WooCommerce API Error (Orders):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to create order' });
    }
});

// Generalized WordPress Proxy (for Blog components)
const wpClient = axios.create({
    baseURL: `${WC_URL}/wp-json/wp/v2`,
});

app.get('/api/woo/wp/*', async (req, res) => {
    const subPath = req.params[0];
    console.log(`Fetching WP data: /wp-json/wp/v2/${subPath}`);
    try {
        const response = await wpClient.get(`/${subPath}`, { params: req.query });
        res.json(response.data);
    } catch (error) {
        console.error(`WordPress API Error (${subPath}):`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch WP data' });
    }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Giftify production server is running' });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

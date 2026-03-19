import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const WC_URL = process.env.WC_URL;
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

const wooCommerceClient = axios.create({
    baseURL: `${WC_URL}/wp-json/wc/v3`,
    params: {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
    },
});

const wpClient = axios.create({
    baseURL: `${WC_URL}/wp-json/wp/v2`,
    params: {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
    },
});

// GET products
router.get('/products', async (req, res) => {
    try {
        const response = await wooCommerceClient.get('/products', {
            params: req.query
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Error fetching products:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
    }
});

// GET categories
router.get('/products/categories', async (req, res) => {
    try {
        const response = await wooCommerceClient.get('/products/categories', {
            params: req.query
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Error fetching categories:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
    }
});

// GET customers (for tracking existing ones)
router.get('/customers', async (req, res) => {
    try {
        const response = await wooCommerceClient.get('/customers', { params: req.query });
        res.json(response.data);
    } catch (error: any) {
        console.error('WooCommerce API Error (Customers GET):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch customer' });
    }
});

// POST orders (used for quotations/orders)
router.post('/orders', async (req, res) => {
    try {
        const response = await wooCommerceClient.post('/orders', req.body);
        res.status(201).json(response.data);
    } catch (error: any) {
        console.error('Error creating order:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
    }
});

// POST customers (Signup)
router.post('/customers', async (req, res) => {
    try {
        const response = await wooCommerceClient.post('/customers', req.body);
        res.status(201).json(response.data);
    } catch (error: any) {
        console.error('Error creating customer:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
    }
});

// Generalized WP API proxy
router.get('/wp/*', async (req, res) => {
    const subPath = req.params[0];
    try {
        const response = await wpClient.get(`/${subPath}`, { params: req.query });
        res.json(response.data);
    } catch (error: any) {
        console.error(`Error fetching WP data (${subPath}):`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
    }
});

router.post('/wp/*', async (req, res) => {
    const subPath = req.params[0];
    try {
        const response = await wpClient.post(`/${subPath}`, req.body, { params: req.query });
        res.json(response.data);
    } catch (error: any) {
        console.error(`Error posting WP data (${subPath}):`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
    }
});

// POST users/lost-password (trigger email)
router.post('/wp/users/lost-password', async (req, res) => {
    try {
        const response = await wpClient.post('/users/lost-password', req.body);
        res.json(response.data);
    } catch (error: any) {
        console.error('WordPress API Error (Lost Password):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to trigger password reset' });
    }
});

// POST users/reset-password (set new password)
router.post('/wp/users/reset-password', async (req, res) => {
    try {
        const response = await wpClient.post('/users/reset-password', req.body);
        res.json(response.data);
    } catch (error: any) {
        console.error('WordPress API Error (Reset Password):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to reset password' });
    }
});

// JWT Auth Proxy
router.post('/jwt-auth/*', async (req, res) => {
    const subPath = req.params[0];
    try {
        const response = await axios.post(`${WC_URL}/wp-json/jwt-auth/${subPath}`, req.body);
        res.json(response.data);
    } catch (error: any) {
        console.error(`JWT Auth Error (${subPath}):`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Authentication failed' });
    }
});


// WP API proxy (for blogs etc if needed)
router.get('/wp-posts', async (req, res) => {
    try {
        const response = await wpClient.get('/posts', {
            params: req.query
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Error fetching posts:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
    }
});

export default router;

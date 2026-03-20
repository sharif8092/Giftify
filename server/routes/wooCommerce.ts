import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const WC_URL = process.env.WC_URL;
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

// Global Business Logic / Configuration
const GLOBAL_CONFIG = {
    bulk_pricing_tiers: [
        { min_qty: 1, discount: 0, label: 'Standard' },
        { min_qty: 25, discount: 10, label: 'Bronze' },
        { min_qty: 50, discount: 15, label: 'Silver' },
        { min_qty: 100, discount: 20, label: 'Gold' },
        { min_qty: 500, discount: 25, label: 'Platinum' }
    ],
    branding_options: [
        { name: 'None', price: 0 },
        { name: 'Screen Printing', price: 45 },
        { name: 'Laser Engraving', price: 65 },
        { name: 'Digital UV', price: 85 },
        { name: 'Embroidery', price: 120 }
    ],
    moq_default: 25,
    lead_time_default: '7-10 Working Days',
    sample_price_multiplier: 3
};

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

// GET single product
router.get('/products/:id', async (req, res) => {
    try {
        const response = await wooCommerceClient.get(`/products/${req.params.id}`, { params: req.query });
        res.json(response.data);
    } catch (error: any) {
        console.error(`WooCommerce API Error (Product ${req.params.id}):`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch product' });
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

// GET coupons
router.get('/coupons', async (req, res) => {
    try {
        const response = await wooCommerceClient.get('/coupons', { params: req.query });
        res.json(response.data);
    } catch (error: any) {
        console.error('WooCommerce API Error (Coupons):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch coupons' });
    }
});

// GET config
router.get('/config', (req, res) => {
    res.json(GLOBAL_CONFIG);
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

// GET order invoice PDF
router.get('/orders/:id/invoice', async (req, res) => {
    try {
        console.log(`Fetching PDF Invoice for Order #${req.params.id}`);
        // The REST API endpoint for WooCommerce PDF Invoices & Packing Slips
        const response = await wooCommerceClient.get(`/../../wpo/v1/pdf/invoice/${req.params.id}`, {
            responseType: 'arraybuffer',
            params: {
                ...wooCommerceClient.defaults.params,
            }
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${req.params.id}.pdf"`,
            'Content-Length': (response.data as any).length
        });

        res.send(response.data);
    } catch (error: any) {
        console.error(`Error fetching invoice for order ${req.params.id}:`, error.response?.data?.toString() || error.message);
        const status = error.response?.status || 500;
        const errorMessage = error.response?.data?.toString() || 'Failed to generate PDF invoice. Please ensure the "WooCommerce PDF Invoices & Packing Slips" plugin is active and its REST API is accessible.';
        res.status(status).json({ error: 'Invoice Generation Failed', details: errorMessage });
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

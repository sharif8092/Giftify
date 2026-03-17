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

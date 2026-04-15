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

// simple cache for ISR (60 seconds)
const wpCache = new Map();
const CACHE_TTL = 60 * 1000;

// Internal Linking Strategy - Utility for SEO
const INTERNAL_LINKS = [
    { text: 'Corporate Gifting India', url: '/corporate-gifting' },
    { text: 'Bulk Corporate Gifts for Employees', url: '/bulk-corporate-gifts' },
    { text: 'Customized Corporate Gifts', url: '/customized-corporate-gifts' }
];

function injectInternalLinks(content) {
    if (!content) return content;
    
    // Inject keyword-rich links naturally near the start, middle, and end
    const paragraphs = content.split('</p>');
    if (paragraphs.length < 3) return content + `<p>Explore our latest <a href="/corporate-gifting">Corporate Gifting India</a> collection for premium options.</p>`;

    // Natural placement: end of 1st or 2nd paragraph
    paragraphs[Math.min(1, paragraphs.length - 1)] += ` For high-quality solutions, discover our range of <a href="/corporate-gifting">Corporate Gifting India</a>.`;
    
    // Mid-content placement
    const mid = Math.floor(paragraphs.length / 2);
    paragraphs[mid] += ` We also specialize in <a href="/bulk-corporate-gifts">Bulk Corporate Gifts for Employees</a> to boost team morale.`;
    
    // Near-end placement
    if (paragraphs.length > 5) {
        paragraphs[paragraphs.length - 2] += ` Consider our bespoke <a href="/customized-corporate-gifts">Customized Corporate Gifts</a> to make your gestures unique.`;
    }

    return paragraphs.join('</p>');
}

// WooCommerce API Credentials
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
        console.error('WooCommerce API Error (Products):', {
            url: `${WC_URL}/wp-json/wc/v3/products`,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        res.status(error.response?.status || 500).json(error.response?.data || {
            error: 'Failed to fetch products',
            hint: `Check if WC_URL (${WC_URL}) is reachable and API keys are valid.`
        });
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

// Config Endpoint for Frontend
app.get('/api/woo/config', (req, res) => {
    res.json(GLOBAL_CONFIG);
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

// GET customers (for searching existing ones)
app.get('/api/woo/customers', async (req, res) => {
    try {
        const response = await wooClient.get('/customers', { params: req.query });
        res.json(response.data);
    } catch (error) {
        console.error('WooCommerce API Error (Customers GET):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch customer' });
    }
});

app.post('/api/woo/customers', async (req, res) => {
    try {
        const response = await wooClient.post('/customers', req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error('WooCommerce API Error (Customers):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to create customer' });
    }
});


app.get('/api/woo/orders/:id/invoice', async (req, res) => {
    try {
        console.log(`Fetching PDF Invoice for Order #${req.params.id}`);
        // The REST API endpoint for WooCommerce PDF Invoices & Packing Slips
        // Note: This relies on the plugin's REST API being available.
        const response = await wooClient.get(`/../../wpo/v1/pdf/invoice/${req.params.id}`, {
            responseType: 'arraybuffer',
            params: {
                ...wooClient.defaults.params,
                // Some versions might need extra params, but consumer_key/secret usually suffice
            }
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${req.params.id}.pdf"`,
            'Content-Length': response.data.length
        });

        res.send(response.data);
    } catch (error) {
        console.error(`Error fetching invoice for order ${req.params.id}:`, error.response?.data?.toString() || error.message);

        // Fallback or more detailed error
        const status = error.response?.status || 500;
        const errorMessage = error.response?.data?.toString() || 'Failed to generate PDF invoice. Please ensure the "WooCommerce PDF Invoices & Packing Slips" plugin is active and its REST API is accessible.';

        res.status(status).json({ error: 'Invoice Generation Failed', details: errorMessage });
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
        console.error(`WordPress API Error (GET ${subPath}):`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch WP data' });
    }
});

app.post('/api/woo/wp/*', async (req, res) => {
    const subPath = req.params[0];
    console.log(`Posting WP data: /wp-json/wp/v2/${subPath}`);
    try {
        const response = await wpClient.post(`/${subPath}`, req.body, { params: req.query });
        res.json(response.data);
    } catch (error) {
        console.error(`WordPress API Error (POST ${subPath}):`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to post WP data' });
    }
});

// WordPress Password Reset Proxy
app.post('/api/woo/wp/users/lost-password', async (req, res) => {
    try {
        const response = await wpClient.post('/users/lost-password', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('WordPress API Error (Lost Password):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to trigger password reset' });
    }
});

app.post('/api/woo/wp/users/reset-password', async (req, res) => {
    try {
        const response = await wpClient.post('/users/reset-password', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('WordPress API Error (Reset Password):', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to reset password' });
    }
});

// JWT Auth Proxy (Special case outside /wp/v2)
app.post('/api/woo/jwt-auth/*', async (req, res) => {
    const subPath = req.params[0];
    try {
        const response = await axios.post(`${WC_URL}/wp-json/jwt-auth/${subPath}`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error(`JWT Auth Error (${subPath}):`, error.response?.data || error.message);
        if (error.response?.status === 404) {
            return res.status(404).json({
                error: 'JWT Authentication Not Configured',
                message: 'The JWT Authentication plugin is missing or not active on the WordPress backend.'
            });
        }
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Authentication failed' });
    }
});


// Dynamic Sitemap Generation
app.get('/sitemap.xml', async (req, res) => {
    try {
        const [postsRes, productsRes] = await Promise.all([
            wpClient.get('/posts', { params: { per_page: 100 } }),
            wooClient.get('/products', { params: { per_page: 100, status: 'publish' } })
        ]);

        const posts = postsRes.data;
        const products = productsRes.data;

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://corporategifting.store/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://corporategifting.store/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://corporategifting.store/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://corporategifting.store/bulk-corporate-gifts</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://corporategifting.store/customized-corporate-gifts</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

        // Add Blog Posts
        posts.forEach(post => {
            sitemap += `
  <url>
    <loc>https://corporategifting.store/blog/${post.slug}</loc>
    <lastmod>${post.modified?.split('T')[0] || post.date?.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        // Add Products
        products.forEach(product => {
            sitemap += `
  <url>
    <loc>https://corporategifting.store/product/${product.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        sitemap += '\n</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Sitemap generation error:', error.message);
        res.status(500).send('Error generating sitemap');
    }
});

// SSR Route Handler for Individual Blog Posts - Optimized for Core Web Vitals
app.get('/blog/:slug', async (req, res) => {
    const { slug } = req.params;
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    
    if (!fs.existsSync(indexPath)) {
        return res.status(404).send('Not Found');
    }

    let html = fs.readFileSync(indexPath, 'utf8');
    
    try {
        const cacheKey = `post_ssr_v2_${slug}`;
        let postData = wpCache.get(cacheKey)?.data;

        // 1. Try Memory Cache
        if (!postData) {
            // 2. Try Filesystem Cache (Pre-rendered)
            const filePath = path.join(__dirname, 'dist', 'ssr-cache', `post_${slug}.json`);
            if (fs.existsSync(filePath)) {
                try {
                    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    if (Date.now() - fileContent.timestamp < CACHE_TTL * 10) { 
                        postData = fileContent.data;
                        wpCache.set(cacheKey, { data: postData, timestamp: fileContent.timestamp });
                    }
                } catch (e) { console.error('Error reading FS cache:', e); }
            }
        }

        if (!postData) {
            console.log(`Refreshing SSR cache for: ${slug}`);
            const [postRes, relatedRes] = await Promise.all([
                wpClient.get('/posts', { params: { slug, _embed: true } }),
                wpClient.get('/posts', { params: { per_page: 4, _embed: true } }) 
            ]);
            
            const post = postRes.data[0];
            const related = relatedRes.data.filter(p => p.slug !== slug).slice(0, 3);
            
            if (post) {
                postData = { post, related };
                wpCache.set(cacheKey, { data: postData, timestamp: Date.now() });
            }
        }

        if (postData) {
            const { post, related } = postData;
            const title = post.title?.rendered || 'Corporate Gifting';
            const rawExcerpt = post.excerpt?.rendered?.replace(/<[^>]*>?/gm, '') || 'Premium corporate gifting solutions.';
            const excerpt = rawExcerpt.substring(0, 160);
            const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://corporategifting.store/Hero14.jpg';
            const url = `https://corporategifting.store/blog/${slug}`;
            const author = post._embedded?.author?.[0]?.name || 'Admin';
            const dateStr = new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

            // 1. Meta Injection & LCP Preloading
            html = html.replace(/<title>.*?<\/title>/, `<title>${title} | Giftify Journal</title>`);
            
            // Preload primary LCP image
            const lcpPreload = `<link rel="preload" as="image" href="${image}" fetchpriority="high">`;
            
            const metaTags = `
                <meta name="description" content="${excerpt}" />
                <link rel="canonical" href="${url}" />
                <meta property="og:type" content="article" />
                <meta property="og:url" content="${url}" />
                <meta property="og:title" content="${title} | Giftify Journal" />
                <meta property="og:description" content="${excerpt}" />
                <meta property="og:image" content="${image}" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="${title} | Giftify Journal" />
                <meta name="twitter:description" content="${excerpt}" />
                <meta name="twitter:image" content="${image}" />
            `;

            // 2. Structured Data (Article, Org, Breadcrumb)
            const schemas = `
                <script type="application/ld+json">
                ${JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Article",
                  "headline": title,
                  "image": [image],
                  "datePublished": post.date,
                  "dateModified": post.modified,
                  "author": { "@type": "Person", "name": author },
                  "publisher": {
                    "@type": "Organization",
                    "name": "Giftify",
                    "logo": { "@type": "ImageObject", "url": "https://corporategifting.store/logo.png" }
                  }
                })}
                </script>
                <script type="application/ld+json">
                ${JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://corporategifting.store/" },
                    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://corporategifting.store/blog" },
                    { "@type": "ListItem", "position": 3, "name": title, "item": url }
                  ]
                })}
                </script>
            `;

            // 3. Hydration Data & Critical CSS
            const hydrationScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(postData)};</script>`;
            const criticalCss = `<style>
                .ssr-container { font-family: sans-serif; }
                .hero-header { height: 70vh; display: flex; align-items: center; justify-content: center; background: #000; overflow: hidden; }
                .blog-article { max-width: 800px; margin: -100px auto 100px; background: white; padding: 40px; border-radius: 3rem; }
            </style>`;

            html = html.replace('</head>', `${lcpPreload}${metaTags}${schemas}${hydrationScript}${criticalCss}</head>`);

            // 4. Pre-rendered HTML in #root (Optimized for CLS/LCP)
            const injectedContent = injectInternalLinks(post.content?.rendered);
            const relatedPostsHtml = related.map(p => `
                <div style="border: 1px solid #e5e7eb; border-radius: 1rem; overflow: hidden; background: white;">
                    <div style="aspect-ratio: 16/10; background: #f3f4f6; overflow: hidden;">
                        <img src="${p._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/Hero14.jpg'}" alt="${p.title.rendered}" loading="lazy" width="400" height="250" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    <div style="padding: 1rem;">
                        <p style="margin: 0; font-family: serif; font-size: 1.1rem; color: #111827;">${p.title.rendered}</p>
                        <a href="/blog/${p.slug}" style="color: #065f46; text-decoration: none; font-weight: bold; font-size: 0.8rem; text-transform: uppercase; margin-top: 1rem; display: inline-block;">Read Story →</a>
                    </div>
                </div>
            `).join('');

            const ssrContent = `
                <div class="ssr-container" style="background: #fdfbf7; min-height: 100vh;">
                    <header class="hero-header" style="height: 70vh; position: relative;">
                        <img src="${image}" fetchpriority="high" decoding="async" width="1200" height="800" style="position: absolute; width: 100%; height: 100%; object-fit: cover; opacity: 0.6;" />
                        <div style="position: relative; z-index: 10; text-align: center; color: white; padding: 0 20px;">
                            <h1 style="font-size: clamp(2rem, 8vw, 5rem); font-family: serif; margin: 0;">${title}</h1>
                            <p style="text-transform: uppercase; letter-spacing: 0.2em; font-weight: bold; margin-top: 20px;">By ${author} • ${dateStr}</p>
                        </div>
                    </header>
                    <article class="blog-article" style="position: relative; z-index: 20; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);">
                        <div class="prose" style="font-family: sans-serif; line-height: 1.8; color: #374151; font-size: 1.1rem;">
                            ${injectedContent}
                        </div>
                        <div style="margin-top: 80px; border-top: 1px solid #f3f4f6; padding-top: 40px;">
                            <h3 style="font-family: serif; font-size: 2rem; margin-bottom: 30px;">Related Stories</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                                ${relatedPostsHtml}
                            </div>
                        </div>
                    </article>
                </div>
            `;

            html = html.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);
        }
    } catch (error) {
        console.error('SSR Error for individual post:', error.message);
    }

    res.send(html);
});

// SSR for Blog Listing Page
app.get('/blog', async (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (!fs.existsSync(indexPath)) return res.status(404).send('Not Found');
    
    let html = fs.readFileSync(indexPath, 'utf8');

    try {
        let posts = wpCache.get('blog_list_ssr')?.data;

        if (!posts) {
            const filePath = path.join(__dirname, 'dist', 'ssr-cache', 'blog_list.json');
            if (fs.existsSync(filePath)) {
                try {
                    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    posts = fileContent.data;
                    wpCache.set('blog_list_ssr', { data: posts, timestamp: fileContent.timestamp });
                } catch (e) { console.error('Error reading list FS cache:', e); }
            }
        }

        if (!posts) {
            const response = await wpClient.get('/posts', { params: { per_page: 12, _embed: true } });
            posts = response.data;
            wpCache.set('blog_list_ssr', { data: posts, timestamp: Date.now() });
        }
            <div style="margin-bottom: 60px; border-bottom: 1px solid #f3f4f6; padding-bottom: 40px;">
                <h2 style="font-family: serif; font-size: 2.5rem; margin-bottom: 15px;">
                    <a href="/blog/${p.slug}" style="color: #111827; text-decoration: none;">${p.title.rendered}</a>
                </h2>
                <div style="color: #6b7280; font-size: 1.1rem; line-height: 1.6;">
                    ${p.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 200)}...
                </div>
                <a href="/blog/${p.slug}" style="display: inline-block; margin-top: 20px; color: #065f46; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none;">Continue Reading →</a>
            </div>
        `).join('');

        const ssrListHtml = `
            <div style="max-width: 1000px; margin: 0 auto; padding: 120px 20px;">
                <h1 style="font-size: 5rem; font-family: serif; margin-bottom: 80px;">The Journal</h1>
                <div class="blog-list">${listHtml}</div>
            </div>
        `;

        html = html.replace('<div id="root"></div>', `<div id="root">${ssrListHtml}</div>`);
        html = html.replace(/<title>.*?<\/title>/, `<title>Blog | Urban Shark Corporate Gifting Journal</title>`);
        
        const hydrationScript = `<script>window.__INITIAL_LIST_DATA__ = ${JSON.stringify(posts)};</script>`;
        html = html.replace('</head>', `${hydrationScript}</head>`);

    } catch (error) {
        console.error('SSR Error for blog listing:', error.message);
    }
    
    res.send(html);
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

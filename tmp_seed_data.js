import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { WC_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } = process.env;

if (!WC_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    console.error("Missing environment variables in .env file");
    process.exit(1);
}

const wooClient = axios.create({
    baseURL: `${WC_URL}/wp-json/wc/v3`,
    params: {
        consumer_key: WC_CONSUMER_KEY,
        consumer_secret: WC_CONSUMER_SECRET,
    },
});

const categories = [
    { name: "Executive Tech Essentials", description: "Power banks, Smart Bottles, Audio" },
    { name: "Wellness & Self-Care Kits", description: "Eco-friendly candles, Yoga mats, Organic teas" },
    { name: "Sustainable/Eco-Friendly Gifts", description: "Bamboo products, Recycled notebooks" },
    { name: "Desk Organizers & Stationery", description: "Premium pens, Leather planners" }
];

const productsData = {
    "Executive Tech Essentials": [
        { name: "The Titan 20,000mAh Bamboo Power Bank", price: "2499" },
        { name: "Aura Smart Hydration Bottle with Temp Display", price: "1850" },
        { name: "Sonic-Executive ANC Wireless Headphones", price: "4500" },
        { name: "Lumina 3-in-1 Magnetic Wireless Station", price: "2999" },
        { name: "Guardian Fingerprint Encrypted 64GB USB", price: "1450" }
    ],
    "Wellness & Self-Care Kits": [
        { name: "Zen Harmony Eco-Friendly Cork Yoga Mat", price: "1950" },
        { name: "Serenity Scented Hand-Poured Soy Candle Set", price: "1200" },
        { name: "Oasis Organic Himalayan Herbal Tea Collection", price: "850" },
        { name: "The Refresh Premium Bamboo Fiber Bathrobe", price: "2499" },
        { name: "Vitality Stone Diffuser & Essential Oil Blend", price: "3200" }
    ],
    "Sustainable/Eco-Friendly Gifts": [
        { name: "Eco-Executive Bamboo Desk Organizer", price: "1550" },
        { name: "The Terra Recycled Ocean Plastic Notebook", price: "650" },
        { name: "Modern Heritage Recycled Leather Laptop Sleeve", price: "1850" },
        { name: "Sprout Plantable Seed Pencil & Paper Set", price: "450" },
        { name: "The Verde Bamboo Fiber Coffee Cup & Sleeve", price: "750" }
    ],
    "Desk Organizers & Stationery": [
        { name: "Grandeur Gold-Trimmed Rollerball Pen", price: "1250" },
        { name: "Ascend Leather Executive Planner", price: "2200" },
        { name: "The Vertex Geometric Metal Desk Clock", price: "1650" },
        { name: "Signature Premium A5 Hardcover Journal", price: "850" },
        { name: "Prism Multi-Angle Metal Phone Stand", price: "950" }
    ]
};

async function seedDatabase() {
    try {
        console.log("Starting WooCommerce Seeding...");

        // 1. Create Categories
        const categoryMap = {};
        for (const cat of categories) {
            try {
                console.log(`Creating category: ${cat.name}...`);
                const response = await wooClient.post('/products/categories', {
                    name: cat.name,
                    description: cat.description
                });
                categoryMap[cat.name] = response.data.id;
            } catch (err) {
                if (err.response?.data?.code === 'term_exists') {
                    console.log(`Category ${cat.name} already exists, fetching ID...`);
                    const existing = await wooClient.get('/products/categories', { params: { search: cat.name } });
                    categoryMap[cat.name] = existing.data[0].id;
                } else {
                    throw err;
                }
            }
        }

        // 2. Create Products
        for (const [catName, products] of Object.entries(productsData)) {
            const categoryId = categoryMap[catName];
            console.log(`Adding ${products.length} products to ${catName}...`);

            for (const product of products) {
                try {
                    console.log(`Creating product: ${product.name}...`);
                    await wooClient.post('/products', {
                        name: product.name,
                        type: 'simple',
                        regular_price: product.price,
                        description: `Experience the pinnacle of corporate gifting with ${product.name}. Designed specifically for modern B2B needs, this item combines high-end functionality with a sleek, professional aesthetic. Our curation process ensures that every piece meets the rigorous standards of premium gifting. We offer extensive customization options, including precision laser engraving or high-quality silk-screen printing of your corporate logo. This product is an excellent choice for executive rewards, client appreciation gestures, or employee milestone celebrations. Benefit from our tiered bulk pricing and dedicated support for large-scale orders. Every order includes a digital mockup for approval before production begins, ensuring your brand is represented with absolute fidelity and style.`,
                        short_description: `Premium ${catName} for corporate gifting.`,
                        categories: [{ id: categoryId }],
                        images: [
                            { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop" }
                        ],
                        manage_stock: true,
                        stock_quantity: 500,
                        status: 'publish'
                    });
                } catch (err) {
                    console.error(`Failed to create product ${product.name}:`, err.response?.data || err.message);
                }
            }
        }

        console.log("Seeding Completed Successfully!");
    } catch (error) {
        console.error("Seeding Failed:", error.response ? error.response.data : error.message);
    }
}

seedDatabase();

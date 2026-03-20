import wooCommerceService from './wooCommerceService';
import { Product } from '../types';
import { decodeHtml, normalizeCategory } from '../utils/formatUtils';

const mapWooProductToInternal = (wooProduct: any): Product => {
    if (!wooProduct) {
        throw new Error('Attempted to map null or undefined WooCommerce product');
    }
    
    return {
        id: (wooProduct.id || Math.random()).toString(),
        name: wooProduct.name || 'Untitled Product',
        description: wooProduct.description || '',
        price: parseFloat(wooProduct.price) || 0,
        originalPrice: wooProduct.regular_price ? parseFloat(wooProduct.regular_price) : undefined,
        categories: (wooProduct.categories && Array.isArray(wooProduct.categories) && wooProduct.categories.length > 0)
            ? wooProduct.categories.map((c: any) => decodeHtml(c.name))
            : ['Collection'],
        images: (wooProduct.images && Array.isArray(wooProduct.images)) 
            ? wooProduct.images.map((img: any) => img.src) 
            : [],
        thumbnails: (wooProduct.images && Array.isArray(wooProduct.images))
            ? wooProduct.images.map((img: any) => img.src)
            : [],
        imageAlts: (wooProduct.images && Array.isArray(wooProduct.images))
            ? wooProduct.images.map((img: any) => img.alt || wooProduct.name || 'Product image')
            : [],
        stock: wooProduct.stock_quantity || 0,
        featured: !!wooProduct.featured,
        rating: parseFloat(wooProduct.average_rating) || 0,
        reviewCount: wooProduct.rating_count || wooProduct.review_count || 0,
        totalSales: parseInt(wooProduct.total_sales) || 0,
    };
};

const productCache: { [key: string]: { data: any, timestamp: number } } = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const productService = {
    // Get all products
    async getAllProducts(): Promise<Product[]> {
        const cacheKey = 'all_products';
        if (productCache[cacheKey] && (Date.now() - productCache[cacheKey].timestamp < CACHE_TTL)) {
            return productCache[cacheKey].data;
        }

        const response = await wooCommerceService.get('/products', {
            params: {
                orderby: 'date',
                order: 'desc',
                per_page: 50 // Fetch a good chunk
            }
        });
        
        const data = Array.isArray(response.data) ? response.data : [];
        const mapped = data.map(mapWooProductToInternal);
        
        productCache[cacheKey] = {
            data: mapped,
            timestamp: Date.now()
        };
        
        return mapped;
    },

    // Get featured products
    async getFeaturedProducts(limitCount: number = 4): Promise<Product[]> {
        const response = await wooCommerceService.get('/products', {
            params: {
                featured: true,
                per_page: limitCount
            }
        });
        const data = Array.isArray(response.data) ? response.data : [];
        return data.map(mapWooProductToInternal);
    },

    // Get products by category
    async getProductsByCategory(category: string): Promise<Product[]> {
        // First, we might need to find the category ID if we only have the name
        // For simplicity, let's assume we can fetch all and filter, or use search
        // A better way would be to fetch by category ID.
        const response = await wooCommerceService.get('/products', {
            params: {
                category: category // WooCommerce supports category ID or slug
            }
        });
        const data = Array.isArray(response.data) ? response.data : [];
        return data.map(mapWooProductToInternal);
    },

    // Get single product
    async getProductById(id: string): Promise<Product | null> {
        try {
            const response = await wooCommerceService.get(`/products/${id}`);
            return mapWooProductToInternal(response.data);
        } catch (error) {
            console.error(`Error fetching product with id ${id}:`, error);
            return null;
        }
    },

    // Add new product (Admin)
    async addProduct(product: Omit<Product, 'id'>): Promise<string> {
        const response = await wooCommerceService.post('/products', {
            name: product.name,
            type: 'simple',
            regular_price: product.price.toString(),
            description: product.description,
            categories: product.categories.map(catName => ({ name: catName })),
            images: product.images.map(url => ({ src: url })),
            featured: product.featured,
            stock_quantity: product.stock,
            manage_stock: true
        });
        return (response.data as any).id.toString();
    },

    // Update product (Admin)
    async updateProduct(id: string, product: Partial<Product>): Promise<void> {
        const updateData: any = {};
        if (product.name) updateData.name = product.name;
        if (product.price !== undefined) updateData.regular_price = product.price.toString();
        if (product.description) updateData.description = product.description;
        if (product.featured !== undefined) updateData.featured = product.featured;
        if (product.categories) updateData.categories = product.categories.map(catName => ({ name: catName }));
        if (product.images) updateData.images = product.images.map(url => ({ src: url }));
        if (product.stock !== undefined) {
            updateData.stock_quantity = product.stock;
            updateData.manage_stock = true;
        }

        await wooCommerceService.put(`/products/${id}`, updateData);
    },

    // Delete product (Admin)
    async deleteProduct(id: string): Promise<void> {
        await wooCommerceService.delete(`/products/${id}`, {
            params: { force: true }
        });
    },

    // Get backend configuration
    async getBackendConfig(): Promise<any> {
        try {
            const response = await wooCommerceService.get('/config');
            return response.data;
        } catch (error) {
            console.error('Error fetching backend config:', error);
            return null;
        }
    }
};

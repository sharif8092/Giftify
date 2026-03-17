import axios from 'axios';

// Point to our new Express backend proxy
// Use relative path so it works on both localhost and production
const BACKEND_URL = '/api/woo';

const wooCommerceService = axios.create({
    baseURL: BACKEND_URL,
});

export const wpService = axios.create({
    baseURL: `${BACKEND_URL}/wp-posts`,
});

// Add interceptor for JWT token (if still needed for backend auth)
const addAuthInterceptor = (instance: any) => {
    instance.interceptors.request.use((config: any) => {
        const token = localStorage.getItem('wc_jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
};

addAuthInterceptor(wooCommerceService);
addAuthInterceptor(wpService);

export default wooCommerceService;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
const Products = React.lazy(() => import('./pages/Products'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const NewArrivals = React.lazy(() => import('./pages/NewArrivals'));
const BulkOrders = React.lazy(() => import('./pages/BulkOrders'));
const CustomBranding = React.lazy(() => import('./pages/CustomBranding'));
const Blogs = React.lazy(() => import('./pages/Blogs'));
const BlogDetail = React.lazy(() => import('./pages/BlogDetail'));

import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import Skeleton from './components/Skeleton';

import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <Layout>
                  <React.Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-800/30 border-t-emerald-800 rounded-full animate-spin" /></div>}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/blogs" element={<Blogs />} />
                      <Route path="/blog/:id" element={<BlogDetail />} />
                      <Route path="/new-arrivals" element={<NewArrivals />} />
                      <Route path="/bulk-orders" element={<BulkOrders />} />
                      <Route path="/custom-branding" element={<CustomBranding />} />

                    </Routes>
                  </React.Suspense>
                </Layout>
                <ScrollToTop />
              </Router>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

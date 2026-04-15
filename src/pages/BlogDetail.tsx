import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ChevronLeft, ArrowRight, Share2, Bookmark } from 'lucide-react';
import { blogService } from '../services/blogService';
import { productService } from '../services/productService';
import { BlogPost, Product } from '../types';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/Skeleton';

const BlogDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            
            // 1. Check for SSR-injected data to prevent hydration flicker
            if (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__) {
                const ssrData = (window as any).__INITIAL_DATA__;
                // Only use it if it matches the current slug
                if (ssrData.post.slug === id) {
                    setPost(ssrData.post);
                    // Related posts might need separate handling or be part of state
                    setLoading(false);
                    // Clear it once consumed to allow subsequent client-side navigation
                    delete (window as any).__INITIAL_DATA__;
                    return;
                }
            }

            try {
                const [postData, productsData] = await Promise.all([
                    blogService.getPostBySlug(id),
                    productService.getFeaturedProducts(4)
                ]);
                setPost(postData);
                setRecommendedProducts(productsData);
            } catch (error) {
                console.error('Error fetching blog detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="pt-32 pb-24 min-h-screen bg-stone-50">
                <div className="max-w-4xl mx-auto px-4">
                    <Skeleton className="h-10 w-24 mb-12" />
                    <Skeleton className="aspect-video w-full rounded-[3rem] mb-12" />
                    <Skeleton className="h-16 w-3/4 mb-6" />
                    <Skeleton className="h-4 w-1/4 mb-12" />
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-2/3" />
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="pt-32 pb-24 text-center">
                <h2 className="text-3xl font-serif text-stone-900 mb-8">Article not found</h2>
                <Link to="/blogs" className="text-emerald-800 font-bold uppercase tracking-widest text-xs border-b border-emerald-800 pb-1">
                    Back to Journal
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-stone-50 min-h-screen">
            {/* ═══ HERO SECTION ═══ */}
            <header className="relative h-[70vh] min-h-[500px] overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    <img
                        src={post.image || "/Hero14.jpg"}
                        alt={post.imageAlt || post.title}
                        className="w-full h-full object-cover"
                        fetchpriority="high"
                        decoding="async"
                        width="1920"
                        height="1080"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]" />
                </motion.div>

                <div className="absolute inset-0 flex items-center justify-center pt-20">
                    <div className="max-w-4xl mx-auto px-4 text-center text-white">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block bg-emerald-500/20 backdrop-blur-md px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-black border border-emerald-500/30 mb-8"
                        >
                            {post.category || 'Lifestyle'}
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-serif leading-tight mb-8"
                            dangerouslySetInnerHTML={{ __html: post.title }}
                        />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center justify-center gap-8 text-[10px] uppercase tracking-widest font-bold opacity-80"
                        >
                            <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-emerald-400" />
                                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={12} className="text-emerald-400" />
                                {post.author}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* ═══ ARTICLE CONTENT ═══ */}
            <article className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 pb-24">
                <div className="bg-white rounded-[3rem] p-8 md:p-16 lg:p-20 shadow-2xl shadow-stone-200/50">
                    <div className="flex justify-between items-center mb-16 pb-8 border-b border-stone-100">
                        <Link to="/blogs" className="group flex items-center gap-3 text-stone-400 hover:text-stone-900 transition-colors">
                            <div className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center group-hover:bg-stone-50 transition-colors">
                                <ChevronLeft size={16} />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold">The Journal</span>
                        </Link>
                        <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center hover:bg-stone-50 transition-colors text-stone-400 hover:text-stone-900">
                                <Bookmark size={16} />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center hover:bg-stone-50 transition-colors text-stone-400 hover:text-stone-900">
                                <Share2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div
                        className="prose prose-stone prose-lg md:prose-xl max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:font-light prose-p:leading-relaxed prose-p:text-stone-600 prose-img:rounded-[2rem]"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="mt-20 pt-16 border-t border-stone-100">
                        <div className="bg-stone-50 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-20 h-20 rounded-full bg-emerald-800 flex items-center justify-center text-white text-3xl font-serif">
                                {post.author.charAt(0)}
                            </div>
                            <div className="text-center md:text-left">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-800 mb-2 block">Written by</span>
                                <h4 className="text-xl font-serif text-stone-900 mb-2">{post.author}</h4>
                                <p className="text-stone-500 text-sm font-light">Curator and storyteller at Urban Shark, exploring the intersection of modern lifestyle and professional excellence.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* ═══ PRODUCT PROMOTION ═══ */}
            <section className="bg-white py-24 md:py-32 border-t border-stone-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-emerald-800 text-[10px] uppercase tracking-[0.4em] font-black mb-4 block">Shop the Story</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-stone-900">Curated <span className="italic text-emerald-600">for You</span></h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {recommendedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-3 bg-stone-900 text-white px-10 py-5 rounded-full text-[10px] uppercase tracking-[0.2em] font-black hover:bg-emerald-800 transition-all duration-500 group"
                        >
                            Explore Full Collection
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogDetail;

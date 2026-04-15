import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, ChevronRight } from 'lucide-react';
import { blogService } from '../services/blogService';
import { BlogPost } from '../types';
import Skeleton from '../components/Skeleton';

const Blogs: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            // 1. Check for SSR-injected data
            if (typeof window !== 'undefined' && (window as any).__INITIAL_LIST_DATA__) {
                setPosts((window as any).__INITIAL_LIST_DATA__);
                setLoading(false);
                delete (window as any).__INITIAL_LIST_DATA__;
                return;
            }

            try {
                const allPosts = await blogService.getAllPosts();
                setPosts(allPosts);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="pt-32 pb-24 min-h-screen bg-stone-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-20">
                    <span className="text-emerald-800 text-[10px] uppercase tracking-[0.5em] font-bold mb-4 block">Our Journal</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-stone-900 mb-6">
                        Stories & <span className="italic">Reflections</span>
                    </h1>
                    <p className="text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
                        A sanctuary for shared wisdom, artisanal heritage, and contemporary reflections on a spiritual lifestyle.
                    </p>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-6">
                                <Skeleton className="aspect-[16/10] rounded-[2rem]" />
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            </div>
                        ))
                    ) : posts.length > 0 ? (
                        posts.map((post, i) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                className="group flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    <img
                                        src={post.image || '/Hero14.jpg'}
                                        alt={post.imageAlt || post.title}
                                        width="600"
                                        height="375"
                                        decoding="async"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold text-emerald-800 shadow-sm">
                                            {post.category || 'Lifestyle'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-10 flex flex-col flex-grow">
                                    <div className="flex items-center gap-6 mb-6 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-emerald-600" />
                                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User size={12} className="text-emerald-600" />
                                            {post.author}
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-serif text-stone-900 mb-4 group-hover:text-emerald-800 transition-colors leading-tight">
                                        {post.title}
                                    </h2>

                                    <div
                                        className="text-stone-500 font-light text-sm leading-relaxed mb-8 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: post.excerpt || post.content }}
                                    />

                                    <div className="mt-auto pt-6 border-t border-stone-100">
                                        <Link
                                            to={`/blog/${post.slug}`}
                                            className="inline-flex items-center gap-2 text-stone-900 hover:text-emerald-800 font-bold text-[10px] uppercase tracking-widest group/btn transition-colors"
                                        >
                                            Read Full Story
                                            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform text-emerald-600" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-stone-400 font-serif italic text-2xl">No stories shared yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blogs;

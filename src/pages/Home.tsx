import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, ShieldCheck, Truck, Mail, Package, CreditCard, RotateCcw, Quote, Sparkles, ChevronLeft, ChevronRight, Calendar, User as UserIcon } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { offerService } from '../services/offerService';
import { blogService } from '../services/blogService';
import { categoryService, Category } from '../services/categoryService';
import { Product, Offer, BlogPost } from '../types';
import SEO from '../components/SEO';
import { decodeHtml } from '../utils/formatUtils';

const DEFAULT_HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1549463591-147604d4c815?q=80&w=1920&auto=format&fit=crop&fm=webp', // Corporate Gift Boxes
    subtitle: 'Excellence in Corporate Gifting',
    title: 'Premium Business Gifts',
    desc: 'Thoughtfully curated luxury gift sets for your valued partners and employees.',
    link: '/products',
  },
  {
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1920&auto=format&fit=crop&fm=webp', // Wrapped gifts
    subtitle: 'Custom Branding Available',
    title: 'Bespoke Curations',
    desc: 'Personalize every gift with your corporate identity for a lasting impression.',
    link: '/products',
  },
  {
    image: 'https://images.unsplash.com/photo-1523293836414-f04e712e1f3b?q=80&w=1920&auto=format&fit=crop&fm=webp', // Elegant Desk/Gift
    subtitle: 'Bulk Orders Simplified',
    title: 'Seamless Logistics',
    desc: 'From curation to doorstep delivery, we handle your festive gifting at scale.',
    link: '/products',
  },
];

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero carousel state
  const [heroSlide, setHeroSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const offerMessages = [
    { title: 'Corporate Bulk Discounts', sub: 'Premium Quality' },
    { title: 'Exclusive B2B Pricing', sub: 'GST Invoicing' },
    { title: 'On Orders Above 1000 Units', sub: 'PAN India Delivery' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOfferIndex(prev => (prev + 1) % offerMessages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch products
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts);

        // Fetch active offer for banner
        const activeOffers = await offerService.getActiveOffers();
        const bannerOffer = activeOffers.find(o => o.type === 'banner');
        if (bannerOffer) {
          setActiveOffer(bannerOffer);
        }

        // Fetch latest blog posts
        const recentPosts = await blogService.getRecentPosts(3);
        setLatestPosts(recentPosts);

        // Fetch categories
        const allCategories = await categoryService.getAllCategories();
        setCategories(allCategories);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (DEFAULT_HERO_SLIDES.length <= 1) return;
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev === DEFAULT_HERO_SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const featuredProducts = useMemo(() => products.filter(p => p.featured), [products]);

  const trendingProducts = useMemo(() =>
    [...products]
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      })
      .slice(0, 4)
    , [products]);

  const bestSellers = useMemo(() =>
    [...products]
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 4)
    , [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter(p => 
      p.categories.some(cat => cat.toLowerCase() === selectedCategory.toLowerCase())
    );
  }, [products, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setLoading(true);
    setSelectedCategory(category);
    setTimeout(() => setLoading(false), 300);
  };

  // Hero carousel state

  return (
    <div className="pb-24">
      <SEO
        title="Premium Corporate Gifting Solutions in India"
        description="Urban Shark is India's premium corporate gifting partner. We specialize in bespoke business gifts, custom branded merchandise, and bulk gifting solutions for events and employees. Pan-India delivery with GST compliance."
        keywords="Corporate Gifting India, Bulk Business Gifts, Professional Gifting Solutions, Custom Branded Gifts, Employee Welcome Kits, Executive Gifts, B2B Gifting"
        ogType="website"
      />
      {/* ═══ PROMOTIONAL BANNER STRIP ═══ */}
      <section className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="max-w-7xl mx-auto px-4 h-12 md:h-14 flex items-center justify-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentOfferIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 w-full"
            >
              <h3 className="text-white font-extrabold text-sm sm:text-xl md:text-2xl uppercase tracking-wider text-center" style={{ fontStyle: 'italic' }}>
                {offerMessages[currentOfferIndex].title}
              </h3>
              <div className="flex items-center gap-3 sm:gap-5">
                <span className="bg-amber-400 text-emerald-900 text-[8px] sm:text-[9px] uppercase tracking-widest font-extrabold px-3 py-0.5 rounded-full whitespace-nowrap">
                  {offerMessages[currentOfferIndex].sub}
                </span>
                <span className="hidden sm:block text-white/40 font-light">|</span>
                <Link to="/products" className="text-white/80 hover:text-white text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold transition-colors">
                  Shop Collection →
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ HERO IMAGE CAROUSEL ═══ */}
      <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[85vh] overflow-hidden bg-stone-900">
        {/* Slides */}
        {DEFAULT_HERO_SLIDES.map((slide, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: heroSlide === i ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
            style={{ pointerEvents: heroSlide === i ? 'auto' : 'none' }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              fetchPriority={i === 0 ? "high" : "auto"}
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Bottom-left text overlay */}
            <div className="absolute bottom-10 sm:bottom-16 md:bottom-20 left-4 sm:left-8 md:left-16 max-w-lg z-10">
              <motion.div
                key={`text-${heroSlide}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <span className="text-emerald-300 text-[9px] sm:text-[10px] uppercase tracking-[0.4em] font-bold mb-2 block">
                  {slide.subtitle}
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white uppercase leading-[0.95] tracking-tight mb-2">
                  {slide.title}
                </h1>
                <p className="text-white/60 text-sm sm:text-base font-light mb-6">
                  {slide.desc}
                </p>
                <Link
                  to={slide.link}
                  className="inline-block bg-white text-stone-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-extrabold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg"
                >
                  Shop Now
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ))}

        {/* Navigation Arrows */}
        {DEFAULT_HERO_SLIDES.length > 1 && (
          <>
            <button
              onClick={() => setHeroSlide(prev => (prev === 0 ? DEFAULT_HERO_SLIDES.length - 1 : prev - 1))}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-20"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setHeroSlide(prev => (prev === DEFAULT_HERO_SLIDES.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-20"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {DEFAULT_HERO_SLIDES.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {DEFAULT_HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${heroSlide === i ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ═══ TRUST / USP STRIP ═══ */}
      <section className="bg-stone-50 border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-200">
            {[
              { icon: Truck, title: 'Bulk Logistics', desc: 'Pan-India doorstep delivery' },
              { icon: Package, title: 'Custom Branding', desc: 'Logo & message integration' },
              { icon: ShieldCheck, title: 'Premium Quality', desc: 'Quality checked assurance' },
              { icon: CreditCard, title: 'Tax Benefits', desc: 'GST invoicing & compliance' },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center py-8 px-4 gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <item.icon size={18} className="text-emerald-700" />
                </div>
                <div>
                  <div className="text-stone-900 font-bold text-xs uppercase tracking-wider">{item.title}</div>
                  <div className="text-stone-400 text-[11px] mt-0.5">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SHOP BY CATEGORY ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header row */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-8 mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 uppercase tracking-tight">Shop By Category</h2>
          <Link to="/products" className="group flex items-center gap-2 text-stone-400 hover:text-stone-900 text-[10px] uppercase tracking-[0.2em] font-black transition-all">
            View All
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>

        {/* Category Pills - Scrollable on mobile, wrap on desktop */}
        <div className="relative mb-12">
          <div className="flex overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap gap-3 sm:gap-4 scroll-smooth">
            <button
              onClick={() => handleCategoryChange('All')}
              className={`px-6 py-2.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase whitespace-nowrap transition-all duration-300 shadow-sm border ${selectedCategory === 'All'
                ? 'bg-stone-900 text-white border-stone-900 shadow-stone-200 ring-2 ring-stone-900/10'
                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-900 hover:shadow-md'
                }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const decodedName = decodeHtml(cat.name);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(decodedName)}
                  className={`px-6 py-2.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase whitespace-nowrap transition-all duration-300 shadow-sm border ${selectedCategory === decodedName
                    ? 'bg-stone-900 text-white border-stone-900 shadow-stone-200 ring-2 ring-stone-900/10'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-900 hover:shadow-md'
                    }`}
                >
                  {decodedName}
                </button>
              );
            })}
          </div>
          {/* Subtle fade indicator for mobile scroll */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
        </div>

        {/* Filtered Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-10 sm:gap-y-16 min-h-[400px]">
          {loading ? (
            // Skeleton Loader
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-stone-100 rounded-2xl mb-4" />
                  <div className="h-4 bg-stone-100 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-stone-100 rounded w-1/3" />
                </div>
              ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-stone-400 font-medium">No products found in this category.</p>
            </div>
          )}
        </div>

      </section>

      {/* ═══ SHOP BY BUDGET ═══ */}
      <section className="bg-stone-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-800 text-[10px] uppercase tracking-[0.5em] font-bold mb-3 block">Gift by Value</span>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900">Shop by <span className="italic">Budget</span></h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Under ₹500', min: 0, max: 500, image: 'https://images.unsplash.com/photo-1549463591-147604d4c815?q=80&w=800&auto=format&fit=crop&fm=webp' },
              { label: '₹500 - ₹1000', min: 500, max: 1000, image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=800&auto=format&fit=crop&fm=webp' },
              { label: '₹1000 - ₹2000', min: 1000, max: 2000, image: 'https://images.unsplash.com/photo-1523293836414-f04e712e1f3b?q=80&w=800&auto=format&fit=crop&fm=webp' },
              { label: 'Premium Gifts', min: 2000, max: 50000, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop&fm=webp' },
            ].map((budget, i) => (
              <Link
                key={i}
                to={`/products?min_price=${budget.min}&max_price=${budget.max}`}
                className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <img
                  src={budget.image}
                  alt={budget.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-white text-xl font-serif italic mb-1">{budget.label}</h3>
                  <span className="text-[9px] text-white/60 uppercase tracking-widest font-bold border-b border-white/20 pb-1 group-hover:border-white transition-colors">Explore Collection</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CORPORATE & CUSTOMIZATION SERVICES ═══ */}
      <section id="corporate-services" className="bg-stone-900 py-24 md:py-32 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-emerald-400 text-[10px] uppercase tracking-[0.5em] font-bold mb-4 block">B2B Solutions</span>
              <h2 className="text-4xl md:text-6xl font-serif text-white mb-8 leading-tight">
                Corporate <span className="italic text-emerald-400">Gifting</span> Redefined
              </h2>
              <div className="space-y-6">
                {[
                  { title: 'Custom Branding', desc: 'Logo printing, precision engraving, or metal branding options for every item.' },
                  { title: 'Bulk Logistics', desc: 'Direct shipping to multiple addresses across the country with real-time tracking.' },
                  { title: 'Bespoke Packaging', desc: 'Choose from our existing premium sets or work with us for unique, company-branded wraps.' },
                  { title: 'Tax Benefits', desc: 'Full GST invoicing for all corporate orders to help with your business accounting.' },
                ].map((service, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">{service.title}</h4>
                      <p className="text-stone-400 text-sm font-light">{service.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1523293836414-f04e712e1f3b?q=80&w=1920&auto=format&fit=crop"
                alt="Corporate Gifting"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-white italic font-light mb-4">"The quality and presentation of the gift sets exceeded our expectations. Our partners were truly impressed."</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">HR</div>
                  <p className="text-white text-xs font-bold uppercase tracking-widest">Global Tech Solutions</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ RAMADAN SPECIAL BANNER (Updated for Corporate Focus) ═══ */}
      <section className="relative overflow-hidden">
        <div className="bg-white py-16 md:py-20 border-y border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-center md:text-left"
              >
                <span className="text-stone-400 text-[10px] uppercase tracking-[0.4em] font-bold mb-3 block">Volume Orders</span>
                <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mb-3">
                  Bulk <span className="italic text-emerald-800">Inquiry</span>
                </h2>
                <p className="text-stone-500 font-light max-w-md">
                  Planning for a large event or festive season? Get a custom quote for bulk requirements.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <a
                  href="#inquiry"
                  className="group inline-flex items-center gap-3 bg-stone-900 text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-900 transition-all duration-300 shadow-xl hover:-translate-y-0.5"
                >
                  <span>Request Quote</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRENDING / BESTSELLERS ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-4">
          <div>
            <span className="text-emerald-800 text-[10px] uppercase tracking-[0.3em] font-bold mb-2 block">Trending Now</span>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900">Most <span className="italic">Coveted</span> Pieces</h2>
          </div>
          <Link to="/products" className="text-stone-400 hover:text-stone-900 text-xs uppercase tracking-widest font-bold border-b border-stone-200 pb-1 transition-all">
            Explore All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {trendingProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ═══ EDITORIAL STORY (DYNAMIC) ═══ */}
      <section className="bg-[#1A1A1A] text-white py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="aspect-[4/5] rounded-[3rem] overflow-hidden"
              >
                <img
                  src={latestPosts[0]?.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop"}
                  alt={latestPosts[0]?.imageAlt || "Editorial Story"}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emerald-900/50 rounded-full blur-[100px] -z-10" />
            </div>

            <div className="space-y-10">
              <span className="text-emerald-400 text-[10px] uppercase tracking-[0.5em] font-bold block">Our Philosophy</span>
              <h2 className="text-5xl md:text-7xl font-serif leading-[1.1] tracking-tight">
                {latestPosts[0] ? (
                  latestPosts[0].title.split(' ').map((word, i) => (
                    <React.Fragment key={i}>
                      {i === 1 ? <span className="italic text-emerald-400">{word} </span> : word + ' '}
                      {i === 1 && <br />}
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    Crafting <br />
                    <span className="italic text-emerald-400">Timeless</span> <br />
                    Narratives.
                  </>
                )}
              </h2>
              <div
                className="text-stone-400 text-lg leading-relaxed font-light max-w-md line-clamp-4"
                dangerouslySetInnerHTML={{ __html: latestPosts[0]?.excerpt || latestPosts[0]?.content || "Urban Shark is more than a store. It is a sanctuary for those who seek beauty in the professional journey, and meaning in the curation. Every piece is selected for its excellence." }}
              />
              <div className="pt-6">
                <Link to={`/blog/${latestPosts[0]?.id}`} className="group flex items-center space-x-4 text-white hover:text-emerald-400 transition-colors">
                  <span className="text-xs uppercase tracking-widest font-bold">Read Our Story</span>
                  <div className="w-12 h-[1px] bg-white/30 group-hover:w-20 group-hover:bg-emerald-400 transition-all duration-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ BESTSELLERS ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-4">
          <div>
            <span className="text-emerald-800 text-[10px] uppercase tracking-[0.3em] font-bold mb-2 block">Customer Favourites</span>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900">Best <span className="italic">Sellers</span></h2>
          </div>
          <Link to="/products" className="text-stone-400 hover:text-stone-900 text-xs uppercase tracking-widest font-bold border-b border-stone-200 pb-1 transition-all">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ═══ CUSTOMER TESTIMONIALS ═══ */}
      <section className="bg-stone-50 py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-800 text-[10px] uppercase tracking-[0.5em] font-bold mb-3 block">Testimonials</span>
            <h2 className="text-4xl md:text-6xl font-serif text-stone-900">What Our <span className="italic">Customers</span> Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Aisha Khan',
                location: 'Mumbai',
                rating: 5,
                text: 'The quality of the abayas is exceptional. I\'ve ordered multiple times and each piece feels luxurious. The packaging is beautiful too!',
                avatar: 'A',
              },
              {
                name: 'Mohammed Ali',
                location: 'Delhi',
                rating: 5,
                text: 'Found the perfect itter collection here. The fragrances are long-lasting and authentic. Highly recommend their Oudh Al Arab!',
                avatar: 'M',
              },
              {
                name: 'Fatima Shaikh',
                location: 'Hyderabad',
                rating: 5,
                text: 'Their janamaz collection is stunning. The velvet prayer mat I ordered is so soft and the patterns are gorgeous. Great customer service!',
                avatar: 'F',
              },
            ].map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-500 relative"
              >
                <Quote size={32} className="text-emerald-100 absolute top-6 right-6" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-stone-600 leading-relaxed mb-6 font-light">{review.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm">
                    {review.avatar}
                  </div>
                  <div>
                    <div className="text-stone-900 font-bold text-sm">{review.name}</div>
                    <div className="text-stone-400 text-xs">{review.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CURATED COLLECTIONS ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-serif text-stone-900 mb-6">Shop by <span className="italic">Collection</span></h2>
          <p className="text-stone-500 max-w-lg mx-auto font-light">Explore our thoughtfully assembled edits, designed for every professional milestone and corporate celebration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <Link to="/products?category=Office" className="group relative aspect-[16/10] overflow-hidden rounded-[2rem] md:rounded-[3rem]">
            <img
              src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1920&auto=format&fit=crop"
              alt="Executive Gifts"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
              <h3 className="text-4xl md:text-5xl font-serif text-white mb-4">The Executive Edit</h3>
              <span className="text-white/80 text-[10px] uppercase tracking-[0.3em] font-bold border-b border-white/40 pb-1">Shop Now</span>
            </div>
          </Link>

          <Link to="/products?category=Hampers" className="group relative aspect-[16/10] overflow-hidden rounded-[2rem] md:rounded-[3rem]">
            <img
              src="https://images.unsplash.com/photo-1549463591-147604d4c815?q=80&w=1920&auto=format&fit=crop"
              alt="Premium Hampers"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
              <h3 className="text-4xl md:text-5xl font-serif text-white mb-4">Premium Hampers</h3>
              <span className="text-white/80 text-[10px] uppercase tracking-[0.3em] font-bold border-b border-white/40 pb-1">Shop Now</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══ BULK INQUIRY FORM ═══ */}
      <section id="inquiry" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="bg-stone-50 rounded-[3rem] p-8 md:p-16 border border-stone-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/5 rounded-full -ml-16 -mb-16 blur-3xl" />

          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">Request a <span className="italic">Quote</span></h2>
            <p className="text-stone-500 font-light">Fill out the form below and our corporate gifting experts will get back to you within 24 hours.</p>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); alert('Trial Inquiry Sent! We will contact you soon.'); }}>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Full Name</label>
              <input
                required
                type="text"
                placeholder="Ex: John Doe"
                className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-light"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Company Name</label>
              <input
                required
                type="text"
                placeholder="Ex: Global Tech Inc."
                className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-light"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Work Email</label>
              <input
                required
                type="email"
                placeholder="john@company.com"
                className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-light"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Expected Quantity</label>
              <select
                required
                className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-stone-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-light appearance-none"
              >
                <option value="">Select Range</option>
                <option value="25-50">25 - 50 Units</option>
                <option value="50-100">50 - 100 Units</option>
                <option value="100-500">100 - 500 Units</option>
                <option value="500+">500+ Units</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Additional Requirements</label>
              <textarea
                rows={4}
                placeholder="Tell us about the occasion, branding needs, or specific products you are interested in..."
                className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-light resize-none"
              />
            </div>
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                className="w-full bg-emerald-800 text-white rounded-xl py-5 font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-900 transition-all duration-300 shadow-xl shadow-emerald-900/10 hover:shadow-emerald-900/20 active:scale-[0.98]"
              >
                Submit Inquiry
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;

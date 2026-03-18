import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Star, ShieldCheck, Truck, Clock, Mail, Package, 
  CreditCard, RotateCcw, Quote, Sparkles, ChevronLeft, 
  ChevronRight, Check, Heart, ShoppingCart, ShoppingBag, MessageCircle,
  ZoomIn, MessageSquare, Send, X, Phone, TrendingUp, Info, Activity
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/Skeleton';
import { Product, Review, CartItem } from '../types';
import { useQuotation } from '../hooks/useQuotation';
import QuotationForm from '../components/QuotationForm';
import SEO from '../components/SEO';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { profile } = useAuth();
  const { getQuotationLink, isMobile } = useQuotation();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [quantity, setQuantity] = useState(50); // MOQ 50
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBranding, setSelectedBranding] = useState<string>('None');
  const [backendConfig, setBackendConfig] = useState<any>(null);
  const [isSample, setIsSample] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'customization' | 'reviews'>('description');

  const brandingOptions = useMemo(() => {
    if (backendConfig?.branding_options) {
      return backendConfig.branding_options.map((opt: any) => ({
        ...opt,
        id: opt.name.toLowerCase().replace(/\s+/g, '-'),
        icon: opt.name === 'None' ? <X size={14} /> : (opt.name.includes('Laser') ? <Sparkles size={14} /> : <Check size={14} />)
      }));
    }
    return [
      { id: 'none', name: 'None', price: 0, icon: <X size={14} /> },
      { id: 'screen', name: 'Screen Printing', price: 15, icon: <Check size={14} /> },
      { id: 'laser', name: 'Laser Engraving', price: 25, icon: <Sparkles size={14} /> },
      { id: 'digital', name: 'Digital Print', price: 20, icon: <Send size={14} /> },
    ];
  }, [backendConfig]);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    reviewer: '',
    reviewer_email: '',
    review: ''
  });

  useEffect(() => {
    if (profile) {
      setNewReview(prev => ({
        ...prev,
        reviewer: profile.displayName || profile.email.split('@')[0],
        reviewer_email: profile.email || ''
      }));
    }
  }, [profile]);

  const getTieredPrice = (price: number, qty: number) => {
    if (!backendConfig?.bulk_pricing_tiers) {
        if (qty >= 1000) return price * 0.7;
        if (qty >= 500) return price * 0.8;
        if (qty >= 200) return price * 0.9;
        return price;
    }

    const tiers = [...backendConfig.bulk_pricing_tiers].sort((a, b) => b.min_qty - a.min_qty);
    const applicableTier = tiers.find(t => qty >= t.min_qty);
    if (applicableTier) {
        return price * (1 - applicableTier.discount / 100);
    }
    return price;
  };

  const brandingPrice = brandingOptions.find(b => b.name === selectedBranding)?.price || 0;
  const basePrice = product ? getTieredPrice(product.price, quantity) : 0;
  
  // Apply 3x multiplier for samples
  const sampleMultiplier = backendConfig?.sample_price_multiplier || 3;
  const unitPriceAfterSample = isSample ? (product?.price || 0) * sampleMultiplier : basePrice;
  
  const currentUnitPrice = unitPriceAfterSample + brandingPrice;

  // Handle sample mode logic
  useEffect(() => {
    if (isSample) {
      setQuantity(1);
    } else if (quantity === 1 && backendConfig?.moq_default) {
      setQuantity(backendConfig.moq_default);
    }
  }, [isSample]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      setLoading(true);
      
      // 1. Fetch Config (Non-blocking)
      try {
        const configResponse = await productService.getBackendConfig();
        if (configResponse) {
          setBackendConfig(configResponse);
          if (configResponse.moq_default) setQuantity(configResponse.moq_default);
        }
      } catch (err) {
        console.warn('Backend config fetch failed, using frontend defaults:', err);
      }

      // 2. Fetch Product (Critical)
      try {
        const found = await productService.getProductById(id);
        if (found) {
          console.log('Successfully fetched product:', found.id, found.name);
          setProduct(found);
          
          // 3. Fetch Related & Reviews (Async)
          const primaryCategory = found.categories[0] || 'Uncategorized';
          productService.getProductsByCategory(primaryCategory)
            .then(related => setRelatedProducts(related.filter(p => p.id !== found.id).slice(0, 4)))
            .catch(err => console.error('Error fetching related products:', err));

          setLoadingReviews(true);
          reviewService.getReviewsByProductId(id)
            .then(productReviews => {
              setReviews(productReviews);
              setLoadingReviews(false);
            })
            .catch(err => {
              console.error('Error fetching reviews:', err);
              setLoadingReviews(false);
            });
        }
      } catch (error) {
        console.error('Fatal error fetching product detail:', error);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };
    fetchProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedBranding, isSample, currentUnitPrice);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !product) return;
    setSubmittingReview(true);
    try {
      const submitted = await reviewService.submitReview(id, newReview);
      setReviews([submitted, ...reviews]);
      setShowReviewForm(false);
      setNewReview({ rating: 5, reviewer: '', reviewer_email: '', review: '' });
      
      // Update local product rating for immediate feedback
      const newCount = product.reviewCount + 1;
      const newRating = ((product.rating * product.reviewCount) + submitted.rating) / newCount;
      setProduct({
        ...product,
        rating: Number(newRating.toFixed(1)),
        reviewCount: newCount
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const productSchema = useMemo(() => {
    if (!product) return null;
    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.images,
      "description": (product.description || '').replace(/<[^>]*>?/gm, ''), // Strip HTML
      "brand": {
        "@type": "Brand",
        "name": "Ababil"
      },
      "sku": product.id,
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "INR",
        "price": product.price,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "priceValidUntil": "2026-12-31"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount
      }
    };
  }, [product]);

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col lg:flex-row gap-24">
          <div className="w-full lg:w-1/2 space-y-8">
            <Skeleton className="aspect-[3/4] rounded-[3rem]" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-10">
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-16 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-serif text-stone-900 italic">Piece not found</h2>
        <Link to="/products" className="mt-8 text-stone-900 font-bold text-[10px] uppercase tracking-widest border-b border-stone-900 pb-1 inline-block">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {product && (
        <SEO 
          title={product.name}
          description={(product.description || '').replace(/<[^>]*>?/gm, '').slice(0, 160)}
          ogType="product"
          ogImage={product.images?.[0] || ''}
          jsonLd={productSchema || undefined}
        />
      )}
      {/* ═══ Main Product Section ═══ */}
      <div className="flex flex-col lg:flex-row gap-24">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div className="relative group">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-stone-100 cursor-zoom-in"
              onClick={() => setIsZoomed(true)}
            >
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product?.images?.[selectedImage] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop'}
                alt={product?.name || 'Product'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="absolute top-8 right-8 flex flex-col gap-4">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-full text-stone-900 shadow-xl">
                  <ZoomIn size={20} />
                </div>
              </div>
              {discount > 0 && (
                <div className="bg-red-500 px-4 py-2 rounded-full shadow-xl">
                  <span className="text-xs uppercase tracking-widest font-bold text-white">-{discount}% Off</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {product?.images.map((img, i) => (
              <div
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`aspect-square rounded-2xl overflow-hidden bg-stone-100 cursor-pointer border-2 transition-all ${selectedImage === i ? 'border-stone-900' : 'border-transparent hover:border-stone-300'}`}
              >
                <img src={img} alt={`${product?.name} view ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 space-y-12">
          <div className="space-y-6">
            <nav className="flex text-[9px] uppercase tracking-[0.3em] font-bold text-stone-400">
              <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
              <span className="mx-3">/</span>
              <Link to="/products" className="hover:text-stone-900 transition-colors">Shop</Link>
              <span className="mx-3">/</span>
              <span className="text-stone-900">{product?.categories[0] || 'Uncategorized'}</span>
            </nav>
            <h1 className="text-5xl md:text-7xl font-serif text-stone-900 leading-tight">
              {(product?.name || '').split(' ').map((word, i) => (
                i === 1 ? <span key={i} className="italic font-light block">{word}</span> : <span key={i}>{word} </span>
              ))}
            </h1>
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">Bulk Price / Unit</span>
                  <div className="flex items-center gap-3">
                    {product?.originalPrice && (
                      <p className="text-xl font-serif text-stone-300 line-through">₹{Number(product.originalPrice || 0).toLocaleString()}</p>
                    )}
                    <p className="text-4xl font-serif italic text-stone-900">₹{Number(currentUnitPrice || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-stone-200"></div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => {
                    const ratingValue = i + 1;
                    const isFull = ratingValue <= Math.floor(product?.rating || 0);
                    const isHalf = !isFull && ratingValue <= Math.ceil(product?.rating || 0) && (product?.rating || 0) % 1 !== 0;

                    return (
                      <div key={i} className="relative">
                        <Star
                          size={14}
                          fill={isFull ? "currentColor" : "none"}
                          className={isFull ? "" : "text-stone-200"}
                        />
                        {isHalf && (
                          <div className="absolute inset-0 overflow-hidden w-1/2">
                            <Star size={14} fill="currentColor" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{product?.rating} / 5.0 ({Math.max(product?.reviewCount || 0, reviews.length)} reviews)</span>
              </div>
            </div>
          </div>

          {/* ═══ PRODUCT TABS ═══ */}
          <div className="space-y-8">
            <div className="flex border-b border-stone-100 gap-12">
              {['description', 'customization', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all relative ${
                    activeTab === tab ? 'text-stone-900' : 'text-stone-300 hover:text-stone-500'
                  }`}
                >
                  {tab === 'description' ? 'Product Story' : tab === 'customization' ? 'Customization' : `Reviews (${reviews.length})`}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-stone-500 text-lg leading-relaxed font-light max-w-lg product-description"
                  dangerouslySetInnerHTML={{ __html: product?.description || '' }}
                />
              )}

              {activeTab === 'customization' && (
                <motion.div
                  key="customization"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 max-w-lg"
                >
                  <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100 space-y-6">
                    <h4 className="text-xs font-serif italic text-stone-900">How to Customize your Order</h4>
                    <div className="space-y-6">
                      {[
                        { step: '01', title: 'Select Quantity', desc: 'Choose your desired volume to see bulk pricing advantage.' },
                        { step: '02', title: 'Share your Identity', desc: 'Once you place the inquiry, our team will contact you for your brand logo.' },
                        { step: '03', title: 'Finalize Mockup', desc: 'Our design studio will provide a digital mockup for approval within 24h.' }
                      ].map((s, idx) => (
                        <div key={idx} className="flex gap-4">
                          <span className="text-[10px] font-bold text-stone-300 mt-1">{s.step}</span>
                          <div>
                            <h5 className="text-[11px] font-bold text-stone-900 uppercase tracking-tighter mb-1">{s.title}</h5>
                            <p className="text-[10px] text-stone-500 font-light">{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <Sparkles size={16} className="text-emerald-600" />
                    <p className="text-[10px] text-emerald-800 font-medium">Free branding on orders above {backendConfig?.moq_default || 50} units.</p>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <div className="flex flex-col md:flex-row items-baseline justify-between gap-8">
                    <div>
                      <h4 className="text-xs font-serif italic text-stone-900 mb-4">What our Clients say</h4>
                      <div className="flex items-center gap-4">
                        <div className="text-4xl font-serif text-stone-900">{product?.rating}</div>
                        <div className="space-y-1">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < Math.floor(product?.rating || 0) ? "currentColor" : "none"} className={i < Math.floor(product?.rating || 0) ? "" : "text-stone-200"} />
                            ))}
                          </div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Based on {reviews.length} reviews</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="text-[9px] uppercase tracking-widest font-bold text-stone-500 hover:text-stone-900 border-b border-stone-200 pb-1"
                    >
                      {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showReviewForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <form onSubmit={handleSubmitReview} className="bg-stone-50 rounded-3xl p-8 space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Name</label>
                              <input
                                required
                                type="text"
                                className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs outline-none"
                                value={newReview.reviewer}
                                onChange={e => setNewReview({ ...newReview, reviewer: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Rating</label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button key={s} type="button" onClick={() => setNewReview({...newReview, rating: s})} className={newReview.rating >= s ? 'text-amber-400' : 'text-stone-200'}>
                                    <Star size={16} fill={newReview.rating >= s ? 'currentColor' : 'none'} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <textarea
                            required
                            rows={3}
                            className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs outline-none resize-none"
                            placeholder="Your review..."
                            value={newReview.review}
                            onChange={e => setNewReview({ ...newReview, review: e.target.value })}
                          />
                          <button type="submit" disabled={submittingReview} className="bg-stone-900 text-white px-8 py-3 rounded-full text-[9px] font-bold uppercase tracking-widest">
                            {submittingReview ? 'Posting...' : 'Submit Review'}
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-6">
                    {reviews.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No reviews yet.</p>
                    ) : (
                      reviews.slice(0, 3).map((r, i) => (
                        <div key={i} className="bg-stone-50 p-6 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-stone-900 uppercase">{r.reviewer}</span>
                            <div className="flex text-amber-400">
                              {[...Array(r.rating)].map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                            </div>
                          </div>
                          <p className="text-[10px] text-stone-500 font-light leading-relaxed">{r.review}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ ORDER OPTIONS ═══ */}
          <div className="space-y-12">
            {/* Sample vs Bulk Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsSample(false)}
                className={`p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden group ${
                  !isSample ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-100 bg-stone-50 hover:border-stone-200'
                }`}
              >
                <div className={`text-[8px] uppercase tracking-widest font-bold mb-2 ${!isSample ? 'text-stone-400' : 'text-stone-400'}`}>Professional Choice</div>
                <div className="text-sm font-serif italic mb-1">Bulk Quotation</div>
                <div className="text-[10px] opacity-60">Best for Corporates</div>
                {!isSample && <div className="absolute top-4 right-6 text-emerald-400"><TrendingUp size={16} /></div>}
              </button>

              <button
                onClick={() => setIsSample(true)}
                className={`p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden group ${
                  isSample ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-100 bg-stone-50 hover:border-stone-200'
                }`}
              >
                <div className={`text-[8px] uppercase tracking-widest font-bold mb-2 ${isSample ? 'text-stone-400' : 'text-stone-400'}`}>Product Evaluation</div>
                <div className="text-sm font-serif italic mb-1">Request Sample</div>
                <div className="text-[10px] opacity-60">1 Unit @ {sampleMultiplier}x Price</div>
                {isSample && <div className="absolute top-4 right-6 text-emerald-400"><Sparkles size={16} /></div>}
              </button>
            </div>

            {/* Volume Advantage - Only show if NOT a sample */}
            {!isSample && (
              <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm max-w-lg">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-900">Volume Advantage</h4>
                    <p className="text-[10px] text-stone-400 font-medium">Select a tier to update quantity</p>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                    <TrendingUp size={12} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Bulk Savings</span>
                  </div>
                </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {backendConfig?.bulk_pricing_tiers ? (
                backendConfig.bulk_pricing_tiers.slice(1).map((tier: any, idx: number) => {
                  const isActive = (idx === 0 && quantity >= tier.min_qty && quantity < (backendConfig.bulk_pricing_tiers[idx+2]?.min_qty || Infinity)) ||
                                  (idx > 0 && quantity >= tier.min_qty && quantity < (backendConfig.bulk_pricing_tiers[idx+2]?.min_qty || Infinity));
                  
                  // Simplified active logic for the loop
                  const nextTierMin = backendConfig.bulk_pricing_tiers.find((t: any) => t.min_qty > tier.min_qty)?.min_qty || Infinity;
                  const isEffectiveActive = quantity >= tier.min_qty && quantity < nextTierMin;

                  return (
                    <button 
                      key={idx} 
                      onClick={() => setQuantity(tier.min_qty)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-300 group ${
                        isEffectiveActive
                          ? 'bg-stone-900 border-stone-900 shadow-xl shadow-stone-900/10 scale-105'
                          : 'bg-stone-50 border-stone-100 hover:border-stone-300'
                      }`}
                    >
                      <div className={`text-[8px] uppercase tracking-tighter mb-1 font-bold ${isEffectiveActive ? 'text-stone-400' : 'text-stone-400 group-hover:text-stone-500'}`}>{tier.label}</div>
                      <div className={`text-[11px] font-bold mb-1 ${isEffectiveActive ? 'text-white' : 'text-stone-900'}`}>{tier.min_qty}+</div>
                      <div className={`text-[9px] font-bold uppercase ${isEffectiveActive ? 'text-emerald-400' : 'text-emerald-600'}`}>{tier.discount}% OFF</div>
                    </button>
                  );
                })
              ) : (
                [
                  { range: '50-200', qty: 50, discount: 'Base', desc: 'Starting at' },
                  { range: '200-500', qty: 200, discount: '10% OFF', desc: 'Volume' },
                  { range: '500-1000', qty: 500, discount: '20% OFF', desc: 'Wholesale' },
                  { range: '1000+', qty: 1000, discount: '30% OFF', desc: 'Partner' },
                ].map((tier, idx) => {
                  const isActive = (idx === 0 && quantity >= 50 && quantity < 200) ||
                                  (idx === 1 && quantity >= 200 && quantity < 500) ||
                                  (idx === 2 && quantity >= 500 && quantity < 1000) ||
                                  (idx === 3 && quantity >= 1000);
                  
                  return (
                    <button 
                      key={idx} 
                      onClick={() => setQuantity(tier.qty)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-300 group ${
                        isActive
                          ? 'bg-stone-900 border-stone-900 shadow-xl shadow-stone-900/10 scale-105'
                          : 'bg-stone-50 border-stone-100 hover:border-stone-300'
                      }`}
                    >
                      <div className={`text-[8px] uppercase tracking-tighter mb-1 font-bold ${isActive ? 'text-stone-400' : 'text-stone-400 group-hover:text-stone-500'}`}>{tier.desc}</div>
                      <div className={`text-[11px] font-bold mb-1 ${isActive ? 'text-white' : 'text-stone-900'}`}>{tier.range}</div>
                      <div className={`text-[9px] font-bold uppercase ${isActive ? 'text-emerald-400' : 'text-emerald-600'}`}>{tier.discount}</div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

          {/* Branding Options */}
          <div className="space-y-6 max-w-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-900">Custom Branding</h4>
              <span className="text-[9px] text-stone-400 font-medium italic">Mockups provided post-order</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {brandingOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedBranding(opt.name)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                    selectedBranding === opt.name
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                      : 'bg-white border-stone-100 hover:border-stone-200 text-stone-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedBranding === opt.name ? 'bg-emerald-500 text-white' : 'bg-stone-50 text-stone-400'
                  }`}>
                    {opt.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-tight">{opt.name}</div>
                    <div className="text-[9px] opacity-60">
                      {opt.price > 0 ? `+₹${opt.price}/unit` : 'Free'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery & Logistics */}
          <div className="flex items-center gap-6 py-6 border-y border-stone-100 max-w-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-600">
                <Clock size={16} />
              </div>
              <div>
                <span className="text-[8px] uppercase tracking-widest font-bold text-stone-400 block mb-0.5">Estimated Delivery</span>
                <span className="text-xs font-bold text-stone-900">{backendConfig?.lead_time_default || '7 - 12 Business Days'}</span>
              </div>
            </div>
            <div className="w-[1px] h-8 bg-stone-100"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-600">
                <Truck size={16} />
              </div>
              <div>
                <span className="text-[8px] uppercase tracking-widest font-bold text-stone-400 block mb-0.5">Shipping</span>
                <span className="text-xs font-bold text-stone-900">Pan-India Doorstep</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-8 border-t border-stone-100">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
                {!isSample ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-1 px-4">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Quantity</span>
                      <span className="text-[8px] uppercase tracking-widest font-bold text-emerald-600">MOQ: {backendConfig?.moq_default || 50}</span>
                    </div>
                    <div className="flex items-center justify-between border border-stone-200 rounded-full px-8 py-4 min-w-[200px] bg-white">
                      <button
                        onClick={() => setQuantity(Math.max(backendConfig?.moq_default || 50, quantity - 1))}
                        className="text-stone-400 hover:text-stone-900 transition-colors p-1"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-stone-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="text-stone-400 hover:text-stone-900 transition-colors p-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                        <Info size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900 mb-1">Sample Mode</h4>
                        <p className="text-[10px] text-emerald-700 leading-tight font-medium">
                          Single unit for evaluation. Priced at {sampleMultiplier}x. Refundable on bulk order.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex-grow flex flex-col gap-2">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 invisible">Action</span>
                  <button
                    onClick={handleAddToCart}
                    className={`h-[60px] rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 ${isAdded ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white hover:bg-emerald-900'}`}
                  >
                    <AnimatePresence mode="wait">
                      {isAdded ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Check size={16} />
                          Added to Quote
                        </motion.div>
                      ) : (
                        <motion.div
                          key="cart"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingBag size={16} />
                          {isSample ? 'Add Sample to Bag' : 'Add to Quote'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-emerald-900 text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-stone-900 transition-all shadow-xl shadow-emerald-900/20 group"
                >
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Request Formal Quote
                </button>
                
                <div className="flex items-center gap-4">
                  <a
                    href="tel:+917909096738"
                    className="flex-grow flex items-center justify-center gap-3 py-5 bg-white text-stone-900 border-2 border-stone-200 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-stone-50 transition-all group"
                  >
                    <Phone size={18} className="group-hover:rotate-12 transition-transform" />
                    Talk to Gifting Expert
                  </a>
                  <button
                    onClick={() => product && toggleWishlist(product)}
                    className={`h-[60px] w-[60px] border flex items-center justify-center rounded-full transition-all ${product && isInWishlist(product.id) ? 'text-red-500 border-red-500 bg-red-50' : 'text-stone-400 border-stone-200 hover:text-red-500 hover:border-red-500'}`}
                  >
                    <Heart size={20} fill={product && isInWishlist(product.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Product Specifications Table */}
          <div className="pt-12 border-t border-stone-100">
            <div className="flex items-center gap-3 mb-8">
              <Activity className="text-stone-900" size={18} />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900">Technical Specifications</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Minimum Order', value: `${backendConfig?.moq_default || 50} Units` },
                { label: 'Lead Time', value: backendConfig?.lead_time_default || '7-12 Business Days' },
                { label: 'Customization', value: 'Available' },
                { label: 'Material', value: 'Premium Grade' },
                { label: 'Quality Check', value: 'Triple Inspection' },
              ].map((spec, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-stone-50 group hover:bg-stone-50/50 transition-colors px-2 rounded-lg">
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">{spec.label}</span>
                  <span className="text-[11px] text-stone-900 font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-12 border-t border-stone-100">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center flex-shrink-0">
                <Truck className="text-stone-900" size={16} />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-900 mb-1">Complimentary Delivery</h4>
                <p className="text-xs text-stone-400 font-light">On all orders above ₹5,000</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="text-emerald-900" size={16} />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-900 mb-1">Secure Transaction</h4>
                <p className="text-xs text-stone-400 font-light">Encrypted payment processing</p>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-stone-100">
            <div className="bg-emerald-50/30 rounded-3xl p-8 border border-emerald-100/50">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-emerald-700" size={20} />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">Customization & Branding</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                {[
                  { title: 'Logo Integration', desc: 'Premium screen & digital printing' },
                  { title: 'Bespoke Packaging', desc: 'Custom boxes with your branding' },
                  { title: 'Laser Engraving', desc: 'Precision etching on metal/wood' },
                  { title: 'Premium Badges', desc: 'Luxury metal plates & emblems' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-[1.5rem] bg-white border border-emerald-50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-900 font-bold block mb-0.5 uppercase tracking-tighter">{feature.title}</span>
                      <span className="text-[10px] text-stone-500 leading-tight block">{feature.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 p-6 bg-stone-900 rounded-2xl text-white">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Corporate Quality Promise</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                  All branding is handled by our expert artisans. We provide digital proofs before production and offer multi-address bulk logistics.
                </p>
              </div>
              <Link 
                to="/#inquiry" 
                className="inline-flex items-center gap-2 text-emerald-800 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-900 transition-colors border-b-2 border-emerald-800/20 pb-1"
              >
                Inquire about Bulk Order <ArrowRight size={14} />
              </Link>
            </div>
            
            {/* B2B Trust Bar */}
            <div className="flex flex-wrap items-center gap-8 py-8 border-t border-stone-100">
              {[
                { icon: <CreditCard size={14} />, label: 'GST Invoicing' },
                { icon: <Package size={14} />, label: 'Sample Unit' },
                { icon: <Mail size={14} />, label: 'Pan-India Logistics' },
                { icon: <RotateCcw size={14} />, label: 'Quality Guarantee' },
              ].map((trust, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="text-stone-400">{trust.icon}</div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-900">{trust.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-40 pt-24 border-t border-stone-100">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-4">
            <div>
              <span className="text-emerald-800 text-[10px] uppercase tracking-[0.3em] font-bold mb-2 block">Curated Selection</span>
              <h2 className="text-4xl md:text-5xl font-serif text-stone-900">Related <span className="italic">Pieces</span></h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZoomed(false)}
              className="absolute inset-0 bg-stone-900/95 backdrop-blur-xl cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center pointer-events-none"
            >
              <img
                src={product?.images[selectedImage]}
                alt={product?.name}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-0 right-0 mt-[-40px] text-white/60 hover:text-white transition-colors pointer-events-auto"
              >
                <X size={32} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <QuotationForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        items={product ? [{ ...product, quantity }] : []}
        onSuccess={() => setIsAdded(true)}
      />
    </div>
  );
};

export default ProductDetail;

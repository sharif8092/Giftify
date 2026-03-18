import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-stone-100 mb-6">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.thumbnails?.[0] || product.images?.[0] || ''}
            alt={product.imageAlts?.[0] || product.name || 'Product'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </Link>

        {/* Elegant Quick Add Overlay */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-700 pointer-events-none"></div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out flex flex-col gap-2">
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 flex items-center justify-center gap-2 ${isAdded ? 'bg-emerald-600 text-white' : 'bg-white text-stone-900 hover:bg-stone-900 hover:text-white'}`}
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
                  <Check size={12} />
                  Added
                </motion.div>
              ) : (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Add to Bag
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="w-full bg-stone-900/80 backdrop-blur-md text-white py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-stone-900 transition-all duration-500 flex items-center justify-center gap-2"
            >
              <Eye size={12} />
              Quick View
            </button>
          )}
        </div>

        {/* Subtle Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {product.featured && (
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full w-fit">
              <span className="text-[8px] uppercase tracking-widest font-bold text-emerald-800">Featured</span>
            </div>
          )}
          {discount > 0 && (
            <div className="bg-red-500 px-3 py-1 rounded-full w-fit">
              <span className="text-[8px] uppercase tracking-widest font-bold text-white">-{discount}%</span>
            </div>
          )}
        </div>

        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 duration-500 ${isInWishlist(product.id) ? 'text-red-500' : 'text-stone-400 hover:text-red-500'}`}
        >
          <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="px-4 text-center">
        <Link to={`/product/${product.id}`} className="block space-y-2">
          <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold block">
            {product.categories.join(' · ')}
          </span>
          <h3 className="text-stone-900 font-serif text-xl leading-tight group-hover:text-emerald-800 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-center gap-1">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                const isFull = ratingValue <= Math.floor(product.rating);
                const isHalf = !isFull && ratingValue <= Math.ceil(product.rating) && product.rating % 1 !== 0;

                return (
                  <div key={i} className="relative">
                    <Star
                      size={10}
                      fill={isFull ? "currentColor" : "none"}
                      className={isFull ? "" : "text-stone-200"}
                    />
                    {isHalf && (
                      <div className="absolute inset-0 overflow-hidden w-1/2">
                        <Star size={10} fill="currentColor" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="text-[8px] text-stone-400 font-bold tracking-widest uppercase">({product.reviewCount})</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-stone-300 font-light text-xs line-through font-serif">
                ₹{product.originalPrice.toLocaleString()}
              </p>
            )}
            <p className="text-stone-900 font-light text-sm italic font-serif">
              ₹{product.price.toLocaleString()}
            </p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;

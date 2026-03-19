import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, LogOut, ShoppingBag, Heart, ArrowRight, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PRODUCTS } from '../constants';
import { productService } from '../services/productService';
import { Product } from '../types';
import { useQuotation } from '../hooks/useQuotation';
import QuotationForm from '../components/QuotationForm';

const TopBar: React.FC = () => (
  <div className="hidden sm:block bg-stone-900 border-b border-white/5 overflow-hidden">
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
      <div className="h-7 sm:h-8 flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 hover:text-white transition-colors">
            <Phone size={12} className="text-emerald-500" />
            <a href="tel:+917909096738">+91 79090 96738</a>
          </div>
          <div className="hidden md:flex items-center gap-2 hover:text-white transition-colors">
            <Mail size={12} className="text-emerald-500" />
            <a href="mailto:support@corporategifting.store">support@corporategifting.store</a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex items-center gap-2"
          >
            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
            <span className="text-emerald-500 hidden sm:inline">Premium Quality Assurance</span>
            <span className="text-stone-300">Excellence in Corporate Gifting</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden lg:flex items-center gap-6">
            <span className="hover:text-white cursor-help">PAN India Delivery</span>
            <span className="text-stone-700">|</span>
            <Link to="/bulk-orders" className="hover:text-white transition-colors">Bulk Pricing Available</Link>
          </div>
          <div className="lg:hidden flex items-center gap-3">
            <a href="tel:+917909096738" className="text-emerald-500"><Phone size={14} /></a>
            <a href="mailto:support@corporategifting.store" className="text-stone-300"><Mail size={14} /></a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Navbar: React.FC = () => {
  const { itemCount, items } = useCart();
  const { wishlist } = useWishlist();
  const { user, profile, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { getQuotationLink, isMobile } = useQuotation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products for suggestions:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50">
        <TopBar />
        {/* Main Header: Logo | Nav Links | Icons */}
        <div className="bg-white border-b border-stone-200/60">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex items-center justify-between h-16 lg:h-[80px] gap-4">

              <div className="flex-1 flex items-center">
                <Link to="/" className="flex-shrink-0 group flex items-center gap-3">
                  <img src="/logo.png" alt="Urban Shark Logo" className="hidden sm:block h-8 lg:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
                  <span className="text-2xl lg:text-[28px] font-serif italic text-stone-900 tracking-tight group-hover:text-emerald-800 transition-colors duration-300">Urban Shark</span>
                </Link>
              </div>

              <div className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1 flex-grow">
                {/* All Gifts Dropdown */}
                <div className="group relative">
                  <button className="relative px-2 xl:px-3 py-2 text-[10px] xl:text-[11px] uppercase tracking-[0.1em] font-semibold text-stone-500 hover:text-stone-900 transition-colors duration-200 whitespace-nowrap flex items-center gap-1">
                    All Gifts
                    <ArrowRight size={10} className="rotate-90 opacity-40" />
                    <span className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </button>
                  <div className="absolute top-full left-0 w-64 bg-white border border-stone-100 shadow-2xl rounded-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[60]">
                    <div className="space-y-1">
                      {[
                        { label: 'All Products', to: '/products' },
                        { label: 'Tech Gifts', to: '/products?category=Tech' },
                        { label: 'Bags', to: '/products?category=Bags' },
                        { label: 'Drinkware', to: '/products?category=Drinkware' },
                        { label: 'Office Supplies', to: '/products?category=Office' },
                        { label: 'Gift Hampers', to: '/products?category=Hampers' },
                        { label: 'Eco Friendly Gifts', to: '/products?category=Eco' },
                      ].map(sub => (
                        <Link key={sub.label} to={sub.to} className="block px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Corporate Gifting Dropdown */}
                <div className="group relative">
                  <button className="relative px-2 xl:px-3 py-2 text-[10px] xl:text-[11px] uppercase tracking-[0.1em] font-semibold text-stone-500 hover:text-stone-900 transition-colors duration-200 whitespace-nowrap flex items-center gap-1">
                    Corporate
                    <ArrowRight size={10} className="rotate-90 opacity-40" />
                    <span className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </button>
                  <div className="absolute top-full left-0 w-64 bg-white border border-stone-100 shadow-2xl rounded-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[60]">
                    <div className="space-y-1">
                      {[
                        { label: 'Overview', to: '/#corporate-services' },
                        { label: 'Bags', to: '/products?category=Bags' },
                        { label: 'Tech', to: '/products?category=Tech' },
                        { label: 'Drinkware', to: '/products?category=Drinkware' },
                        { label: 'Apparel', to: '/products?category=Apparel' },
                        { label: 'Office Gifts', to: '/products?category=Office' },
                      ].map(sub => (
                        <Link key={sub.label} to={sub.to} className="block px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <Link to="/products?category=Events" className="relative px-2 xl:px-3 py-2 text-[10px] xl:text-[11px] uppercase tracking-[0.1em] font-semibold text-stone-500 hover:text-stone-900 transition-colors duration-200 whitespace-nowrap group flex flex-col items-center">
                  Events
                  <span className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>

                <Link to="/bulk-orders" className="relative px-2 xl:px-3 py-2 text-[10px] xl:text-[11px] uppercase tracking-[0.1em] font-semibold text-stone-500 hover:text-stone-900 transition-colors duration-200 whitespace-nowrap group flex flex-col items-center">
                  Bulk
                  <span className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>

                <Link to="/custom-branding" className="relative px-2 xl:px-3 py-2 text-[10px] xl:text-[11px] uppercase tracking-[0.1em] font-semibold text-stone-500 hover:text-stone-900 transition-colors duration-200 whitespace-nowrap group flex flex-col items-center">
                  Branding
                  <span className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>

                {/* Industry Solutions Dropdown */}
                <div className="group relative">
                  <button className="relative px-2 xl:px-3 py-2 text-[10px] xl:text-[11px] uppercase tracking-[0.1em] font-semibold text-stone-500 hover:text-stone-900 transition-colors duration-200 whitespace-nowrap flex items-center gap-1">
                    Solutions
                    <ArrowRight size={10} className="rotate-90 opacity-40" />
                    <span className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </button>
                  <div className="absolute top-full left-0 w-72 bg-white border border-stone-100 shadow-2xl rounded-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[60]">
                    <div className="space-y-1">
                      {[
                        { label: 'Employee Welcome Kits', to: '/products?category=Welcome' },
                        { label: 'Conference Gifts', to: '/products?category=Conference' },
                        { label: 'Promotional Merchandise', to: '/products?category=Promo' },
                        { label: 'Festival Gifts', to: '/products?category=Festival' },
                      ].map(sub => (
                        <Link key={sub.label} to={sub.to} className="block px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  to="/new-arrivals"
                  className="px-2 xl:px-4 py-1.5 ml-1 xl:ml-2 text-[10px] xl:text-[11px] uppercase tracking-[0.1em] font-bold text-emerald-700 hover:text-emerald-900 transition-colors duration-200 whitespace-nowrap border border-emerald-100 rounded-full bg-emerald-50/50"
                >
                  New
                </Link>
              </div>

              {/* Right: Icons */}
              <div className="flex-1 flex items-center justify-end gap-1 xl:gap-2">
                {/* Search */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-1 px-2 text-stone-500 hover:text-stone-900 transition-colors duration-200"
                  aria-label="Search"
                >
                  <Search size={18} strokeWidth={1.5} />
                </button>


                {/* Cart/Bag */}
                <Link to="/cart" className="p-2 text-stone-500 hover:text-stone-900 transition-colors duration-200 relative">
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  {itemCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-600 text-white text-[7px] font-bold rounded-full flex items-center justify-center">{itemCount}</span>
                  )}
                </Link>

                {/* Request Quote Button */}
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="hidden lg:flex items-center gap-2 px-4 xl:px-5 py-2.5 bg-emerald-900 text-white rounded-full text-[9px] xl:text-[10px] uppercase tracking-widest font-bold hover:bg-stone-900 transition-all shadow-lg shadow-emerald-900/20"
                >
                  <ShoppingBag size={13} />
                  <span className="whitespace-nowrap">Request Quote</span>
                </button>

                <a href="tel:+917909096738" className="hidden 2xl:flex items-center gap-2 px-4 py-2.5 text-stone-900 rounded-full text-[9px] xl:text-[10px] uppercase tracking-widest font-bold border border-stone-200 hover:bg-stone-50 transition-all">
                  <span className="whitespace-nowrap">Talk to Expert</span>
                </a>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="lg:hidden p-2 ml-1 text-stone-700 hover:text-stone-900 transition-colors"
                  aria-label="Menu"
                >
                  {isOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden bg-white border-b border-stone-200 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-0">
                {[
                  { label: 'All Gifts', to: '/products' },
                  { label: 'Corporate Gifting', to: '/#corporate-services' },
                  { label: 'Event Gifting', to: '/products?category=Events' },
                  { label: 'Bulk Orders', to: '/bulk-orders' },
                  { label: 'Custom Branding', to: '/custom-branding' },
                  { label: 'Solutions', to: '/#corporate-services' },
                  { label: 'New Arrivals', to: '/new-arrivals' },
                ].map(item => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`block py-3 text-[11px] uppercase tracking-[0.15em] font-semibold border-b border-stone-50 transition-colors ${item.label === 'New Arrivals' ? 'text-emerald-700' : 'text-stone-600 hover:text-emerald-800'}`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-6 space-y-4">
                  <button
                    onClick={() => {
                      setIsFormOpen(true);
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-900 text-white rounded-full text-[10px] uppercase tracking-widest font-bold"
                  >
                    <ShoppingBag size={14} />
                    Request Quote
                  </button>
                  <a
                    href="tel:+917909096738"
                    className="flex items-center justify-center gap-2 w-full py-4 border border-stone-200 text-stone-900 rounded-full text-[10px] uppercase tracking-widest font-bold"
                  >
                    📞 Talk to Gifting Expert
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-md"
            />
            <div className="relative flex flex-col items-center pt-20 sm:pt-28 px-4">
              <motion.div
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-xl"
              >
                {/* Search Input Card */}
                <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                  <div className="flex items-center px-6 py-5 gap-4">
                    <Search className="text-emerald-600 flex-shrink-0" size={22} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="What are you looking for?"
                      className="flex-grow bg-transparent text-lg text-stone-900 placeholder:text-stone-300 focus:outline-none font-light"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')} className="p-1 text-stone-300 hover:text-stone-500 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                    <button type="button" onClick={() => setIsSearchOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-all">
                      <span className="text-[10px] font-mono font-bold">ESC</span>
                    </button>
                  </div>

                  {/* Quick Tags */}
                  {searchQuery.trim().length === 0 && (
                    <div className="px-6 pb-5 border-t border-stone-50 pt-4">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-3">Popular Searches</p>
                      <div className="flex flex-wrap gap-2">
                        {['Office Hampers', 'Executive Gifts', 'Tech Kits', 'Logo Printing', 'Bulk Order', 'New Collections'].map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSearchQuery(tag)}
                            className="px-3 py-1.5 bg-stone-50 hover:bg-emerald-50 text-stone-500 hover:text-emerald-700 text-[11px] font-semibold rounded-lg border border-stone-100 hover:border-emerald-200 transition-all duration-200"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="border-t border-stone-100 max-h-[50vh] overflow-y-auto">
                      <p className="px-6 pt-4 pb-2 text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400">Products</p>
                      {suggestions.map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                          className="flex items-center gap-4 px-6 py-3 hover:bg-stone-50 transition-colors group"
                        >
                          <div className="w-11 h-14 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-stone-900 group-hover:text-emerald-800 transition-colors truncate">{product.name}</p>
                            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">{product.category} · ₹{product.price.toLocaleString()}</p>
                          </div>
                          <ArrowRight size={14} className="text-stone-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {searchQuery.trim().length > 1 && suggestions.length === 0 && (
                    <div className="border-t border-stone-100 px-6 py-10 text-center">
                      <p className="text-stone-400 text-sm">No products found for "<span className="font-semibold text-stone-600">{searchQuery}</span>"</p>
                      <p className="text-stone-300 text-xs mt-1">Try a different search term</p>
                    </div>
                  )}
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      <QuotationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        items={items}
        onSuccess={() => { }}
      />
    </>
  );
};

export default Navbar;

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { useAuth } from './AuthContext';

const GST_RATES: Record<string, number> = {
  'Abaya': 0.12,
  'Kurta': 0.12,
  'Cap': 0.12,
  'Janamaz': 0.12,
  'Itter': 0.18,
  'Home Decor': 0.18,
  'Tasbih': 0.18,
  'Miswaq': 0.05,
  'Other': 0.18
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, branding?: string, isSample?: boolean, customPrice?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  gstTotal: number;
  total: number; // For compatibility, this will be the estimate total (subtotal + gstTotal)
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const isInitialLoad = useRef(true);

  // Load cart when user changes
  useEffect(() => {
    const cartKey = user ? `cart_${user.uid}` : 'cart_guest';
    const saved = localStorage.getItem(cartKey);
    const loadedItems = saved ? JSON.parse(saved) : [];
    
    if (user && loadedItems.length === 0) {
      const guestSaved = localStorage.getItem('cart_guest');
      if (guestSaved) {
        setItems(JSON.parse(guestSaved));
        return;
      }
    }

    setItems(loadedItems);
    isInitialLoad.current = false;
  }, [user]);

  // Save cart whenever items change (and after initial load)
  useEffect(() => {
    if (isInitialLoad.current) return;
    const cartKey = user ? `cart_${user.uid}` : 'cart_guest';
    localStorage.setItem(cartKey, JSON.stringify(items));
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items, user]);

  const getTieredPrice = (price: number, qty: number) => {
    if (qty >= 1000) return price * 0.7;
    if (qty >= 500) return price * 0.8;
    if (qty >= 200) return price * 0.9;
    return price;
  };

  const addToCart = (product: Product, quantity: number = 1, branding: string = 'None', isSample: boolean = false, customPrice?: number) => {
    setItems(prev => {
      const itemKey = `${product.id}-${branding}-${isSample ? 'sample' : 'bulk'}`;
      
      const existing = prev.find(item => {
        const existingKey = `${item.id}-${(item as any).branding || 'None'}-${item.isSample ? 'sample' : 'bulk'}`;
        return existingKey === itemKey;
      });

      if (existing) {
        const newQuantity = existing.quantity + quantity;
        const newPrice = isSample ? (customPrice || existing.price) : getTieredPrice(product.price, newQuantity);
        
        return prev.map(item => {
          const checkKey = `${item.id}-${(item as any).branding || 'None'}-${item.isSample ? 'sample' : 'bulk'}`;
          return checkKey === itemKey ? { ...item, quantity: newQuantity, price: newPrice } : item;
        });
      }

      const initialPrice = isSample ? (customPrice || product.price * 3) : getTieredPrice(product.price, quantity);
      
      return [...prev, { 
        ...product, 
        quantity, 
        price: initialPrice, 
        isSample, 
        branding,
        originalPrice: product.price 
      } as CartItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.id === productId) {
          const newPrice = getTieredPrice(item.originalPrice || item.price, quantity);
          return { ...item, quantity, price: newPrice };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const gstTotal = items.reduce((sum, item) => {
    // Determine product category for GST (standardize it)
    const category = item.category || (item.categories && item.categories[0]) || 'Other';
    const rate = GST_RATES[category] || 0.18;
    return sum + (item.price * item.quantity * rate);
  }, 0);

  const estimateTotal = subtotal + gstTotal;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      subtotal,
      gstTotal,
      total: estimateTotal,
      itemCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

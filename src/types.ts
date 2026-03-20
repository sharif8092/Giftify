export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categories: string[];
  images: string[];
  thumbnails?: string[];
  imageAlts?: string[];
  stock: number;
  featured?: boolean;
  rating: number;
  reviewCount: number;
  totalSales: number;
  date_created?: string;
}

export interface CartItem extends Product {
  quantity: number;
  isSample?: boolean;
  customPrice?: number;
}
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'scheduled' | 'expired';
  clicks: number;
  expiry: string;
  image?: string;
  link?: string;
  type: 'banner' | 'popup' | 'deal';
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  status: 'Published' | 'Draft';
  comments: number;
  image?: string; // Main thumbnail
  imageAlt?: string; // SEO alt text for thumbnail
  excerpt?: string; // Short summary
  heroImage?: string; // Larger banner image
  heroAlt?: string; // SEO alt text for hero
  additionalImages?: { url: string; alt?: string }[]; // Gallery with SEO
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface MediaFile {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video' | 'pdf';
  category: 'products' | 'blogs' | 'banners' | 'other';
  size: number;
  uploadedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  address?: string;
  phone?: string;
  role: 'customer' | 'admin';
  wcCustomerId?: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
  shippingMethod?: string;
  shippingCost?: number;
  trackingNumber?: string;
  billing?: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postcode: string;
    email: string;
    phone: string;
  };
}

export interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface ShippingZone {
  id: number;
  name: string;
  order: number;
}

export interface ShippingMethod {
  id: number;
  instance_id: number;
  title: string;
  method_id: string;
  method_title: string;
  enabled: boolean;
  settings: {
    cost?: {
      value: string;
    }
  };
}

export interface Review {
  id: string;
  productId: string;
  reviewer: string;
  reviewerEmail: string;
  review: string;
  rating: number;
  dateCreated: string;
  verified: boolean;
}

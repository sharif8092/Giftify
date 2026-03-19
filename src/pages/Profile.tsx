import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, MapPin, Save, Loader2, CheckCircle2, ShieldCheck, ArrowRight, LogOut, Package, Clock, Truck } from 'lucide-react';

const Profile: React.FC = () => {
  const { profile, updateProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });

      // Fetch recent orders
      const fetchRecentOrders = async () => {
        try {
          const data = await orderService.getUserOrders(profile.email, profile.wcCustomerId);
          setOrders(data.slice(0, 3)); // Only show last 3 on profile
        } catch (err) {
          console.error('Error fetching orders for profile:', err);
        } finally {
          setOrdersLoading(false);
        }
      };
      
      fetchRecentOrders();
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-300 animate-pulse">Authenticating...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl mb-16">
        <span className="text-emerald-800 text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block">Personal Identity</span>
        <h1 className="text-5xl md:text-7xl font-serif text-stone-900 leading-tight">
          Your <span className="italic">Profile</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-24">
        <div className="w-full lg:w-1/3">
          <div className="bg-stone-50 rounded-[3rem] p-12 text-center space-y-8">
            <div className="w-32 h-32 bg-stone-200 rounded-full mx-auto flex items-center justify-center overflow-hidden">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-stone-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-serif text-stone-900">{profile.displayName || 'Unnamed Guest'}</h2>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-2">{profile.role}</p>
            </div>
            <div className="pt-8 border-t border-stone-100 flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-3 text-stone-400">
                <Mail size={14} />
                <span className="text-xs font-light">{profile.email}</span>
              </div>
            </div>

            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="group flex items-center justify-center w-full bg-stone-900 text-white px-6 py-5 rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-900 transition-all shadow-xl space-x-4"
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="flex-grow">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-transparent border-b border-stone-200 pl-8 py-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-all font-light"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                  <input
                    disabled
                    type="email"
                    value={formData.email}
                    className="w-full bg-transparent border-b border-stone-100 pl-8 py-3 text-stone-300 focus:outline-none font-light cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent border-b border-stone-200 pl-8 py-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-all font-light"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-4">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400">Shipping Address</label>
                <div className="relative">
                  <MapPin className="absolute left-0 top-4 text-stone-300" size={16} />
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-transparent border-b border-stone-200 pl-8 py-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-all font-light resize-none"
                    placeholder="Your full address for deliveries"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <button
                disabled={loading}
                type="submit"
                className="bg-stone-900 text-white px-12 py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-4 hover:bg-emerald-900 transition-all shadow-2xl disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                <span>Save Changes</span>
              </button>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center space-x-2 text-emerald-600"
                  >
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Profile Updated</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Recent Orders Section */}
          <div className="mt-24 pt-24 border-t border-stone-100 space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-serif text-stone-900">Recent <span className="italic">Orders</span></h2>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-2">Track your active journeys</p>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="text-stone-900 font-bold text-[10px] uppercase tracking-widest border-b border-stone-900 pb-1"
              >
                View All Archives
              </button>
            </div>

            {ordersLoading ? (
              <div className="flex items-center space-x-4 text-stone-300">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Retrieving history...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-stone-50 rounded-[2rem] p-10 text-center">
                <Package className="mx-auto text-stone-200 mb-4" size={32} />
                <p className="text-xs text-stone-400 font-light italic">No recent orders found. Time to start a new story?</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {orders.map(order => (
                  <div 
                    key={order.id}
                    onClick={() => navigate('/orders')}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-8 border border-stone-100 rounded-[2rem] hover:border-stone-900 transition-all cursor-pointer bg-white"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="text-[10px] font-bold text-stone-900 uppercase tracking-widest">Order #{order.id.slice(0, 8)}</span>
                          <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                             order.status === 'delivered' ? 'bg-emerald-50 text-emerald-800' : 
                             order.status === 'cancelled' ? 'bg-red-50 text-red-800' : 
                             'bg-amber-50 text-amber-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs font-light text-stone-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end md:space-x-12">
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Total</p>
                        <p className="text-lg font-serif italic text-stone-900">₹{order.total.toLocaleString()}</p>
                      </div>
                      <ArrowRight size={16} className="text-stone-300 group-hover:text-stone-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

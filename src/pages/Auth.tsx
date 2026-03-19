import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Lock, User, ArrowRight, Loader2, Phone, ShieldCheck, KeyRound, CheckCircle2, Sparkles } from 'lucide-react';

const Auth: React.FC = () => {
  const { profile, loading: authLoading, login, signup, loginAsDemo } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';
  const navigate = useNavigate();
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  // Redirect if already logged in (if not just authenticated successfully)
  React.useEffect(() => {
    if (profile && !authLoading && !showSuccess) {
      navigate(redirect);
    }
  }, [profile, authLoading, navigate, redirect, showSuccess]);

  const handleAuthSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      navigate(redirect);
    }, 2000);
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    handleAuthSuccess();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password);
        handleAuthSuccess();
      } else {
        await signup(formData.email, formData.password, formData.displayName);
        handleAuthSuccess();
      }
    } catch (err: any) {
      console.error('WooCommerce login error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const SuccessOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
    >
      <div className="text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-8"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        
        <div className="space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-3"
          >
            <Sparkles size={20} className="text-emerald-500" />
            <h2 className="text-4xl font-serif text-stone-900 italic">Welcome <span className="text-stone-400">Back</span></h2>
          </motion.div>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-400"
          >
            Identity Verified Successfully
          </motion.p>
        </div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="h-0.5 bg-emerald-600 max-w-[200px] mx-auto mt-12"
        />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FCFAF7]">
      <AnimatePresence>
        {showSuccess && <SuccessOverlay />}
      </AnimatePresence>
      {/* Left Side: Aesthetic Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-900 relative overflow-hidden items-center justify-center p-24">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=1200&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale" 
            alt="Interior" 
          />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
          >
            <span className="text-emerald-400 text-[10px] uppercase tracking-[0.5em] font-bold mb-8 block">Est. 2024</span>
            <h2 className="text-7xl font-serif text-white mb-8 italic leading-tight">Urban Shark</h2>
            <p className="text-stone-400 font-light leading-relaxed tracking-wide text-sm uppercase">
              Curating timeless pieces for the <br /> modern spiritual journey.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-grow flex items-center justify-center p-8 sm:p-12 md:p-24">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-serif text-stone-900 mb-4 italic">
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-stone-400 font-light text-sm">
              {authMode === 'login' 
                ? 'Welcome back. Enter your details to continue.' 
                  : 'Join our community to manage your orders and favorites.'}
            </p>
          </motion.div>

          {/* Recaptcha Container */}
          <div id="recaptcha-container"></div>

            <form onSubmit={handleEmailAuth} className="space-y-6">
              <AnimatePresence mode="wait">
                {authMode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                    <input
                      required
                      type="text"
                      value={formData.displayName}
                      onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full bg-transparent border-b border-stone-200 pl-8 py-3 text-stone-900 focus:outline-none focus:border-emerald-600 transition-all font-light"
                      placeholder="Your Name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b border-stone-200 pl-8 py-3 text-stone-900 focus:outline-none focus:border-emerald-600 transition-all font-light"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400">Password</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[10px] uppercase tracking-widest font-bold text-emerald-800 hover:text-emerald-900 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-transparent border-b border-stone-200 pl-8 py-3 text-stone-900 focus:outline-none focus:border-emerald-600 transition-all font-light"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-red-500 text-[10px] uppercase tracking-widest font-bold pt-2"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-4 hover:bg-emerald-900 transition-all shadow-2xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
              <span>{authMode === 'login' ? 'Sign In' : 'Sign Up'}</span>
            </button>

          </form>

          <div className="mt-12 space-y-8">
            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-100"></div>
              </div>
              <span className="relative bg-[#FCFAF7] px-6 text-[9px] uppercase tracking-widest text-stone-300 font-bold">Authentication</span>
            </div>

            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-stone-400">
              {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-emerald-800 hover:text-emerald-900 transition-colors"
              >
                {authMode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

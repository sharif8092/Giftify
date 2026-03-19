import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
    const { forgotPassword } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            console.error('Forgot password error:', err);
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FCFAF7] p-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center space-y-8 bg-white p-12 rounded-3xl shadow-sm border border-stone-100"
                >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <CheckCircle2 size={40} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-serif text-stone-900 italic">Check Your <span className="text-stone-400">Email</span></h2>
                        <p className="text-stone-500 font-light text-sm leading-relaxed">
                            We've sent a password reset link to <br/><span className="font-bold text-stone-900">{email}</span>.
                            Please check your inbox and follow the instructions.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/auth')}
                        className="w-full bg-stone-900 text-white py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-900 transition-all shadow-lg"
                    >
                        Return to Sign In
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[#FCFAF7]">
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
                        <h2 className="text-7xl font-serif text-white mb-8 italic leading-tight">Urban Shark</h2>
                        <p className="text-stone-400 font-light leading-relaxed tracking-wide text-sm uppercase">
                            Securely recover access to your <br /> curated collection.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Forgot Password Form */}
            <div className="flex-grow flex items-center justify-center p-8 sm:p-12 md:p-24">
                <div className="max-w-md w-full">
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => navigate('/auth')}
                        className="flex items-center space-x-2 text-stone-400 hover:text-stone-900 transition-colors mb-12"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Back to Login</span>
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h1 className="text-4xl font-serif text-stone-900 mb-4 italic">Reset Password</h1>
                        <p className="text-stone-400 font-light text-sm">
                            Enter the email associated with your account and we'll send you a link to reset your password.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-transparent border-b border-stone-200 pl-8 py-3 text-stone-900 focus:outline-none focus:border-emerald-600 transition-all font-light"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="text-red-500 text-[10px] uppercase tracking-widest font-bold"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-stone-900 text-white py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-4 hover:bg-emerald-900 transition-all shadow-2xl disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />}
                            <span>Send Reset Link</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

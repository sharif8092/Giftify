import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Lock, ArrowRight, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // WordPress typically sends ?key=TOKEN&login=EMAIL
    const token = searchParams.get('key');
    const email = searchParams.get('login');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setError('Invalid or expired password reset link. Please request a new one.');
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await resetPassword(email!, token!, newPassword);
            setSuccess(true);
        } catch (err: any) {
            console.error('Reset password error:', err);
            setError(err.message || 'Failed to reset password. The link might be expired.');
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
                        <h2 className="text-3xl font-serif text-stone-900 italic">Password <span className="text-stone-400">Updated</span></h2>
                        <p className="text-stone-500 font-light text-sm leading-relaxed">
                            Your password has been changed successfully. You can now use your new password to sign in to your account.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/auth')}
                        className="w-full bg-stone-900 text-white py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-900 transition-all shadow-lg"
                    >
                        Sign In Now
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
                            Set your new credentials to <br /> keep your account secure.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Reset Password Form */}
            <div className="flex-grow flex items-center justify-center p-8 sm:p-12 md:p-24">
                <div className="max-w-md w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                            <KeyRound size={24} />
                        </div>
                        <h1 className="text-4xl font-serif text-stone-900 mb-4 italic">Set New Password</h1>
                        <p className="text-stone-400 font-light text-sm">
                            Choose a strong password with at least 8 characters.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                                <input
                                    required
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full bg-transparent border-b border-stone-200 pl-8 py-3 text-stone-900 focus:outline-none focus:border-emerald-600 transition-all font-light"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                                <input
                                    required
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full bg-transparent border-b border-stone-200 pl-8 py-3 text-stone-900 focus:outline-none focus:border-emerald-600 transition-all font-light"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="text-red-500 text-[10px] uppercase tracking-widest font-bold pt-2 border-t border-red-100"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !!error}
                            className="w-full bg-stone-900 text-white py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-4 hover:bg-emerald-900 transition-all shadow-2xl disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                            <span>Update Password</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

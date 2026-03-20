import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, Building2, User, Mail, Phone, MessageSquare, Calendar, Upload } from 'lucide-react';
import { quotationService, QuotationData } from '../services/quotationService';
import { CartItem } from '../types';

import { useCart } from '../context/CartContext';

interface QuotationFormProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onSuccess: () => void;
}

const QuotationForm: React.FC<QuotationFormProps> = ({ isOpen, onClose, items, onSuccess }) => {
  const { subtotal, gstTotal, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    message: '',
    targetDate: '',
    brandingType: 'None'
  });
  const [logo, setLogo] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const quotationData: QuotationData = {
      billing: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address_1: 'Quotation Request',
        city: 'Mumbai',
        state: 'MH',
        postcode: '400001',
        country: 'IN'
      },
      line_items: items.map(item => ({
        product_id: parseInt(item.id),
        quantity: item.quantity
      })),
      customer_note: formData.message
    };

    try {
      await quotationService.submitQuotation(quotationData);
      
      // Crucial: Call onSuccess immediately so cart is cleared before redirection
      onSuccess();
      setSubmitted(true);
      
      const isMobile = window.innerWidth < 1024;
      
      if (isMobile) {
        // Generate detailed WhatsApp message for mobile
        let message = `Hi Urban Shark Team,\n\nI just submitted a formal quotation request through the website. Here are my details:\n\n`;
        message += `*Name:* ${formData.firstName} ${formData.lastName}\n`;
        message += `*Company:* ${formData.company}\n`;
        message += `*Phone:* ${formData.phone}\n`;
        message += `*Target Date:* ${formData.targetDate}\n\n`;
        message += `*Requested Items:*\n`;
        items.forEach(item => {
          message += `- ${item.name} (Qty: ${item.quantity})\n`;
        });
        
        message += `\n*Quotation Estimate:*\n`;
        message += `- Subtotal: ₹${subtotal.toLocaleString()}\n`;
        message += `- GST (Est.): ₹${gstTotal.toLocaleString()}\n`;
        message += `- total Estimate: ₹${total.toLocaleString()}\n`;

        if (formData.message) {
          message += `\n*Special Requirements:* ${formData.message}`;
        }
        
        const whatsappUrl = `https://wa.me/917909096738?text=${encodeURIComponent(message)}`;
        
        // Use a short timeout to allow the 'Submitted' success UI to be seen for a moment
        setTimeout(() => {
          window.location.href = whatsappUrl;
        }, 2000);
      }

      // Close modal automatically after some time for desktop users
      if (!isMobile) {
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          // Reset form
          setFormData({
            firstName: '',
            lastName: '',
            company: '',
            email: '',
            phone: '',
            message: ''
          });
        }, 4000);
      }
    } catch (error: any) {
      console.error('Quotation Submission Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit quotation. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-stone-900 px-10 py-8 flex justify-between items-center text-white">
              <div>
                <h2 className="text-2xl font-serif">Request a <span className="italic">Formal Quotation</span></h2>
                <p className="text-stone-400 text-[10px] uppercase tracking-widest mt-1">Submit your details for a bespoke proposal</p>
              </div>
              <button 
                onClick={onClose}
                className="text-stone-400 hover:text-white transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-10 max-h-[80vh] overflow-y-auto">
              {submitted ? (
                <div className="text-center py-20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600"
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <h3 className="text-3xl font-serif text-stone-900 mb-4">Quotation Request Sent</h3>
                  <p className="text-stone-500 font-light max-w-md mx-auto">Our gifting experts will review your request and get back to you with a formal proposal within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">First Name</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input
                          required
                          type="text"
                          value={formData.firstName}
                          onChange={e => setFormData({...formData, firstName: e.target.value})}
                          className="w-full bg-stone-50 border-2 border-transparent rounded-[1.25rem] py-5 pl-14 pr-6 text-sm focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input
                          required
                          type="text"
                          value={formData.lastName}
                          onChange={e => setFormData({...formData, lastName: e.target.value})}
                          className="w-full bg-stone-50 border-2 border-transparent rounded-[1.25rem] py-5 pl-14 pr-6 text-sm focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                      <input
                        required
                        type="text"
                        value={formData.company}
                        onChange={e => setFormData({...formData, company: e.target.value})}
                        className="w-full bg-stone-50 border-2 border-transparent rounded-[1.25rem] py-5 pl-14 pr-6 text-sm focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                        placeholder="Your Organization Pvt Ltd"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-stone-50 border-2 border-transparent rounded-[1.25rem] py-5 pl-14 pr-6 text-sm focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-stone-50 border-2 border-transparent rounded-[1.25rem] py-5 pl-14 pr-6 text-sm focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                          placeholder="+91 79090 96738"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Target Delivery Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input
                          required
                          type="date"
                          value={formData.targetDate}
                          onChange={e => setFormData({...formData, targetDate: e.target.value})}
                          className="w-full bg-stone-50 border-2 border-transparent rounded-[1.25rem] py-5 pl-14 pr-6 text-sm focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Company Logo (Optional)</label>
                      <div className="relative">
                        <Upload className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setLogo(e.target.files ? e.target.files[0] : null)}
                          className="w-full bg-stone-50 border-2 border-transparent rounded-[1.25rem] py-5 pl-14 pr-6 text-xs file:hidden cursor-pointer focus:bg-white focus:border-emerald-500/30 outline-none transition-all"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400 pointer-events-none">
                          {logo ? logo.name.slice(0, 15) + '...' : 'Upload File'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Inquiry Details (Branding, Special Requirements)</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-5 top-6 text-stone-300" size={18} />
                      <textarea
                        rows={4}
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-stone-50 border-2 border-transparent rounded-[1.5rem] py-5 pl-14 pr-6 text-sm focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all resize-none"
                        placeholder="Mention any specific logo placement or custom packaging needs..."
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full h-[70px] bg-emerald-900 text-white rounded-full font-bold text-xs uppercase tracking-[0.3em] hover:bg-stone-900 transition-all shadow-2xl shadow-emerald-900/30 flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={20} />
                          Finalize Quotation Request
                        </>
                      )}
                    </button>
                    <p className="text-center text-[9px] text-stone-400 uppercase tracking-widest font-bold mt-6">
                      By submitting, you agree to our corporate service terms
                    </p>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuotationForm;

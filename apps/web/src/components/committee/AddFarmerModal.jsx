import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin, User, CreditCard, UserPlus } from 'lucide-react';

export default function AddFarmerModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    aadhaar: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Enter valid 10-digit phone number';
    }
    if (!formData.village.trim()) newErrors.village = 'Village is required';
    if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar)) {
      newErrors.aadhaar = 'Enter valid 12-digit Aadhaar';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newFarmer = {
      id: Date.now(),
      name: formData.name,
      phone: formData.phone,
      village: formData.village,
      aadhaar: formData.aadhaar,
      totalSales: 0,
      lastActive: new Date().toISOString().split('T')[0],
      totalQuantity: 0,
    };
    
    onAdd(newFarmer);
    setFormData({ name: '', phone: '', village: '', aadhaar: '' });
    setIsSubmitting(false);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Add New Farmer</h2>
                      <p className="text-sm text-slate-500">Register a farmer in the system</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter farmer's full name"
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                        errors.name 
                          ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                          : 'border-slate-200 focus:border-emerald-500 hover:border-slate-300'
                      } focus:ring-0 focus:outline-none transition-all text-sm bg-slate-50 focus:bg-white`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                        errors.phone 
                          ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                          : 'border-slate-200 focus:border-emerald-500 hover:border-slate-300'
                      } focus:ring-0 focus:outline-none transition-all text-sm bg-slate-50 focus:bg-white`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Village <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      placeholder="Enter village name"
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                        errors.village 
                          ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                          : 'border-slate-200 focus:border-emerald-500 hover:border-slate-300'
                      } focus:ring-0 focus:outline-none transition-all text-sm bg-slate-50 focus:bg-white`}
                    />
                  </div>
                  {errors.village && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.village}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Aadhaar Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="aadhaar"
                      value={formData.aadhaar}
                      onChange={handleChange}
                      placeholder="12-digit Aadhaar number"
                      maxLength={12}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                        errors.aadhaar 
                          ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                          : 'border-slate-200 focus:border-emerald-500 hover:border-slate-300'
                      } focus:ring-0 focus:outline-none transition-all text-sm bg-slate-50 focus:bg-white`}
                    />
                  </div>
                  {errors.aadhaar && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.aadhaar}</p>}
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-5 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-5 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Add Farmer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

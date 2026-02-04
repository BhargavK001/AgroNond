import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IndianRupee,
    Save,
    Plus,
    Trash2,
    Search,
    Loader2,
    Check,
    AlertCircle,
    Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

// Default vegetables list
const DEFAULT_VEGETABLES = [
    'Tomato', 'Onion', 'Potato', 'Cabbage', 'Cauliflower',
    'Carrot', 'Brinjal', 'Lady Finger', 'Capsicum', 'Green Chilli',
    'Cucumber', 'Beetroot', 'Spinach', 'Coriander', 'Mint',
    'Garlic', 'Ginger', 'Lemon', 'Pumpkin', 'Bottle Gourd'
];

export default function DailyRates({ readOnly = false }) {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newVegetable, setNewVegetable] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchTodayRates();
    }, []);

    const fetchTodayRates = async () => {
        try {
            setLoading(true);
            const response = await api.get('/daily-rates/today');

            // Create a map of existing rates
            const existingRates = {};
            response.data.forEach(rate => {
                existingRates[rate.vegetable] = rate;
            });

            // Merge with default vegetables
            const mergedRates = DEFAULT_VEGETABLES.map(veg => {
                if (existingRates[veg]) {
                    return existingRates[veg];
                }
                return { vegetable: veg, rate: 0, unit: 'kg', isNew: true };
            });

            // Add any custom vegetables from backend that aren't in defaults
            response.data.forEach(rate => {
                if (!DEFAULT_VEGETABLES.includes(rate.vegetable)) {
                    mergedRates.push(rate);
                }
            });

            setRates(mergedRates);
        } catch (error) {
            console.error('Error fetching rates:', error);
            // Initialize with default vegetables if API fails
            setRates(DEFAULT_VEGETABLES.map(veg => ({ vegetable: veg, rate: 0, unit: 'kg', isNew: true })));
        } finally {
            setLoading(false);
        }
    };

    const handleRateChange = (index, newRate) => {
        const updated = [...rates];
        updated[index] = { ...updated[index], rate: parseFloat(newRate) || 0, modified: true };
        setRates(updated);
    };

    const handleSaveAll = async () => {
        try {
            setSaving(true);
            const ratesToSave = rates.filter(r => r.rate > 0).map(r => ({
                vegetable: r.vegetable,
                rate: r.rate,
                unit: r.unit || 'kg'
            }));

            await api.post('/daily-rates/bulk', { rates: ratesToSave });
            toast.success('Rates saved successfully!');

            // Refresh to get updated data with IDs
            await fetchTodayRates();
        } catch (error) {
            console.error('Error saving rates:', error);
            toast.error('Failed to save rates');
        } finally {
            setSaving(false);
        }
    };

    const handleAddVegetable = () => {
        if (!newVegetable.trim()) return;

        // Check if already exists
        if (rates.some(r => r.vegetable.toLowerCase() === newVegetable.toLowerCase())) {
            toast.error('Vegetable already exists!');
            return;
        }

        setRates([...rates, { vegetable: newVegetable.trim(), rate: 0, unit: 'kg', isNew: true }]);
        setNewVegetable('');
        setShowAddForm(false);
        toast.success(`Added ${newVegetable}`);
    };

    const handleRemoveVegetable = async (index) => {
        const rate = rates[index];

        if (rate._id) {
            try {
                await api.delete(`/daily-rates/${rate._id}`);
                toast.success('Rate removed');
            } catch (error) {
                toast.error('Failed to remove rate');
                return;
            }
        }

        const updated = [...rates];
        updated.splice(index, 1);
        setRates(updated);
    };

    const filteredRates = rates.filter(r =>
        r.vegetable.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const modifiedCount = rates.filter(r => r.modified).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Today's Market Rates</h1>
                    <p className="text-sm text-slate-500 mt-1 hidden sm:block">
                        {readOnly ? 'View current market prices set by the committee' : 'Set today\'s market prices for vegetables and crops'}
                    </p>
                </div>

                {!readOnly && (
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                        {modifiedCount > 0 && (
                            <span className="text-xs sm:text-sm text-amber-600 bg-amber-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium">
                                {modifiedCount} unsaved
                            </span>
                        )}
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-sm sm:text-base"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span className="hidden xs:inline">Save All</span>
                            <span className="xs:hidden">Save</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Search and Add */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search vegetables..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                {!readOnly && (
                    <AnimatePresence>
                        {showAddForm ? (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    placeholder="Vegetable name"
                                    value={newVegetable}
                                    onChange={(e) => setNewVegetable(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddVegetable()}
                                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    autoFocus
                                />
                                <button
                                    onClick={handleAddVegetable}
                                    className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => { setShowAddForm(false); setNewVegetable(''); }}
                                    className="px-4 py-3 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        ) : (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-700"
                            >
                                <Plus className="w-5 h-5" />
                                Add Vegetable
                            </button>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Rates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredRates.map((rate, index) => (
                    <motion.div
                        key={rate.vegetable}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`bg-white rounded-xl border p-4 transition-all ${rate.modified
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                            : rate.rate > 0
                                ? 'border-emerald-200'
                                : 'border-slate-200'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${rate.rate > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Package className="w-4 h-4" />
                                </div>
                                <span className="font-semibold text-slate-900">{rate.vegetable}</span>
                            </div>
                            {!readOnly && !DEFAULT_VEGETABLES.includes(rate.vegetable) && (
                                <button
                                    onClick={() => handleRemoveVegetable(index)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {readOnly ? (
                                <>
                                    <div className={`flex-1 py-2.5 px-3 rounded-lg text-lg font-bold ${rate.rate > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                        ₹{rate.rate || 0}
                                    </div>
                                    <span className="text-sm text-slate-500 font-medium">/{rate.unit || 'kg'}</span>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1 relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={rate.rate || ''}
                                            onChange={(e) => handleRateChange(rates.indexOf(rate), e.target.value)}
                                            onWheel={(e) => e.target.blur()}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold"
                                        />
                                    </div>
                                    <span className="text-sm text-slate-500 font-medium">/{rate.unit || 'kg'}</span>
                                </>
                            )}
                        </div>

                        {rate.set_by && (
                            <p className="text-xs text-slate-400 mt-2">
                                Set by {rate.set_by.full_name || 'Committee'}
                            </p>
                        )}
                    </motion.div>
                ))}
            </div>

            {filteredRates.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No vegetables found matching "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
}

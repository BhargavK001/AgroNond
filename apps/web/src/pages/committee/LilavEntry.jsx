import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    User,
    Package,
    Scale,
    IndianRupee,
    ShoppingCart,
    Check,
    Loader2,
    AlertCircle,
    ChevronRight,
    RefreshCw,
    CheckCircle2,
    X,
    Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

// Import Modals
import AddFarmerModal from '../../components/committee/AddFarmerModal';
import AddTraderModal from '../../components/committee/AddTraderModal';

export default function LilavEntry() {
    // States
    const [farmers, setFarmers] = useState([]);
    const [traders, setTraders] = useState([]);
    const [dailyRates, setDailyRates] = useState([]);
    const [weighedRecords, setWeighedRecords] = useState([]);

    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [farmerSearch, setFarmerSearch] = useState('');
    const [traderSearch, setTraderSearch] = useState('');

    const [loading, setLoading] = useState(true);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    // Modal States
    const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
    const [isTraderModalOpen, setIsTraderModalOpen] = useState(false);

    // Sale modal state
    const [saleModal, setSaleModal] = useState({ open: false, record: null });
    const [saleForm, setSaleForm] = useState({ trader_id: '', sale_rate: 0, sale_unit: 'kg' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [farmersRes, tradersRes, ratesRes] = await Promise.all([
                api.get('/api/users?role=farmer'),
                api.get('/api/users?role=trader'),
                api.get('/api/daily-rates/today')
            ]);

            setFarmers(farmersRes || []);
            setTraders(tradersRes || []);
            setDailyRates(ratesRes || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    const fetchWeighedRecords = async (farmerId) => {
        try {
            setLoadingRecords(true);
            const response = await api.get(`/api/records/pending/${farmerId}`);
            setWeighedRecords(response || []);
        } catch (error) {
            console.error('Error fetching records:', error);
            toast.error('Failed to load farmer records');
            setWeighedRecords([]);
        } finally {
            setLoadingRecords(false);
        }
    };

    // Callback when a new farmer is added
    const handleAddFarmer = (newFarmer) => {
        setFarmers(prev => [newFarmer, ...prev]);
        toast.success(`${newFarmer.full_name} added to list`);
    };

    // Callback when a new trader is added
    const handleAddTrader = (newTrader) => {
        setTraders(prev => [newTrader, ...prev]);
        toast.success(`${newTrader.full_name} added to list`);
    };

    const handleSelectFarmer = (farmer) => {
        setSelectedFarmer(farmer);
        setFarmerSearch('');
        fetchWeighedRecords(farmer._id);
    };

    // Helper function to get effective carat and qty values
    const getEffectiveValues = (record) => {
        const caratValue = (record.official_carat && record.official_carat > 0)
            ? record.official_carat
            : (record.carat || 0);
        const qtyValue = (record.official_qty && record.official_qty > 0)
            ? record.official_qty
            : (record.quantity || 0);
        return { caratValue, qtyValue };
    };

    const handleOpenSaleModal = (record) => {
        // Find today's rate for this vegetable
        const todayRate = dailyRates.find(r =>
            r.vegetable.toLowerCase() === record.vegetable.toLowerCase()
        );

        // Use effective carat value (official or farmer's initial)
        const { caratValue } = getEffectiveValues(record);

        const recordUnit = record.sale_unit || (caratValue > 0 ? 'carat' : 'kg');
        setSaleForm({
            trader_id: '',
            sale_rate: todayRate?.rate || '',
            sale_unit: recordUnit
        });
        setSaleModal({ open: true, record, lockedUnit: recordUnit });
    };

    const handleConfirmSale = async () => {
        if (!saleForm.trader_id) {
            toast.error('Please select a trader');
            return;
        }
        if (!saleForm.sale_rate || saleForm.sale_rate <= 0) {
            toast.error('Please enter a valid rate');
            return;
        }

        try {
            setProcessingId(saleModal.record._id);

            await api.patch(`/api/records/${saleModal.record._id}/sell`, {
                trader_id: saleForm.trader_id,
                sale_rate: saleForm.sale_rate,
                sale_unit: saleForm.sale_unit
            });

            toast.success('Rate assigned successfully! Sent to weight.');

            // Trigger Success Modal
            setSaleModal(prev => ({ ...prev, success: true }));

            // Remove from list after a short delay or immediately (optional)
            setWeighedRecords(prev => prev.filter(r => r._id !== saleModal.record._id));
        } catch (error) {
            console.error('Error completing sale:', error);
            toast.error(error.response?.data?.error || 'Failed to complete sale');
        } finally {
            setProcessingId(null);
        }
    };

    // Filter farmers by search
    const filteredFarmers = useMemo(() => {
        if (!farmerSearch.trim()) return farmers.slice(0, 10);
        return farmers.filter(f =>
            f.full_name?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
            f.phone?.includes(farmerSearch)
        ).slice(0, 10);
    }, [farmers, farmerSearch]);

    // Filter traders by search
    const filteredTraders = useMemo(() => {
        if (!traderSearch.trim()) return traders;
        return traders.filter(t =>
            t.full_name?.toLowerCase().includes(traderSearch.toLowerCase()) ||
            t.business_name?.toLowerCase().includes(traderSearch.toLowerCase()) ||
            t.phone?.includes(traderSearch)
        );
    }, [traders, traderSearch]);

    const calculateAmount = (qty, rate) => {
        return (qty || 0) * (rate || 0);
    };

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Lilav Entry</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Auction Entry</h1>
                    <p className="text-sm text-slate-500 mt-1 hidden sm:block">Select farmer, view crops, assign trader and confirm sale</p>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={fetchInitialData}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <button
                        onClick={() => setIsFarmerModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="whitespace-nowrap">Add Farmer</span>
                    </button>

                    <button
                        onClick={() => setIsTraderModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="whitespace-nowrap">Add Trader</span>
                    </button>
                </div>
            </div>

            {/* Step 1: Select Farmer */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                    <h2 className="font-bold text-slate-900">Select Farmer</h2>
                </div>

                <div className="p-4">
                    {selectedFarmer ? (
                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                                    {selectedFarmer.full_name?.charAt(0) || 'F'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{selectedFarmer.full_name || 'Unknown'}</p>
                                    <p className="text-sm text-slate-500">{selectedFarmer.phone}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSelectedFarmer(null); setWeighedRecords([]); }}
                                className="px-4 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search farmer by name or phone..."
                                    value={farmerSearch}
                                    onChange={(e) => setFarmerSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            {/* Farmer List */}
                            <div className="mt-4 flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <h3 className="text-sm font-semibold text-slate-500 mb-2">Recent Farmers</h3>
                                {filteredFarmers.length > 0 ? (
                                    filteredFarmers.map((farmer) => (
                                        <button
                                            key={farmer._id}
                                            onClick={() => handleSelectFarmer(farmer)}
                                            className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 transition-colors text-left border border-slate-200 rounded-xl group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold group-hover:bg-emerald-200 transition-colors">
                                                {farmer.full_name?.charAt(0) || 'F'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900">{farmer.full_name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500">{farmer.phone}</p>
                                            </div>
                                            <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                                                Select
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-200 rounded-xl">
                                        No farmers found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Step 2: Weighed Crops */}
            {selectedFarmer && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                            <h2 className="font-bold text-slate-900">Pending Crops</h2>
                            <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">
                                {weighedRecords.length} items
                            </span>
                        </div>
                    </div>

                    <div className="p-4">
                        {loadingRecords ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                            </div>
                        ) : weighedRecords.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No pending crops for this farmer</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {weighedRecords.map((record) => {
                                    const todayRate = dailyRates.find(r =>
                                        r.vegetable.toLowerCase() === record.vegetable.toLowerCase()
                                    );

                                    // UPDATED: Use effective values (official or farmer's initial)
                                    const { caratValue, qtyValue } = getEffectiveValues(record);
                                    const hasCarat = caratValue > 0;
                                    const estimatedAmount = hasCarat
                                        ? calculateAmount(caratValue, todayRate?.rate || 0)
                                        : calculateAmount(qtyValue, todayRate?.rate || 0);

                                    return (
                                        <div
                                            key={record._id}
                                            className="flex flex-col p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                        <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm sm:text-base">{record.vegetable}</p>
                                                        {/* UPDATED: Show both kg and Carat weight with fallback */}
                                                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                {qtyValue} kg
                                                            </span>
                                                            {hasCarat && (
                                                                <span className="flex items-center gap-1 text-purple-600 font-medium">
                                                                    <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    {caratValue} Crt
                                                                </span>
                                                            )}
                                                            {todayRate && (
                                                                <span className="flex items-center gap-1">
                                                                    <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    ₹{todayRate.rate}/{hasCarat ? 'Crt' : 'kg'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                                <div>
                                                    <p className="text-xs text-slate-500">Est. Amount</p>
                                                    <p className="text-base sm:text-lg font-bold text-emerald-600">
                                                        ₹{estimatedAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleOpenSaleModal(record)}
                                                    disabled={processingId === record._id}
                                                    className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
                                                >
                                                    {processingId === record._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <ShoppingCart className="w-4 h-4" />
                                                    )}
                                                    Assign Rate
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Sale Modals */}
            <AnimatePresence>
                {/* 1. CONFIRMATION MODAL */}
                {saleModal.open && saleModal.record && !saleModal.success && (() => {
                    // UPDATED: Calculate effective values for modal
                    const { caratValue: modalCaratValue, qtyValue: modalQtyValue } = getEffectiveValues(saleModal.record);
                    const modalHasCarat = modalCaratValue > 0;

                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                            onClick={() => setSaleModal({ open: false, record: null })}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8"
                            >
                                {/* Header */}
                                <div className="bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Assign Rate</h2>
                                        <p className="text-gray-500 text-sm">Set rate and trader for this lot</p>
                                    </div>
                                    <button
                                        onClick={() => setSaleModal({ open: false, record: null })}
                                        className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* UPDATED: Vegetable Details Summary - Show both kg and Carat with fallback */}
                                    <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                            <Package size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Lot Details</p>
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                {saleModal.record.vegetable}
                                            </h3>
                                            {/* UPDATED: Show both weights when available with fallback */}
                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Scale className="w-4 h-4" />
                                                    {modalQtyValue} Kg
                                                </span>
                                                {modalHasCarat && (
                                                    <span className={`text-sm flex items-center gap-1 font-medium ${saleForm.sale_unit === 'carat' ? 'text-purple-600' : 'text-gray-600'}`}>
                                                        <Scale className="w-4 h-4" />
                                                        {modalCaratValue} Crt
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Farmer: <span className="font-medium text-gray-900">{selectedFarmer?.full_name}</span>
                                            </div>
                                        </div>
                                        {/* Show currently selected unit badge */}
                                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${saleForm.sale_unit === 'carat' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            Selling by {saleForm.sale_unit === 'carat' ? 'Carat' : 'Kg'}
                                        </div>
                                    </div>

                                    {/* UPDATED: Sale Unit Toggle - Show when carat exists (using fallback) */}
                                    {modalHasCarat && (
                                        <div className="flex bg-gray-100 p-1 rounded-xl">
                                            <button
                                                onClick={() => setSaleForm(prev => ({ ...prev, sale_unit: 'carat' }))}
                                                disabled={saleModal.lockedUnit === 'kg'}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${saleForm.sale_unit === 'carat'
                                                    ? 'bg-white text-purple-600 shadow-sm'
                                                    : (saleModal.lockedUnit === 'kg' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700')
                                                    }`}
                                            >
                                                Sell by Carat ({modalCaratValue} Crt)
                                            </button>
                                            <button
                                                onClick={() => setSaleForm(prev => ({ ...prev, sale_unit: 'kg' }))}
                                                disabled={saleModal.lockedUnit === 'carat'}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${saleForm.sale_unit === 'kg'
                                                    ? 'bg-white text-emerald-600 shadow-sm'
                                                    : (saleModal.lockedUnit === 'carat' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700')
                                                    }`}
                                            >
                                                Sell by Weight ({modalQtyValue} kg)
                                            </button>
                                        </div>
                                    )}

                                    {/* Inputs Row */}
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Sale Rate (₹/{saleForm.sale_unit === 'carat' ? 'Carat' : 'Kg'})
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={saleForm.sale_rate}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setSaleForm(prev => ({ ...prev, sale_rate: val === '' ? '' : parseFloat(val) }));
                                                    }}
                                                    placeholder="0"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-lg outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-sm font-semibold text-gray-700">Buyer (Trader)</label>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search trader..."
                                                    value={traderSearch}
                                                    onChange={(e) => setTraderSearch(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trader Selection List (Compact) */}
                                    <div className="h-40 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/50 p-2 custom-scrollbar">
                                        {filteredTraders.map((trader) => (
                                            <button
                                                key={trader._id}
                                                onClick={() => setSaleForm(prev => ({ ...prev, trader_id: trader._id }))}
                                                className={`w-full flex items-center p-2 rounded-lg mb-1 transition ${saleForm.trader_id === trader._id ? 'bg-emerald-100 border border-emerald-200' : 'hover:bg-gray-100'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${saleForm.trader_id === trader._id ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                    {trader.full_name?.charAt(0)}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="font-semibold text-sm text-gray-900">{trader.full_name}</p>
                                                    <p className="text-xs text-gray-500">{trader.business_name}</p>
                                                </div>
                                                {saleForm.trader_id === trader._id && <CheckCircle2 size={16} className="text-emerald-600" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                                    <button
                                        onClick={() => setSaleModal({ open: false, record: null })}
                                        className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmSale}
                                        disabled={!saleForm.trader_id || processingId}
                                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processingId ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                                        Confirm & Send to Weight
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}

                {/* 2. SUCCESS MODAL */}
                {saleModal.success && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center"
                        >
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rate Assigned!</h2>
                            <p className="text-gray-500 mb-8">Role and Trader assigned. Record sent to weight station for finalization.</p>
                            <button
                                onClick={() => setSaleModal({ open: false, record: null, success: false })}
                                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition"
                            >
                                Done
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Farmer Modal */}
            <AddFarmerModal
                isOpen={isFarmerModalOpen}
                onClose={() => setIsFarmerModalOpen(false)}
                onAdd={handleAddFarmer}
            />

            {/* Add Trader Modal */}
            <AddTraderModal
                isOpen={isTraderModalOpen}
                onClose={() => setIsTraderModalOpen(false)}
                onAdd={handleAddTrader}
            />
        </div>
    );
}
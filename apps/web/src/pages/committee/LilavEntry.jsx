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
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

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

    // Sale modal state
    const [saleModal, setSaleModal] = useState({ open: false, record: null });
    const [saleForm, setSaleForm] = useState({ trader_id: '', sale_rate: 0 });

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
            const response = await api.get(`/api/records/weighed/${farmerId}`);
            setWeighedRecords(response || []);
        } catch (error) {
            console.error('Error fetching records:', error);
            toast.error('Failed to load farmer records');
            setWeighedRecords([]);
        } finally {
            setLoadingRecords(false);
        }
    };

    const handleSelectFarmer = (farmer) => {
        setSelectedFarmer(farmer);
        setFarmerSearch('');
        fetchWeighedRecords(farmer._id);
    };

    const handleOpenSaleModal = (record) => {
        // Find today's rate for this vegetable
        const todayRate = dailyRates.find(r =>
            r.vegetable.toLowerCase() === record.vegetable.toLowerCase()
        );

        setSaleForm({
            trader_id: '',
            sale_rate: todayRate?.rate || 0
        });
        setSaleModal({ open: true, record });
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

            const response = await api.patch(`/api/records/${saleModal.record._id}/sell`, {
                trader_id: saleForm.trader_id,
                sale_rate: saleForm.sale_rate
            });

            // Show success with transaction details
            const txnNumber = response.transaction?.transaction_number || '';
            toast.success(`Sale completed! ${txnNumber}`);

            // Remove from list
            setWeighedRecords(prev => prev.filter(r => r._id !== saleModal.record._id));
            setSaleModal({ open: false, record: null });
        } catch (error) {
            console.error('Error completing sale:', error);
            toast.error(error.message || 'Failed to complete sale');
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

                <button
                    onClick={fetchInitialData}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 text-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
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
                            <h2 className="font-bold text-slate-900">Weighed Crops</h2>
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
                                <p className="text-slate-500">No weighed crops pending for this farmer</p>
                                <p className="text-sm text-slate-400 mt-1">Crops need to be weighed first before they can be auctioned</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {weighedRecords.map((record) => {
                                    const todayRate = dailyRates.find(r =>
                                        r.vegetable.toLowerCase() === record.vegetable.toLowerCase()
                                    );
                                    const estimatedAmount = calculateAmount(record.official_qty, todayRate?.rate || 0);

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
                                                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                {record.official_qty} kg
                                                            </span>
                                                            {todayRate && (
                                                                <span className="flex items-center gap-1">
                                                                    <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    ₹{todayRate.rate}/kg
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
                                                    Sell
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

            {/* Sale Modal */}
            <AnimatePresence>
                {saleModal.open && saleModal.record && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                        onClick={() => setSaleModal({ open: false, record: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between sticky top-0">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Complete Sale</h3>
                                    <p className="text-xs sm:text-sm text-slate-500">{saleModal.record.vegetable} - {saleModal.record.official_qty} kg</p>
                                </div>
                                <button
                                    onClick={() => setSaleModal({ open: false, record: null })}
                                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                                {/* Rate Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sale Rate (₹/kg)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={saleForm.sale_rate}
                                            onChange={(e) => setSaleForm(prev => ({ ...prev, sale_rate: parseFloat(e.target.value) || 0 }))}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-semibold"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Today's rate auto-filled if available</p>
                                </div>

                                {/* Trader Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Trader</label>
                                    <div className="relative mb-3">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search trader..."
                                            value={traderSearch}
                                            onChange={(e) => setTraderSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {filteredTraders.map((trader) => (
                                            <button
                                                key={trader._id}
                                                onClick={() => setSaleForm(prev => ({ ...prev, trader_id: trader._id }))}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${saleForm.trader_id === trader._id
                                                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                                                    : 'border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${saleForm.trader_id === trader._id
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-200 text-slate-600'
                                                    }`}>
                                                    {trader.full_name?.charAt(0) || 'T'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900">{trader.full_name || trader.business_name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500">{trader.phone}</p>
                                                </div>
                                                {saleForm.trader_id === trader._id && (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Commission Breakdown */}
                                {(() => {
                                    const baseAmount = calculateAmount(saleModal.record.official_qty, saleForm.sale_rate);
                                    const farmerCommission = Math.round((baseAmount * 4 / 100) * 100) / 100;
                                    const traderCommission = Math.round((baseAmount * 9 / 100) * 100) / 100;
                                    const farmerPayable = baseAmount - farmerCommission;
                                    const traderReceivable = baseAmount + traderCommission;
                                    
                                    return (
                                        <div className="space-y-3">
                                            {/* Base Amount */}
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-600">Base Amount</span>
                                                    <span className="text-xl font-bold text-slate-800">
                                                        ₹{baseAmount.toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {saleModal.record.official_qty} kg × ₹{saleForm.sale_rate}/kg
                                                </p>
                                            </div>
                                            
                                            {/* Commission Details */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Farmer */}
                                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                                                    <p className="text-xs font-semibold text-blue-700 mb-2">Farmer Gets</p>
                                                    <p className="text-lg font-bold text-blue-800">₹{farmerPayable.toLocaleString()}</p>
                                                    <p className="text-[10px] text-blue-600 mt-1">After 4% (₹{farmerCommission}) deduction</p>
                                                </div>
                                                
                                                {/* Trader */}
                                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                                    <p className="text-xs font-semibold text-amber-700 mb-2">Trader Pays</p>
                                                    <p className="text-lg font-bold text-amber-800">₹{traderReceivable.toLocaleString()}</p>
                                                    <p className="text-[10px] text-amber-600 mt-1">Incl. 9% (₹{traderCommission}) commission</p>
                                                </div>
                                            </div>
                                            
                                            {/* Total Commission */}
                                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-emerald-700">Market Commission (Total)</span>
                                                    <span className="text-lg font-bold text-emerald-700">
                                                        ₹{(farmerCommission + traderCommission).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-emerald-600 mt-1">
                                                    4% from farmer + 9% from trader = 13% of ₹{baseAmount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-2 sm:gap-3 sticky bottom-0 bg-white">
                                <button
                                    onClick={() => setSaleModal({ open: false, record: null })}
                                    className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmSale}
                                    disabled={!saleForm.trader_id || processingId}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    {processingId ? (
                                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="hidden sm:inline">Confirm Sale</span>
                                            <span className="sm:hidden">Confirm</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

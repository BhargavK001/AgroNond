import { useState, useEffect, useMemo, useRef } from 'react';
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
    RefreshCw,
    X,
    Plus,
    Edit2,
    Trash2,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

import AddFarmerModal from '../../components/committee/AddFarmerModal';
import AddTraderModal from '../../components/committee/AddTraderModal';

export default function LilavEntry() {
    // --- Data States ---
    const [farmers, setFarmers] = useState([]);
    const [traders, setTraders] = useState([]);
    const [dailyRates, setDailyRates] = useState([]);
    const [weighedRecords, setWeighedRecords] = useState([]);

    // --- Loading States ---
    const [loading, setLoading] = useState(true);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    // --- Selection / Input States ---
    const [tokenInput, setTokenInput] = useState('');
    const [nameSearch, setNameSearch] = useState('');
    const [selectedFarmer, setSelectedFarmer] = useState(null);

    // --- Active Auction State ---
    const [activeRecord, setActiveRecord] = useState(null);
    const [saleForm, setSaleForm] = useState({
        trader_id: '',
        sale_rate: '',
        sale_unit: 'kg',
        allocation_qty: ''
    });
    const [traderAllocations, setTraderAllocations] = useState([]);
    const [editingAllocationIndex, setEditingAllocationIndex] = useState(null);
    const [traderSearch, setTraderSearch] = useState('');

    // --- References for Focus Management ---
    const tokenInputRef = useRef(null);
    const rateInputRef = useRef(null);
    const traderSearchRef = useRef(null);

    // --- Initialization ---
    useEffect(() => {
        fetchInitialData();
        setTimeout(() => tokenInputRef.current?.focus(), 500);
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [farmersRes, tradersRes, ratesRes] = await Promise.all([
                api.get('/api/users?role=farmer'),
                api.get('/api/users?role=trader'),
                api.get('/api/daily-rates/today')
            ]);
            setFarmers(farmersRes?.data || farmersRes || []);
            setTraders(tradersRes?.data || tradersRes || []);
            setDailyRates(ratesRes || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!tokenInput.trim()) return;
        const found = farmers.find(f =>
            f.farmerId?.toLowerCase() === tokenInput.toLowerCase() ||
            f.customId?.toLowerCase() === tokenInput.toLowerCase()
        );
        if (found) {
            handleSelectFarmer(found);
        }
    }, [tokenInput, farmers]);

    useEffect(() => {
        if (selectedFarmer?._id) {
            fetchWeighedRecords(selectedFarmer._id);
        } else {
            setWeighedRecords([]);
        }
    }, [selectedFarmer]);

    const handleSelectFarmer = (farmer) => {
        setSelectedFarmer(farmer);
        setTokenInput('');
        setNameSearch('');
        setActiveRecord(null);
    };

    const fetchWeighedRecords = async (farmerId) => {
        try {
            setLoadingRecords(true);
            const response = await api.get(`/api/records/pending/${farmerId}`);
            setWeighedRecords(response || []);
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoadingRecords(false);
        }
    };

    const getEffectiveValues = (record) => {
        if (record.has_remaining) {
            return {
                caratValue: record.remaining_carat || 0,
                qtyValue: record.remaining_qty || 0
            };
        }
        const caratValue = (record.official_carat > 0) ? record.official_carat : (record.carat || 0);
        const qtyValue = (record.official_qty > 0) ? record.official_qty : (record.quantity || 0);
        return { caratValue, qtyValue };
    };

    const startAuction = (record) => {
        const todayRate = dailyRates.find(r => r.vegetable.toLowerCase() === record.vegetable.toLowerCase());
        const { caratValue } = getEffectiveValues(record);
        const recordUnit = caratValue > 0 ? 'carat' : 'kg';
        const initialRate = record.prev_rate || todayRate?.rate || '';

        setActiveRecord(record);
        setSaleForm({
            trader_id: '',
            sale_rate: initialRate,
            sale_unit: recordUnit,
            allocation_qty: ''
        });
        setTraderAllocations([]);
        setEditingAllocationIndex(null);
        setTraderSearch('');

        setTimeout(() => rateInputRef.current?.focus(), 50);
    };

    const cancelAuction = () => {
        setActiveRecord(null);
        setTraderAllocations([]);
    };

    const handleAddAllocation = () => {
        if (!saleForm.trader_id) return toast.error('Select a trader');
        if (!saleForm.allocation_qty || parseFloat(saleForm.allocation_qty) <= 0) return toast.error('Invalid Qty');
        if (!saleForm.sale_rate || parseFloat(saleForm.sale_rate) <= 0) return toast.error('Invalid Rate');

        const trader = traders.find(t => t._id === saleForm.trader_id);
        if (!trader) return toast.error('Trader not found');

        const { caratValue, qtyValue } = getEffectiveValues(activeRecord);
        const totalAvailable = caratValue > 0 ? caratValue : qtyValue;
        const currentAllocated = traderAllocations.reduce((sum, a, idx) =>
            idx !== editingAllocationIndex ? sum + parseFloat(a.quantity) : sum, 0);

        if (currentAllocated + parseFloat(saleForm.allocation_qty) > totalAvailable) {
            return toast.error(`Max available: ${totalAvailable - currentAllocated}`);
        }

        const newAlloc = {
            trader_id: trader._id,
            trader_name: trader.full_name,
            business_name: trader.business_name,
            quantity: parseFloat(saleForm.allocation_qty),
            rate: parseFloat(saleForm.sale_rate)
        };

        if (editingAllocationIndex !== null) {
            setTraderAllocations(prev => {
                const copy = [...prev];
                copy[editingAllocationIndex] = newAlloc;
                return copy;
            });
            setEditingAllocationIndex(null);
        } else {
            setTraderAllocations(prev => [...prev, newAlloc]);
        }

        setSaleForm(prev => ({
            ...prev,
            trader_id: '',
            allocation_qty: ''
        }));
        setTraderSearch('');
        document.querySelector('#qty-input')?.focus();
    };

    const deleteAllocation = (idx) => {
        setTraderAllocations(prev => prev.filter((_, i) => i !== idx));
    };

    const confirmSale = async () => {
        if (traderAllocations.length === 0) return toast.error('Add at least one trader');

        try {
            setProcessingId(activeRecord._id);
            const allocationsPayload = traderAllocations.map(a => ({
                trader_id: a.trader_id,
                quantity: a.quantity,
                rate: a.rate
            }));

            await api.patch(`/api/records/${activeRecord._id}/sell`, {
                allocations: allocationsPayload,
                sale_unit: saleForm.sale_unit
            });

            toast.success('Sold successfully!');
            setWeighedRecords(prev => prev.filter(r => r._id !== activeRecord._id));
            setActiveRecord(null);
        } catch (error) {
            console.error('Sale error:', error);
            toast.error('Sale failed');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredFarmers = useMemo(() => {
        if (!nameSearch.trim()) return [];
        return farmers.filter(f =>
            f.full_name?.toLowerCase().includes(nameSearch.toLowerCase()) ||
            f.phone?.includes(nameSearch)
        ).slice(0, 5);
    }, [farmers, nameSearch]);

    const filteredTraders = useMemo(() => {
        if (!traderSearch.trim()) return traders.slice(0, 10);
        return traders.filter(t =>
            t.full_name?.toLowerCase().includes(traderSearch.toLowerCase()) ||
            t.business_name?.toLowerCase().includes(traderSearch.toLowerCase())
        ).slice(0, 10);
    }, [traders, traderSearch]);

    const remainingQty = useMemo(() => {
        if (!activeRecord) return 0;
        const { caratValue, qtyValue } = getEffectiveValues(activeRecord);
        const total = caratValue > 0 ? caratValue : qtyValue;
        const allocated = traderAllocations.reduce((sum, a) => sum + a.quantity, 0);
        return total - allocated;
    }, [activeRecord, traderAllocations]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
    );

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6 p-4 bg-slate-50/50">

            {/* --- LEFT PANEL --- */}
            <div className="w-[350px] flex flex-col gap-4">

                {/* 1. Token Input */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 transition-colors">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Token Number
                    </label>
                    <div className="relative group">
                        <input
                            ref={tokenInputRef}
                            type="text"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            className="w-full text-4xl font-black text-center py-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all uppercase placeholder:text-slate-200 text-slate-800 tracking-widest"
                            placeholder="A-000"
                        />
                        {tokenInput && (
                            <button
                                onClick={() => setTokenInput('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Farmer Name Search */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                        Search Farmer
                    </label>
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <input
                            type="text"
                            value={nameSearch}
                            onChange={(e) => setNameSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 text-sm font-medium transition-all"
                            placeholder="Search by name or mobile..."
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {filteredFarmers.map(farmer => (
                            <button
                                key={farmer._id}
                                onClick={() => handleSelectFarmer(farmer)}
                                className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl border border-transparent hover:border-emerald-200 transition-all group flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                                    {farmer.initials || farmer.full_name?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{farmer.full_name}</p>
                                    <p className="text-xs text-slate-500 font-medium truncate">{farmer.phone}</p>
                                </div>
                            </button>
                        ))}
                        {nameSearch && filteredFarmers.length === 0 && (
                            <div className="text-center text-slate-400 py-8 text-sm flex flex-col items-center gap-2">
                                <User size={24} className="opacity-20" />
                                <span>No farmers found</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Selected Farmer Card */}
                <AnimatePresence>
                    {selectedFarmer && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-xl shadow-emerald-100/50 relative overflow-hidden"
                        >
                            <label className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider mb-3 block flex items-center justify-between">
                                <span>Active Farmer</span>
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">Verified</span>
                            </label>

                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-emerald-200">
                                    {selectedFarmer.full_name?.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-xl font-bold text-slate-900 leading-tight truncate" title={selectedFarmer.full_name}>
                                        {selectedFarmer.full_name}
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium mt-1 truncate">
                                        {selectedFarmer.phone}
                                    </p>
                                    <p className="text-xs font-mono text-emerald-600 bg-emerald-50 inline-block px-1.5 py-0.5 rounded mt-1">
                                        {selectedFarmer.farmerId || 'NO-ID'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedFarmer(null)}
                                className="w-full py-2.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-sm font-bold transition-colors border border-slate-200 hover:border-red-200 flex items-center justify-center gap-2"
                            >
                                <X size={16} />
                                Change Farmer
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- RIGHT PANEL --- */}
            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Package size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Pending Crops</h2>
                            <p className="text-xs text-slate-400 font-medium">Select a crop to start auction</p>
                        </div>
                    </div>
                    {weighedRecords.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                                {weighedRecords.length} Items
                            </span>
                            <button
                                onClick={() => selectedFarmer && fetchWeighedRecords(selectedFarmer._id)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    {!selectedFarmer ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                <User size={48} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">Waiting for Farmer Selection</h3>
                            <p className="text-slate-500 mt-2">Scan a token or search for a farmer on the left</p>
                        </div>
                    ) : weighedRecords.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">All Caught Up!</h3>
                            <p className="text-slate-500 mt-2">No pending crops found for this farmer.</p>
                        </div>
                    ) : activeRecord ? (
                        /* --- INLINE AUCTION INTERFACE --- */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden h-full flex flex-col"
                        >
                            {/* Record Header */}
                            <div className="bg-white border-b border-slate-100 p-5 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Live Auction
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900">{activeRecord.vegetable}</h3>
                                    <p className="text-slate-400 text-sm font-medium mt-1">Lot #{activeRecord._id.slice(-6).toUpperCase()}</p>
                                </div>

                                <div className="text-right">
                                    <div className="text-3xl font-black text-slate-900 flex items-center justify-end gap-1">
                                        {getEffectiveValues(activeRecord).caratValue > 0
                                            ? <><span className="text-purple-600">{getEffectiveValues(activeRecord).caratValue}</span> <span className="text-sm text-slate-400 font-bold self-end mb-2">Crt</span></>
                                            : <><span className="text-emerald-600">{getEffectiveValues(activeRecord).qtyValue}</span> <span className="text-sm text-slate-400 font-bold self-end mb-2">Kg</span></>
                                        }
                                    </div>
                                    <button
                                        onClick={cancelAuction}
                                        className="mt-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                    >
                                        CANCEL
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                                {/* Left: Input Area */}
                                <div className="flex-1 p-6 flex flex-col gap-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-emerald-500 transition-all">
                                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Auction Rate (₹)</label>
                                            <input
                                                ref={rateInputRef}
                                                type="number"
                                                className="w-full text-3xl font-black bg-transparent outline-none text-slate-900 placeholder:text-slate-300"
                                                placeholder="00"
                                                value={saleForm.sale_rate}
                                                onChange={e => setSaleForm({ ...saleForm, sale_rate: e.target.value })}
                                                onKeyDown={e => e.key === 'Enter' && document.querySelector('#qty-input').focus()}
                                            />
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-emerald-500 transition-all relative">
                                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Quantity</label>
                                            <input
                                                id="qty-input"
                                                type="number"
                                                className="w-full text-3xl font-black bg-transparent outline-none text-slate-900 placeholder:text-slate-300"
                                                placeholder={remainingQty}
                                                value={saleForm.allocation_qty}
                                                onChange={e => setSaleForm({ ...saleForm, allocation_qty: e.target.value })}
                                                onKeyDown={e => e.key === 'Enter' && traderSearchRef.current?.focus()}
                                            />
                                            <div className="absolute top-4 right-4 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                                                Max: {remainingQty}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col min-h-0">
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-3">Select Trader</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                ref={traderSearchRef}
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none font-medium"
                                                placeholder="Search by name..."
                                                value={traderSearch}
                                                onChange={e => setTraderSearch(e.target.value)}
                                            />
                                        </div>

                                        {/* ✅ FIXED: Professional Trader Selection - Light green + border outline */}
                                        <div className="mt-3 flex-1 overflow-y-auto min-h-[150px] border border-slate-100 rounded-xl bg-slate-50/50 p-2 custom-scrollbar">
                                            {filteredTraders.map(trader => {
                                                const isSelected = saleForm.trader_id === trader._id;
                                                return (
                                                    <div
                                                        key={trader._id}
                                                        onClick={() => setSaleForm({ ...saleForm, trader_id: trader._id })}
                                                        className={`
                                                            w-full p-3 mb-1.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all
                                                            ${isSelected
                                                                ? 'bg-emerald-50 border-2 border-emerald-500 shadow-sm'
                                                                : 'bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                            }
                                                        `}
                                                    >
                                                        {/* Avatar */}
                                                        <div
                                                            className={`
                                                                w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                                                                ${isSelected
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : 'bg-slate-100 text-slate-500'
                                                                }
                                                            `}
                                                        >
                                                            {trader.full_name?.[0]?.toUpperCase() || 'T'}
                                                        </div>

                                                        {/* Name & Business */}
                                                        <div className="min-w-0 flex-1">
                                                            <p className={`text-sm font-semibold truncate ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                                {trader.full_name}
                                                            </p>
                                                            <p className={`text-xs truncate ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                                {trader.business_name || 'No business name'}
                                                            </p>
                                                        </div>

                                                        {/* Check Icon */}
                                                        {isSelected && (
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                                                <Check size={14} className="text-white" strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddAllocation}
                                        className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                                    >
                                        <Plus size={18} />
                                        Add Allocation
                                    </button>
                                </div>

                                {/* Right: Allocation List & Actions */}
                                <div className="w-full lg:w-[320px] bg-slate-50/50 p-6 flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-slate-800">Allocated Split</h4>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${remainingQty === 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {remainingQty === 0 ? 'FULL' : `${remainingQty} REMAINING`}
                                        </span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                                        {traderAllocations.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl py-8">
                                                <p className="text-sm font-medium">No traders added</p>
                                            </div>
                                        ) : (
                                            traderAllocations.map((alloc, idx) => (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    key={idx}
                                                    className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-100">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm">{alloc.trader_name}</p>
                                                            <p className="text-xs text-slate-500 font-medium">
                                                                {alloc.quantity}{getEffectiveValues(activeRecord).caratValue > 0 ? 'Crt' : 'Kg'} × ₹{alloc.rate}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteAllocation(idx)}
                                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Total Value</span>
                                            <span className="text-lg font-black text-slate-900">
                                                ₹{traderAllocations.reduce((sum, a) => sum + (a.quantity * a.rate), 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <button
                                            disabled={traderAllocations.length === 0}
                                            onClick={confirmSale}
                                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                                        >
                                            {processingId ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                            CONFIRM & SAVE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* --- LIST OF PENDING ITEMS --- */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {weighedRecords.map(record => {
                                const vals = getEffectiveValues(record);
                                return (
                                    <motion.button
                                        key={record._id}
                                        onClick={() => startAuction(record)}
                                        layoutId={record._id}
                                        className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-50 transition-all text-left flex flex-col overflow-hidden group"
                                    >
                                        <div className="p-5 flex-1">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${vals.caratValue > 0
                                                    ? 'bg-purple-50 text-purple-600'
                                                    : 'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                    {vals.caratValue > 0 ? 'Carat Lot' : 'Weighed Lot'}
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-300">
                                                    #{record._id.slice(-4)}
                                                </span>
                                            </div>

                                            <h3
                                                className="font-bold text-slate-900 text-lg leading-tight mb-2 line-clamp-2"
                                                title={record.vegetable}
                                            >
                                                {record.vegetable}
                                            </h3>

                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-slate-800">
                                                    {vals.caratValue > 0 ? vals.caratValue : vals.qtyValue}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 uppercase">
                                                    {vals.caratValue > 0 ? 'Crt' : 'Kg'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50 px-5 py-3.5 border-t border-emerald-100 flex justify-between items-center group-hover:bg-emerald-600 transition-colors">
                                            <span className="text-xs font-bold text-emerald-700 group-hover:text-white uppercase tracking-wide">
                                                Start Auction
                                            </span>
                                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-emerald-600 transform group-hover:translate-x-1 transition-all shadow-sm flex-shrink-0">
                                                <ArrowRight size={14} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Search,
    User,
    Users,
    Package,
    Check,
    Loader2,
    RefreshCw,
    X,
    Trash2,
    ChevronDown,
    Save,
    Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

export default function LilavEntry() {
    // --- Data (Pre-loaded) ---
    const [farmers, setFarmers] = useState([]);
    const [traders, setTraders] = useState([]);
    const [dailyRates, setDailyRates] = useState([]);
    const [pendingCrops, setPendingCrops] = useState([]);

    // --- Loading ---
    const [initialLoading, setInitialLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- Selections ---
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [selectedTrader, setSelectedTrader] = useState(null);
    const [selectedCrops, setSelectedCrops] = useState([]);

    // --- Dropdown States ---
    const [farmerSearch, setFarmerSearch] = useState('');
    const [traderSearch, setTraderSearch] = useState('');
    const [showFarmerList, setShowFarmerList] = useState(false);
    const [showTraderList, setShowTraderList] = useState(false);

    // --- Add User Modals ---
    const [showAddFarmerModal, setShowAddFarmerModal] = useState(false);
    const [showAddTraderModal, setShowAddTraderModal] = useState(false);
    const [newFarmer, setNewFarmer] = useState({ full_name: '', phone: '' });
    const [newTrader, setNewTrader] = useState({ full_name: '', phone: '', business_name: '' });
    const [addingUser, setAddingUser] = useState(false);

    // --- Item Table ---
    const [itemDetails, setItemDetails] = useState({});

    // --- Refs for click-outside ---
    const farmerDropdownRef = useRef(null);
    const traderDropdownRef = useRef(null);

    // --- Click outside to close dropdowns ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (farmerDropdownRef.current && !farmerDropdownRef.current.contains(event.target)) {
                setShowFarmerList(false);
            }
            if (traderDropdownRef.current && !traderDropdownRef.current.contains(event.target)) {
                setShowTraderList(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Load ALL data on mount ---
    useEffect(() => {
        fetchAllData();
    }, []);

    // --- Auto-refresh every 30 seconds ---
    useEffect(() => {
        const interval = setInterval(() => {
            fetchAllData(true); // silent refresh
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAllData = async (silent = false) => {
        try {
            if (!silent) setInitialLoading(true);
            const [farmersRes, tradersRes, ratesRes] = await Promise.all([
                api.get('/api/users?role=farmer'),
                api.get('/api/users?role=trader'),
                api.get('/api/daily-rates/today')
            ]);
            setFarmers(farmersRes?.data || farmersRes || []);
            setTraders(tradersRes?.data || tradersRes || []);
            setDailyRates(ratesRes || []);
        } catch (error) {
            if (!silent) toast.error('Failed to load data');
        } finally {
            if (!silent) setInitialLoading(false);
        }
    };

    // --- Fetch pending crops when farmer selected ---
    useEffect(() => {
        if (selectedFarmer?._id) {
            fetchPendingCrops(selectedFarmer._id);
        } else {
            setPendingCrops([]);
            setSelectedCrops([]);
            setItemDetails({});
        }
    }, [selectedFarmer]);

    const fetchPendingCrops = async (farmerId) => {
        try {
            const response = await api.get(`/api/records/pending/${farmerId}`);
            const crops = response || [];
            setPendingCrops(crops);

            const details = {};
            crops.forEach(crop => {
                const rate = dailyRates.find(r => r.vegetable.toLowerCase() === crop.vegetable.toLowerCase());
                const { nagValue, qtyValue } = getEffectiveValues(crop);
                const totalQty = nagValue > 0 ? nagValue : qtyValue;
                details[crop._id] = {
                    rate: crop.prev_rate || rate?.rate || '',
                    qty: totalQty
                };
            });
            setItemDetails(details);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getEffectiveValues = (record) => {
        if (record.has_remaining) {
            return {
                nagValue: record.remaining_nag || 0,
                qtyValue: record.remaining_qty || 0
            };
        }
        const nagValue = (record.official_nag > 0) ? record.official_nag : (record.nag || 0);
        const qtyValue = (record.official_qty > 0) ? record.official_qty : (record.quantity || 0);
        return { nagValue, qtyValue };
    };

    // --- Farmer Selection ---
    const handleSelectFarmer = (farmer) => {
        setSelectedFarmer(farmer);
        setFarmerSearch('');
        setShowFarmerList(false);
        setSelectedCrops([]);
    };

    const clearFarmer = () => {
        setSelectedFarmer(null);
        setPendingCrops([]);
        setSelectedCrops([]);
        setItemDetails({});
    };

    // --- Trader Selection ---
    const handleSelectTrader = (trader) => {
        setSelectedTrader(trader);
        setTraderSearch('');
        setShowTraderList(false);
    };

    const clearTrader = () => {
        setSelectedTrader(null);
    };

    // --- Add Farmer ---
    const handleAddFarmer = async () => {
        if (!newFarmer.full_name.trim()) return toast.error('Enter farmer name');
        if (!newFarmer.phone.trim() || newFarmer.phone.length < 10) return toast.error('Enter valid phone number');

        try {
            setAddingUser(true);
            const result = await api.admin.users.create({
                full_name: newFarmer.full_name.trim(),
                phone: newFarmer.phone.trim(),
                role: 'farmer'
            });
            toast.success('Farmer added successfully!');
            setShowAddFarmerModal(false);
            setNewFarmer({ full_name: '', phone: '' });
            await fetchAllData(true);
            if (result?._id) {
                setSelectedFarmer(result);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add farmer');
        } finally {
            setAddingUser(false);
        }
    };

    // --- Add Trader ---
    const handleAddTrader = async () => {
        if (!newTrader.full_name.trim()) return toast.error('Enter trader name');
        if (!newTrader.phone.trim() || newTrader.phone.length < 10) return toast.error('Enter valid phone number');

        try {
            setAddingUser(true);
            const result = await api.admin.users.create({
                full_name: newTrader.full_name.trim(),
                phone: newTrader.phone.trim(),
                business_name: newTrader.business_name.trim() || undefined,
                role: 'trader'
            });
            toast.success('Trader added successfully!');
            setShowAddTraderModal(false);
            setNewTrader({ full_name: '', phone: '', business_name: '' });
            await fetchAllData(true);
            if (result?._id) {
                setSelectedTrader(result);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add trader');
        } finally {
            setAddingUser(false);
        }
    };

    // --- Crop Selection ---
    const toggleCropSelection = (cropId) => {
        setSelectedCrops(prev =>
            prev.includes(cropId)
                ? prev.filter(id => id !== cropId)
                : [...prev, cropId]
        );
    };

    const selectAllCrops = () => {
        setSelectedCrops(pendingCrops.map(c => c._id));
    };

    // --- Item Details Update ---
    const updateItemDetail = (cropId, field, value) => {
        setItemDetails(prev => ({
            ...prev,
            [cropId]: { ...prev[cropId], [field]: value }
        }));
    };

    // --- Remove from selection ---
    const removeFromSelection = (cropId) => {
        setSelectedCrops(prev => prev.filter(id => id !== cropId));
    };

    // --- Save Sale ---
    const handleSave = async () => {
        if (!selectedFarmer) return toast.error('Select a farmer');
        if (!selectedTrader) return toast.error('Select a trader');
        if (selectedCrops.length === 0) return toast.error('Select at least one crop');

        for (const cropId of selectedCrops) {
            const detail = itemDetails[cropId];
            if (!detail?.rate || parseFloat(detail.rate) <= 0) {
                return toast.error('Enter rate for all items');
            }
            if (!detail?.qty || parseFloat(detail.qty) <= 0) {
                return toast.error('Enter quantity for all items');
            }
        }

        try {
            setSaving(true);

            for (const cropId of selectedCrops) {
                const crop = pendingCrops.find(c => c._id === cropId);
                const detail = itemDetails[cropId];
                const { nagValue } = getEffectiveValues(crop);
                const sale_unit = nagValue > 0 ? 'nag' : 'kg';

                await api.patch(`/api/records/${cropId}/sell`, {
                    allocations: [{
                        trader_id: selectedTrader._id,
                        quantity: parseFloat(detail.qty),
                        rate: parseFloat(detail.rate)
                    }],
                    sale_unit
                });
            }

            toast.success(`${selectedCrops.length} item(s) sold!`);
            setPendingCrops(prev => prev.filter(c => !selectedCrops.includes(c._id)));
            setSelectedCrops([]);
        } catch (error) {
            toast.error('Sale failed');
        } finally {
            setSaving(false);
        }
    };

    // --- Filtered Lists ---
    const filteredFarmers = useMemo(() => {
        if (!farmerSearch.trim()) return farmers;
        return farmers.filter(f =>
            f.full_name?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
            f.phone?.includes(farmerSearch) ||
            f.farmerId?.toLowerCase().includes(farmerSearch.toLowerCase())
        );
    }, [farmers, farmerSearch]);

    const filteredTraders = useMemo(() => {
        if (!traderSearch.trim()) return traders;
        return traders.filter(t =>
            t.full_name?.toLowerCase().includes(traderSearch.toLowerCase()) ||
            t.business_name?.toLowerCase().includes(traderSearch.toLowerCase())
        );
    }, [traders, traderSearch]);

    // --- Selected crops data ---
    const selectedCropsData = useMemo(() => {
        return pendingCrops.filter(c => selectedCrops.includes(c._id));
    }, [pendingCrops, selectedCrops]);

    // --- Total Amount ---
    const totalAmount = useMemo(() => {
        return selectedCropsData.reduce((sum, crop) => {
            const detail = itemDetails[crop._id] || {};
            return sum + (parseFloat(detail.qty) || 0) * (parseFloat(detail.rate) || 0);
        }, 0);
    }, [selectedCropsData, itemDetails]);

    // --- Loading Screen ---
    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-900">Lilav Entry</h1>
                    <button
                        onClick={() => fetchAllData()}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="px-6 py-6">
                {/* === SELECTION BOXES === */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                    {/* BOX 1: Farmer */}
                    <div ref={farmerDropdownRef} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Farmer Name <span className="text-gray-400">*</span>
                        </label>
                        {selectedFarmer ? (
                            <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                                        {selectedFarmer.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedFarmer.full_name}</p>
                                        <p className="text-sm text-gray-500">{selectedFarmer.phone} • {selectedFarmer.farmerId || 'N/A'}</p>
                                    </div>
                                </div>
                                <button onClick={clearFarmer} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors shadow-sm"
                                    onClick={() => setShowFarmerList(true)}
                                >
                                    <span className="text-gray-400">Select or add a farmer</span>
                                    <ChevronDown size={18} className="text-gray-400" />
                                </div>

                                {showFarmerList && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                        <div className="p-3 border-b border-gray-100 bg-gray-50">
                                            <div className="relative">
                                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={farmerSearch}
                                                    onChange={(e) => setFarmerSearch(e.target.value)}
                                                    placeholder="Search by name, phone, or token..."
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {filteredFarmers.length === 0 ? (
                                                <div className="px-4 py-6 text-center text-gray-400 text-sm">No farmers found</div>
                                            ) : (
                                                filteredFarmers.slice(0, 15).map(f => (
                                                    <button
                                                        key={f._id}
                                                        onClick={() => handleSelectFarmer(f)}
                                                        className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex items-center gap-4 border-b border-gray-50 transition-colors"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                                                            {f.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{f.full_name}</p>
                                                            <p className="text-sm text-gray-500">{f.phone} {f.farmerId && `• ${f.farmerId}`}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        {/* Add Farmer Button */}
                                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                                            <button
                                                onClick={() => { setShowFarmerList(false); setShowAddFarmerModal(true); }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                                            >
                                                <Plus size={16} />
                                                Add New Farmer
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* BOX 2: Trader */}
                    <div ref={traderDropdownRef} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trader <span className="text-gray-400">*</span>
                        </label>
                        {selectedTrader ? (
                            <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                                        {selectedTrader.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedTrader.full_name}</p>
                                        <p className="text-sm text-gray-500">{selectedTrader.business_name || selectedTrader.phone}</p>
                                    </div>
                                </div>
                                <button onClick={clearTrader} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors shadow-sm"
                                    onClick={() => setShowTraderList(true)}
                                >
                                    <span className="text-gray-400">Select or add a trader</span>
                                    <ChevronDown size={18} className="text-gray-400" />
                                </div>

                                {showTraderList && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                        <div className="p-3 border-b border-gray-100 bg-gray-50">
                                            <div className="relative">
                                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={traderSearch}
                                                    onChange={(e) => setTraderSearch(e.target.value)}
                                                    placeholder="Search trader..."
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {filteredTraders.length === 0 ? (
                                                <div className="px-4 py-6 text-center text-gray-400 text-sm">No traders found</div>
                                            ) : (
                                                filteredTraders.slice(0, 15).map(t => (
                                                    <button
                                                        key={t._id}
                                                        onClick={() => handleSelectTrader(t)}
                                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-4 border-b border-gray-50 transition-colors"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                                                            {t.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{t.full_name}</p>
                                                            <p className="text-sm text-gray-500">{t.business_name || t.phone}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        {/* Add Trader Button */}
                                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                                            <button
                                                onClick={() => { setShowTraderList(false); setShowAddTraderModal(true); }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                            >
                                                <Plus size={16} />
                                                Add New Trader
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* === PENDING CROPS === */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <Package size={16} className="text-gray-400" />
                            Pending Crops {pendingCrops.length > 0 && <span className="text-gray-400">({pendingCrops.length})</span>}
                        </h3>
                        {pendingCrops.length > 0 && (
                            <button onClick={selectAllCrops} className="text-sm text-emerald-600 hover:text-emerald-800 font-medium hover:underline">
                                Select All
                            </button>
                        )}
                    </div>

                    <div className="min-h-[50px]">
                        {pendingCrops.length === 0 ? (
                            <div className="text-gray-400 text-sm">
                                {selectedFarmer ? 'No pending crops for this farmer' : 'Select a farmer to view pending crops'}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {pendingCrops.map(crop => {
                                    const isSelected = selectedCrops.includes(crop._id);
                                    const { nagValue, qtyValue } = getEffectiveValues(crop);
                                    const qty = nagValue > 0 ? nagValue : qtyValue;
                                    const unit = nagValue > 0 ? 'Nag' : 'Kg';

                                    return (
                                        <button
                                            key={crop._id}
                                            onClick={() => toggleCropSelection(crop._id)}
                                            className={`
                                                px-4 py-2.5 rounded-lg text-sm font-medium transition-all border
                                                ${isSelected
                                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                                                }
                                            `}
                                        >
                                            <span className="font-semibold">{crop.vegetable}</span>
                                            <span className="ml-2 opacity-70">{qty} {unit}</span>
                                            {isSelected && <Check size={14} className="inline ml-2 text-emerald-600" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* === ITEM TABLE === */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Details</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Quantity</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Rate (₹)</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Amount</th>
                                <th className="w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {selectedCropsData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-8 text-center text-gray-400 text-sm">
                                        Type or click to select an item from pending crops above
                                    </td>
                                </tr>
                            ) : (
                                selectedCropsData.map(crop => {
                                    const { nagValue } = getEffectiveValues(crop);
                                    const unit = nagValue > 0 ? 'Nag' : 'Kg';
                                    const detail = itemDetails[crop._id] || {};
                                    const amount = (parseFloat(detail.qty) || 0) * (parseFloat(detail.rate) || 0);

                                    return (
                                        <tr key={crop._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-gray-900">{crop.vegetable}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">#{crop._id.slice(-6)}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={detail.qty || ''}
                                                        onChange={(e) => updateItemDetail(crop._id, 'qty', e.target.value)}
                                                        className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 outline-none"
                                                    />
                                                    <span className="text-xs text-gray-500">{unit}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <input
                                                    type="number"
                                                    value={detail.rate || ''}
                                                    onChange={(e) => updateItemDetail(crop._id, 'rate', e.target.value)}
                                                    className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 outline-none"
                                                />
                                            </td>
                                            <td className="px-5 py-4 text-right font-semibold text-gray-900">
                                                ₹{amount.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-4">
                                                <button
                                                    onClick={() => removeFromSelection(crop._id)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {/* Footer with Total */}
                    <div className="bg-gray-50 border-t border-gray-200 px-5 py-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {selectedCropsData.length} item(s) selected
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-medium text-gray-500 uppercase">Total</span>
                            <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* === SAVE BUTTON === */}
                <div className="flex justify-start">
                    <button
                        onClick={handleSave}
                        disabled={saving || selectedCrops.length === 0 || !selectedFarmer || !selectedTrader}
                        className="px-8 py-3.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-lg disabled:shadow-none"
                    >
                        {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Save & Assign for Weight
                    </button>
                </div>
            </div>

            {/* === ADD FARMER MODAL === */}
            {showAddFarmerModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Farmer</h3>
                            <button onClick={() => setShowAddFarmerModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={newFarmer.full_name}
                                    onChange={(e) => setNewFarmer(prev => ({ ...prev, full_name: e.target.value }))}
                                    placeholder="Enter farmer name"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    value={newFarmer.phone}
                                    onChange={(e) => setNewFarmer(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Enter 10-digit phone number"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => setShowAddFarmerModal(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddFarmer}
                                disabled={addingUser}
                                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {addingUser && <Loader2 size={16} className="animate-spin" />}
                                Add Farmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === ADD TRADER MODAL === */}
            {showAddTraderModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Trader</h3>
                            <button onClick={() => setShowAddTraderModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={newTrader.full_name}
                                    onChange={(e) => setNewTrader(prev => ({ ...prev, full_name: e.target.value }))}
                                    placeholder="Enter trader name"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    value={newTrader.phone}
                                    onChange={(e) => setNewTrader(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Enter 10-digit phone number"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name (Optional)</label>
                                <input
                                    type="text"
                                    value={newTrader.business_name}
                                    onChange={(e) => setNewTrader(prev => ({ ...prev, business_name: e.target.value }))}
                                    placeholder="Enter business name"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => setShowAddTraderModal(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddTrader}
                                disabled={addingUser}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {addingUser && <Loader2 size={16} className="animate-spin" />}
                                Add Trader
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
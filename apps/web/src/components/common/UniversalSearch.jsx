import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, User, Tractor, ShoppingCart, FileText, ChevronRight, Calculator, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function UniversalSearch({ placeholder = "Search..." }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ farmers: [], traders: [], records: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                performSearch(query);
            } else {
                setResults({ farmers: [], traders: [], records: [] });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const performSearch = async (searchQuery) => {
        setIsLoading(true);
        setIsOpen(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setResults(data);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResultClick = (type, item) => {
        setIsOpen(false);
        setQuery('');

        const rolePrefix = user?.role || 'committee'; // Default to committee if role missing for some reason

        // Determine path based on user role and item type
        // This mapping ensures users stay within their dashboard context

        if (type === 'farmer') {
            if (user.role === 'committee') navigate(`/dashboard/committee/farmers`); // Ideally navigating to specific ID would be better if detailed view exists
            else if (user.role === 'lilav') navigate(`/dashboard/committee/lilav`); // Lilav might want to search farmer to start auction
            else if (user.role === 'weight') navigate(`/dashboard/weight/entry`);
            else if (user.role === 'admin') navigate(`/dashboard/admin/farmers`);
            // Fallback
            else navigate(`/dashboard/${rolePrefix}/farmers`);
        }
        else if (type === 'trader') {
            if (user.role === 'committee') navigate(`/dashboard/committee/traders`);
            else if (user.role === 'accounting') navigate(`/dashboard/committee/accounting`);
            else navigate(`/dashboard/${rolePrefix}/traders`);
        }
        else if (type === 'record') {
            // Records usually mean Transactions or Daily Entries
            if (user.role === 'trader') navigate(`/dashboard/trader/transactions`);
            else if (user.role === 'farmer') navigate(`/dashboard/farmer/history`);
            else if (user.role === 'committee') navigate(`/dashboard/committee/reports`); // Or specific transaction view
            else navigate(`/dashboard/${rolePrefix}/transactions`);
        }
    };

    const hasResults = results.farmers?.length > 0 || results.traders?.length > 0 || results.records?.length > 0;

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4 text-slate-400" />
                    )}
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                />
            </div>

            <AnimatePresence>
                {isOpen && (hasResults || query.length >= 2) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-[80vh] overflow-y-auto overflow-x-hidden p-2"
                    >
                        {/* No Results State */}
                        {!isLoading && !hasResults && query.length >= 2 && (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                No results found for "{query}"
                            </div>
                        )}

                        {/* Farmers Section */}
                        {results.farmers?.length > 0 && (
                            <div className="mb-2">
                                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Tractor size={12} /> Farmers
                                </div>
                                {results.farmers.map((farmer) => (
                                    <button
                                        key={farmer._id}
                                        onClick={() => handleResultClick('farmer', farmer)}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 font-bold text-xs">
                                                {farmer.full_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{farmer.full_name}</p>
                                                <p className="text-xs text-slate-500 truncate">{farmer.farmerId} • {farmer.phone}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Traders Section */}
                        {results.traders?.length > 0 && (
                            <div className="mb-2">
                                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShoppingCart size={12} /> Traders
                                </div>
                                {results.traders.map((trader) => (
                                    <button
                                        key={trader._id}
                                        onClick={() => handleResultClick('trader', trader)}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xs">
                                                {trader.business_name ? trader.business_name.substring(0, 2).toUpperCase() : trader.full_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{trader.business_name || trader.full_name}</p>
                                                <p className="text-xs text-slate-500 truncate">{trader.customId}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Records/Transactions Section */}
                        {results.records?.length > 0 && (
                            <div>
                                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText size={12} /> Records
                                </div>
                                {results.records.map((record) => (
                                    <button
                                        key={record._id}
                                        onClick={() => handleResultClick('record', record)}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold text-xs">
                                                <Calculator size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 truncate">{record.vegetable} • {record.farmer_id?.full_name}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${record.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            record.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

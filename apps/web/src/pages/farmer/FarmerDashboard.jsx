import React, { useState, useEffect } from 'react';
import FarmerNavbar from '../../components/navigation/FarmerNavbar';
import { Toaster, toast } from 'react-hot-toast';
import api from '../../lib/api';
import {
  Plus, TrendingUp, Clock, Package, X, Eye, ArrowLeft,
  Trash2, CheckCircle, Calendar, MapPin, ChevronRight, Edit, FileText, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';

// --- MODAL COMPONENT ---
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} border border-gray-200 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-6 sm:px-8">{children}</div>
      </div>
    </div>
  );
};

// --- VEGETABLE DATA ---
const VEGETABLE_CATEGORIES = [
  {
    id: 'onion-potato',
    name: 'Onion-Potato',
    marathi: 'कांदा-बटाटा',
    items: [
      { english: 'Onion', marathi: 'कांदा ' },
      { english: 'Potato', marathi: 'बटाटा ' },
      { english: 'Garlic', marathi: 'लसूण ' },
      { english: 'Ginger', marathi: 'आले / अद्रक ' },
      { english: 'Sweet Potato', marathi: 'रताळे ' }
    ]
  },
  {
    id: 'daily-veg',
    name: 'Daily Veg',
    marathi: 'फळ भाज्या',
    items: [
      { english: 'Tomato', marathi: 'टोमॅटो ' },
      { english: 'Brinjal / Eggplant', marathi: 'वांगी ' },
      { english: 'Lady Finger / Okra', marathi: 'भेंडी ' },
      { english: 'Green Chili', marathi: 'हिरवी मिरची' },
      { english: 'Capsicum', marathi: 'ढोबळी मिरची' },
      { english: 'Drumstick', marathi: 'शेवगा ' },
      { english: 'Cucumber', marathi: 'काकडी ' },
      { english: 'Lemon', marathi: 'लिंबू' }
    ]
  },
  {
    id: 'leafy-veg',
    name: 'Leafy Veg',
    marathi: 'पाला भाज्या',
    items: [
      { english: 'Coriander', marathi: 'कोथिंबीर ' },
      { english: 'Fenugreek', marathi: 'मेथी ' },
      { english: 'Spinach', marathi: 'पालक ' },
      { english: 'Dill Leaves', marathi: 'शेपू ' },
      { english: 'Amaranth', marathi: 'लाल माठ' },
      { english: 'Mint', marathi: 'पुदिना ' },
      { english: 'Curry Leaves', marathi: 'कढीपत्ता ' },
      { english: 'Spring Onion', marathi: 'कांद्याची पात' }
    ]
  },
  {
    id: 'vine-veg',
    name: 'Vine Veg / Gourds',
    marathi: 'वेलवर्गीय',
    items: [
      { english: 'Bottle Gourd', marathi: 'दुधी भोपळा ' },
      { english: 'Bitter Gourd', marathi: 'कारले' },
      { english: 'Ridge Gourd', marathi: 'डोडका ' },
      { english: 'Sponge Gourd', marathi: 'घोसाळे' },
      { english: 'Snake Gourd', marathi: 'पडवळ ' },
      { english: 'Pumpkin', marathi: 'लाल भोपळा / डांगर ' },
      { english: 'Ash Gourd', marathi: 'कोहळा' }
    ]
  },
  {
    id: 'beans-pods',
    name: 'Beans / Pods',
    marathi: 'शेंगा भाज्या',
    items: [
      { english: 'Cluster Beans', marathi: 'गवार' },
      { english: 'French Beans', marathi: 'फरसबी' },
      { english: 'Green Peas', marathi: 'मटार / ओला वाटाणा' },
      { english: 'Flat Beans', marathi: 'घेवडा / वाल ' },
      { english: 'Double Beans', marathi: 'डबल बी ' },
      { english: 'Cowpea', marathi: 'चवळी ' }
    ]
  },
  {
    id: 'roots-salad',
    name: 'Roots & Salad',
    marathi: 'कंदमुळं / कोबी',
    items: [
      { english: 'Cabbage', marathi: 'कोबी ' },
      { english: 'Cauliflower', marathi: 'फ्लॉवर ' },
      { english: 'Carrot', marathi: 'गाजर ' },
      { english: 'Radish', marathi: 'मुळा ' },
      { english: 'Beetroot', marathi: 'बीट ' },
      { english: 'Elephant Foot Yam', marathi: 'सुरण' }
    ]
  },
  {
    id: 'fruits',
    name: 'Fruits',
    marathi: 'फळे',
    items: [
      { english: 'Banana', marathi: 'केळी' },
      { english: 'Apple', marathi: 'सफरचंद' },
      { english: 'Pomegranate', marathi: 'डाळिंब' },
      { english: 'Guava', marathi: 'पेरू' },
      { english: 'Orange', marathi: 'संत्री' },
      { english: 'Sweet Lime', marathi: 'मोसंबी' },
      { english: 'Papaya', marathi: 'पपई ' },
      { english: 'Watermelon', marathi: 'कलिंगड' },
      { english: 'Grapes', marathi: 'द्राक्षे' },
      { english: 'Custard Apple', marathi: 'सीताफळ ' },
      { english: 'Mango', marathi: 'आंबा' },
      { english: 'Sapodilla', marathi: 'चिकू ' },
      { english: 'Pineapple', marathi: 'अननस' }
    ]
  }
];

// Helper to flatten data for search, but UI will use categories
const ALL_VEGETABLES = VEGETABLE_CATEGORIES.flatMap(category => 
  category.items.map(item => ({
    ...item,
    category: category.name,
    categoryId: category.id,
    display: `${item.english} (${item.marathi})`
  }))
);

// --- ADD NEW RECORD SECTION ---
const AddNewRecordSection = ({ onBack, onSave }) => {
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedVegetable, setSelectedVegetable] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState([]); // Track which categories are open

  const [quantities, setQuantities] = useState({
    kg: '',
    ton: '',
    quintal: ''
  });

  const [addedItems, setAddedItems] = useState([]);

  // Filter logic
  const isSearching = searchTerm.length > 0 && selectedVegetable !== searchTerm;
  
  const filteredCategories = VEGETABLE_CATEGORIES.map(cat => {
    // If searching, filter items inside. If not searching, keep all items.
    const matchingItems = isSearching 
      ? cat.items.filter(item => 
          item.english.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.marathi.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : cat.items;
      
    return { ...cat, items: matchingItems };
  }).filter(cat => cat.items.length > 0 || !isSearching); // Hide empty categories only when searching

  // Toggle Category Accordion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  // Auto-expand categories when searching
  useEffect(() => {
    if (isSearching) {
      const allCategoryIds = filteredCategories.map(c => c.id);
      setExpandedCategories(allCategoryIds);
    } else {
      setExpandedCategories([]); // Collapse all when clearing search
    }
  }, [searchTerm]);

  const handleVegetableSelect = (item, categoryName) => {
    const display = `${item.english} (${item.marathi})`;
    setSelectedVegetable(display);
    setSearchTerm(display);
    setIsDropdownOpen(false);
  };

  const clearSelection = () => {
    setSelectedVegetable('');
    setSearchTerm('');
    setQuantities({ kg: '', ton: '', quintal: '' });
    setIsDropdownOpen(false);
  };

  const handleQuantityChange = (value, type) => {
    if (value === '') {
      setQuantities({ kg: '', ton: '', quintal: '' });
      return;
    }

    const val = parseFloat(value);
    if (isNaN(val)) return;

    let newKg, newTon, newQuintal;

    if (type === 'kg') {
      newKg = value;
      newTon = (val / 1000).toFixed(3);
      newQuintal = (val / 100).toFixed(2);
    } else if (type === 'ton') {
      newTon = value;
      newKg = (val * 1000).toFixed(2);
      newQuintal = (val * 10).toFixed(2);
    } else if (type === 'quintal') {
      newQuintal = value;
      newKg = (val * 100).toFixed(2);
      newTon = (val / 10).toFixed(3);
    }

    setQuantities({
      kg: type === 'kg' ? value : parseFloat(newKg).toString(),
      ton: type === 'ton' ? value : parseFloat(newTon).toString(),
      quintal: type === 'quintal' ? value : parseFloat(newQuintal).toString()
    });
  };

  const handleAddItem = () => {
    if (!selectedVegetable || !quantities.kg || parseFloat(quantities.kg) <= 0) {
      toast.error('Please select a vegetable and enter valid quantity');
      return;
    }

    const isDuplicate = addedItems.some(item => item.vegetable === selectedVegetable);
    if (isDuplicate) {
      toast.error('This vegetable is already added. Remove it first to change quantity.');
      return;
    }

    const newItem = {
      id: Date.now(),
      vegetable: selectedVegetable,
      quantity: parseFloat(quantities.kg)
    };

    setAddedItems([...addedItems, newItem]);
    toast.success('Item added to list');

    // Reset fields for next entry
    clearSelection();
  };

  const handleRemoveItem = (id) => {
    setAddedItems(addedItems.filter(item => item.id !== id));
    toast.success('Item removed');
  };

  const handleSaveAll = () => {
    if (!selectedMarket) {
      toast.error('Please select a market');
      return;
    }

    if (addedItems.length === 0) {
      toast.error('Please add at least one vegetable');
      return;
    }

    onSave({
      market: selectedMarket,
      items: addedItems
    });

    setSelectedMarket('');
    clearSelection();
    setAddedItems([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Add New Record</h2>

          <div className="space-y-6">
            {/* Market Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Market Name *</label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-gray-900"
              >
                <option value="">Select Market</option>
                <option>Pune APMC</option>
                <option>Mumbai Market</option>
                <option>Nashik Mandi</option>
                <option>Nagpur Market</option>
                <option>Aurangabad Market</option>
              </select>
            </div>

            {/* Added Items List (Top Green Section) */}
            {addedItems.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-gray-900">Added Items ({addedItems.length}):</p>
                  <button 
                    onClick={() => setAddedItems([])}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {addedItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-200 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{item.vegetable}</p>
                        <p className="text-xs text-gray-600">{item.quantity} kg</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 ml-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition flex-shrink-0"
                        title="Delete Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vegetable Dropdown (Accordion Style) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Vegetable Name *</label>
              
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search or Select Category..."
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-gray-900"
                  />
                  
                  {/* Clear / Dropdown Icon Logic */}
                  {searchTerm ? (
                    <button 
                      onClick={clearSelection}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                      title="Clear Selection"
                    >
                      <X size={14} className="text-gray-600" />
                    </button>
                  ) : (
                    <ChevronDown 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  )}
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-xl max-h-96 overflow-y-auto custom-scrollbar">
                      {filteredCategories.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No vegetables found
                        </div>
                      ) : (
                        filteredCategories.map((category) => (
                          <div key={category.id} className="border-b border-gray-100 last:border-0">
                            {/* Accordion Header */}
                            <button 
                              onClick={() => toggleCategory(category.id)}
                              className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
                            >
                              <span className="font-bold text-sm text-gray-800">
                                {category.name} <span className="font-normal text-gray-500 text-xs ml-1">({category.marathi})</span>
                              </span>
                              {expandedCategories.includes(category.id) ? (
                                <ChevronUp size={16} className="text-gray-500" />
                              ) : (
                                <ChevronDown size={16} className="text-gray-500" />
                              )}
                            </button>

                            {/* Accordion Content */}
                            {expandedCategories.includes(category.id) && (
                              <div className="bg-white animate-fadeIn">
                                {category.items.map((item, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleVegetableSelect(item, category.name)}
                                    className="w-full px-6 py-3 text-left hover:bg-green-50 transition border-b border-gray-50 last:border-0 flex justify-between items-center group"
                                  >
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">{item.english}</p>
                                      <p className="text-xs text-gray-500 group-hover:text-green-600">{item.marathi}</p>
                                    </div>
                                    {selectedVegetable.includes(item.english) && (
                                      <CheckCircle size={16} className="text-green-600" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {selectedVegetable && (
                <div className="mt-3 flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Currently Selected:</p>
                    <p className="font-bold text-gray-900 text-sm">{selectedVegetable}</p>
                  </div>
                  <button 
                    onClick={clearSelection}
                    className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition"
                    title="Change Selection"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Quantity Inputs */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">Kilograms (Kg) *</label>
                  <input
                    type="number"
                    value={quantities.kg}
                    onChange={(e) => handleQuantityChange(e.target.value, 'kg')}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-green-300 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none bg-green-50/50 text-gray-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">Tons (1T = 1000kg)</label>
                  <input
                    type="number"
                    value={quantities.ton}
                    onChange={(e) => handleQuantityChange(e.target.value, 'ton')}
                    placeholder="0.00"
                    step="0.001"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">Quintals (1Q = 100kg)</label>
                  <input
                    type="number"
                    value={quantities.quintal}
                    onChange={(e) => handleQuantityChange(e.target.value, 'quintal')}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <p><strong>Note:</strong> Enter quantity in any box, others will calculate automatically. Records are saved in Kg.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddItem}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Item
              </button>

              <button
                onClick={handleSaveAll}
                disabled={addedItems.length === 0}
                className={`px-4 py-3 font-semibold rounded-xl transition shadow-lg hover:shadow-xl ${addedItems.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                Save Records ({addedItems.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const FarmerDashboard = () => {
  const [view, setView] = useState('dashboard');
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    farmerId: '',
    location: '',
    initials: 'FK'
  });

  const [modals, setModals] = useState({
    editProfile: false,
    details: false,
    editRecord: false,
    deleteConfirm: false
  });

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [profileForm, setProfileForm] = useState({ ...profile });

  // EDIT FORM STATE
  const [editFormData, setEditFormData] = useState({
    id: null,
    market: '',
    vegetable: '',
    quantities: { kg: '', ton: '', quintal: '' }
  });

  // --- FETCH DATA FROM BACKEND ---
  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const recordsData = await api.get('/api/records/my-records');
      
      if (Array.isArray(recordsData)) {
        setRecords(recordsData);
      } else {
        console.error("Expected array but got:", recordsData);
        setRecords([]);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
      toast.error('Failed to load records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    
    const prof = localStorage.getItem('farmer-profile');
    if (prof) {
      const p = JSON.parse(prof);
      setProfile(p);
      setProfileForm(p);
    }
  }, []);

  useEffect(() => {
    const handleOpenEditProfile = () => {
      setModals(prev => ({ ...prev, editProfile: true }));
    };
    window.addEventListener('openEditProfile', handleOpenEditProfile);
    return () => window.removeEventListener('openEditProfile', handleOpenEditProfile);
  }, []);

  // --- COMPUTED VALUES ---
  const soldRecords = records.filter(r => r.status === 'Sold');
  const pendingRecords = records.filter(r => r.status === 'Pending');

  const totalGross = soldRecords.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);

  const filteredRecords = filterStatus === 'All'
    ? records
    : records.filter(r => r.status === filterStatus);

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'amount') return (b.totalAmount || 0) - (a.totalAmount || 0);
    return 0;
  });

  // ✅ HELPER: Format Time from Date
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // --- HANDLERS ---
  const handleAddRecord = async (data) => {
    try {
      await api.post('/api/records/add', data);
      toast.success('Records saved to database!');
      setView('dashboard');
      fetchRecords();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to save record');
    }
  };

  const initiateDelete = (id) => {
    setRecordToDelete(id);
    setModals(prev => ({ ...prev, deleteConfirm: true }));
  };

  // --- CONFIRM DELETE (Called from Modal) ---
  const confirmDelete = async () => {
    try {
      await api.delete(`/api/records/${recordToDelete}`);
      toast.success('Record deleted successfully');
      fetchRecords();
    } catch (error) {
      toast.error('Failed to delete record');
    } finally {
      setModals(prev => ({ ...prev, deleteConfirm: false }));
      setRecordToDelete(null);
    }
  };

  const handleEditClick = (record) => {
    const qty = record.quantity;
    setEditFormData({
      id: record._id,
      market: record.market,
      vegetable: record.vegetable,
      quantities: {
        kg: qty.toString(),
        ton: (qty / 1000).toFixed(3),
        quintal: (qty / 100).toFixed(2)
      }
    });
    setModals({ ...modals, editRecord: true });
  };

  const handleEditQuantityChange = (value, type) => {
    if (value === '') {
      setEditFormData(prev => ({
        ...prev,
        quantities: { kg: '', ton: '', quintal: '' }
      }));
      return;
    }

    const val = parseFloat(value);
    if (isNaN(val)) return;

    let newKg, newTon, newQuintal;

    if (type === 'kg') {
      newKg = value;
      newTon = (val / 1000).toFixed(3);
      newQuintal = (val / 100).toFixed(2);
    } else if (type === 'ton') {
      newTon = value;
      newKg = (val * 1000).toFixed(2);
      newQuintal = (val * 10).toFixed(2);
    } else if (type === 'quintal') {
      newQuintal = value;
      newKg = (val * 100).toFixed(2);
      newTon = (val / 10).toFixed(3);
    }

    setEditFormData(prev => ({
      ...prev,
      quantities: {
        kg: type === 'kg' ? value : parseFloat(newKg).toString(),
        ton: type === 'ton' ? value : parseFloat(newTon).toString(),
        quintal: type === 'quintal' ? value : parseFloat(newQuintal).toString()
      }
    }));
  };

  const handleUpdateRecord = async () => {
    const newKg = parseFloat(editFormData.quantities.kg);

    if (isNaN(newKg) || newKg <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!editFormData.market) {
      toast.error("Please select a market");
      return;
    }

    try {
      await api.put(`/api/records/${editFormData.id}`, {
        market: editFormData.market,
        quantity: newKg
      });
      
      toast.success("Record updated successfully!");
      setModals({ ...modals, editRecord: false });
      fetchRecords();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update record');
    }
  };

  const handleDownloadInvoice = (record) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to download invoice");
      return;
    }
    
    const recordDate = new Date(record.createdAt).toLocaleDateString('en-GB');
    const recordTime = formatTime(record.createdAt);
    const invoiceId = record._id.toString().slice(-6).toUpperCase();

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${invoiceId}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; color: #555; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
          .company-info h1 { margin: 0; color: #166534; font-size: 28px; }
          .invoice-details { text-align: right; }
          .invoice-details h2 { margin: 0; color: #333; }
          .info-table { width: 100%; margin-bottom: 40px; }
          .info-table td { padding: 5px; vertical-align: top; }
          .item-table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
          .item-table th { background: #f0fdf4; color: #166534; font-weight: bold; padding: 12px; border-bottom: 2px solid #bbf7d0; }
          .item-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .total-section { margin-top: 30px; text-align: right; }
          .total-amount { font-size: 24px; font-weight: bold; color: #166534; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888; }
          .badge { display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .badge-sold { background: #dcfce7; color: #166534; }
          .badge-pending { background: #fef9c3; color: #854d0e; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="company-info">
              <h1>AgroNond</h1>
              <p>Farmer Panel Transaction</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p>#${invoiceId}</p>
              <p>Date: ${recordDate}</p>
              <p>Time: ${recordTime}</p>
            </div>
          </div>

          <table class="info-table">
            <tr>
              <td>
                <strong>Farmer Details:</strong><br>
                ${profile.name}<br>
                ${profile.farmerId}<br>
                ${profile.location}
              </td>
              <td style="text-align: right;">
                <strong>Market Details:</strong><br>
                ${record.market}<br>
                Trader: ${record.trader}
              </td>
            </tr>
          </table>

          <table class="item-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Total Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${record.vegetable}</td>
                <td style="text-align: center;">${record.quantity} kg</td>
                <td style="text-align: right;">${record.status === 'Sold' ? '₹' + record.rate : '-'}</td>
                <td style="text-align: right;">${record.status === 'Sold' ? '₹' + record.totalAmount.toLocaleString('en-IN') : '-'}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <p>Status: <span class="badge ${record.status === 'Sold' ? 'badge-sold' : 'badge-pending'}">${record.status}</span></p>
            <p class="total-amount">Total: ${record.status === 'Sold' ? '₹' + record.totalAmount.toLocaleString('en-IN') : '---'}</p>
          </div>

          <div class="footer">
            <p>This is a computer generated invoice from AgroNond.</p>
          </div>
        </div>
        <script>
          window.print();
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceContent);
    printWindow.document.close();
  };

  const saveProfile = () => {
    const initials = profileForm.name.slice(0, 2).toUpperCase() || 'FK';
    const updatedProfile = { ...profileForm, initials };
    setProfile(updatedProfile);
    localStorage.setItem('farmer-profile', JSON.stringify(updatedProfile));
    setModals({ ...modals, editProfile: false });
    window.dispatchEvent(new CustomEvent('farmerProfileUpdated'));
    toast.success('Profile updated successfully!');
  };

  if (view === 'addRecord') {
    return (
      <div className="min-h-screen bg-white">
        <Toaster position="top-center" reverseOrder={false} />
        <FarmerNavbar />
        <div className="mt-16">
          <AddNewRecordSection
            onBack={() => setView('dashboard')}
            onSave={handleAddRecord}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" reverseOrder={false} />
      <FarmerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-16">

        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">Farmer Dashboard</h1>
              <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <button
              onClick={() => setView('addRecord')}
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl sm:rounded-full shadow-lg shadow-green-200 transition hover:shadow-xl hover:-translate-y-1"
            >
              <Plus size={20} />
              New Record
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="group bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 hover:border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-green-100 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <TrendingUp size={24} className="sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 sm:px-3 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1 sm:mb-2">Total Earnings</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">₹{totalGross.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500">Gross Income</p>
          </div>

          <div className="group bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-blue-100 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Package size={24} className="sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">{soldRecords.length} sales</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1 sm:mb-2">Total Sales</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">₹{totalGross.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500">All transactions</p>
          </div>

          <div className="group bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-orange-100 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Clock size={24} className="sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 rounded-full">Active</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1 sm:mb-2">Pending Lots</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{pendingRecords.length}</h3>
            <p className="text-xs text-gray-500">Awaiting sale</p>
          </div>

          <div className="group bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-purple-100 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Package size={24} className="sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">{records.length} items</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1 sm:mb-2">Total Volume</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{totalQuantity.toFixed(2)} kg</h3>
            <p className="text-xs text-gray-500">Lifetime quantity</p>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 sm:px-8 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Records</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and track all transactions</p>
            </div>

            <div className="flex w-full sm:w-auto gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:border-green-500 text-sm"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Sold</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:border-green-500 text-sm"
              >
                <option value="recent">Recent</option>
                <option value="amount">Highest Amount</option>
              </select>
            </div>
          </div>

          {isLoading ? (
             <div className="p-12 text-center text-gray-500">Loading records...</div>
          ) : (
            <>
            {/* Mobile View */}
            <div className="block sm:hidden">
              {sortedRecords.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No records found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sortedRecords.map((record) => (
                    <div key={record._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-semibold text-gray-500">
                            {new Date(record.createdAt).toLocaleDateString('en-GB')}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatTime(record.createdAt)}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${record.status === 'Sold'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                          {record.status === 'Sold' ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {record.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{record.vegetable}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                            <MapPin size={12} />
                            {record.market}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{record.quantity} kg</p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-gray-50">
                        <button
                          onClick={() => handleDownloadInvoice(record)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100"
                          title="Download Data / Invoice"
                        >
                          <FileText size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setModals({ ...modals, details: true });
                          }}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleEditClick(record)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => initiateDelete(record._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-4 text-left font-semibold text-gray-900">Date</th>
                    <th className="px-8 py-4 text-left font-semibold text-gray-900">Time</th>
                    <th className="px-8 py-4 text-left font-semibold text-gray-900">Market</th>
                    <th className="px-8 py-4 text-left font-semibold text-gray-900">Item</th>
                    <th className="px-8 py-4 text-left font-semibold text-gray-900">Total Qty</th>
                    <th className="px-8 py-4 text-left font-semibold text-gray-900">Status</th>
                    <th className="px-8 py-4 text-left font-semibold text-gray-900">Rate</th>
                    <th className="px-8 py-4 text-left font-semibold text-gray-900">Amount</th>
                    <th className="px-8 py-4 text-right font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedRecords.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-8 py-16 text-center">
                        <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-600 font-medium">No records found</p>
                        <p className="text-gray-500 text-sm mt-1">Click "New Record" to add your first entry</p>
                      </td>
                    </tr>
                  ) : (
                    sortedRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-8 py-4 text-gray-700">{new Date(record.createdAt).toLocaleDateString('en-GB')}</td>
                        <td className="px-8 py-4 text-gray-600 text-xs">{formatTime(record.createdAt)}</td>
                        <td className="px-8 py-4 text-gray-900 font-medium">{record.market}</td>
                        <td className="px-8 py-4 text-gray-900 font-semibold">{record.vegetable}</td>
                        <td className="px-8 py-4 text-gray-700">{record.quantity} kg</td>
                        <td className="px-8 py-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-2 ${record.status === 'Sold'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            }`}>
                            {record.status === 'Sold' ? <CheckCircle size={14} /> : <Clock size={14} />}
                            {record.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-gray-700">{record.status === 'Sold' ? `₹${record.rate}` : '-'}</td>
                        <td className="px-8 py-4 font-bold text-green-600">{record.status === 'Sold' ? `₹${record.totalAmount.toLocaleString('en-IN')}` : '-'}</td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() => handleDownloadInvoice(record)}
                              className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition border border-blue-200"
                              title="Download Data / Invoice"
                            >
                              <FileText size={18} />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setModals({ ...modals, details: true });
                              }}
                              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => handleEditClick(record)}
                              className="p-2.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition border border-green-200"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>

                            <button
                              onClick={() => initiateDelete(record._id)}
                              className="p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition border border-red-200"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </main>

      {/* Details Modal */}
      <Modal
        isOpen={modals.details}
        onClose={() => setModals({ ...modals, details: false })}
        title="Record Details"
        size="md"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-1">DATE</p>
                <p className="font-bold text-gray-900">{new Date(selectedRecord.createdAt).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-1">TIME</p>
                <p className="font-bold text-gray-900">{formatTime(selectedRecord.createdAt)}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold mb-1">MARKET</p>
              <p className="font-bold text-gray-900">{selectedRecord.market}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold mb-1">VEGETABLE</p>
              <p className="font-bold text-gray-900">{selectedRecord.vegetable}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold mb-1">TOTAL QTY</p>
              <p className="font-bold text-gray-900">{selectedRecord.quantity} kg</p>
            </div>

            {selectedRecord.status === 'Sold' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">RATE</p>
                    <p className="font-bold text-gray-900">₹{selectedRecord.rate}/kg</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">TOTAL AMOUNT</p>
                    <p className="font-bold text-green-600">₹{selectedRecord.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">TRADER</p>
                  <p className="font-bold text-gray-900">{selectedRecord.trader}</p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleDownloadInvoice(selectedRecord)}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Download Invoice
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Record Modal */}
      <Modal
        isOpen={modals.editRecord}
        onClose={() => setModals({ ...modals, editRecord: false })}
        title="Edit Record"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Editing Item:</p>
            <p className="font-bold text-gray-900 text-lg">{editFormData.vegetable}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Market Name</label>
            <select
              value={editFormData.market}
              onChange={(e) => setEditFormData({ ...editFormData, market: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-gray-900"
            >
              <option value="">Select Market</option>
              <option>Pune APMC</option>
              <option>Mumbai Market</option>
              <option>Nashik Mandi</option>
              <option>Nagpur Market</option>
              <option>Aurangabad Market</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Update Total Quantity</label>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">Kilograms (Kg)</label>
                <input
                  type="number"
                  value={editFormData.quantities.kg}
                  onChange={(e) => handleEditQuantityChange(e.target.value, 'kg')}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-green-300 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none bg-green-50/50 text-gray-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">Tons</label>
                  <input
                    type="number"
                    value={editFormData.quantities.ton}
                    onChange={(e) => handleEditQuantityChange(e.target.value, 'ton')}
                    placeholder="0.00"
                    step="0.001"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">Quintals</label>
                  <input
                    type="number"
                    value={editFormData.quantities.quintal}
                    onChange={(e) => handleEditQuantityChange(e.target.value, 'quintal')}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpdateRecord}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition shadow-lg"
          >
            Update Record
          </button>
        </div>
      </Modal>

      {/* --- CONFIRM DELETE MODAL --- */}
      <Modal
        isOpen={modals.deleteConfirm}
        onClose={() => setModals({ ...modals, deleteConfirm: false })}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Are you sure?</h3>
          <p className="text-gray-500 text-sm mb-6">
            Do you really want to delete this record? This process cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setModals({ ...modals, deleteConfirm: false })}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-md transition"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Profile Edit Modal */}
      <Modal
        isOpen={modals.editProfile}
        onClose={() => setModals({ ...modals, editProfile: false })}
        title="Edit Profile"
        size="md"
      >
        <div className="space-y-5">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {profileForm.name ? profileForm.name.slice(0, 2).toUpperCase() : 'FK'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Farmer ID</label>
            <input
              type="text"
              value={profileForm.farmerId}
              onChange={(e) => setProfileForm({ ...profileForm, farmerId: e.target.value })}
              placeholder="e.g., AGR-1234"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
            <input
              type="text"
              value={profileForm.location}
              onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
              placeholder="Enter your location"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <button
            onClick={saveProfile}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
          >
            Save Changes
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FarmerDashboard;
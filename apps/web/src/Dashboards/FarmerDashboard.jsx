import React, { useState, useEffect } from 'react';
import FarmerNavbar from '../components/FarmerNavbar';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Plus, TrendingUp, Clock, Package, X, Download, Eye, ArrowLeft,
  Trash2, CheckCircle, Calendar, MapPin, ChevronRight
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
      { english: 'Onion', marathi: 'कांदा (Kanda)' },
      { english: 'Potato', marathi: 'बटाटा (Batata)' },
      { english: 'Garlic', marathi: 'लसूण (Lasun)' },
      { english: 'Ginger', marathi: 'आले / अद्रक (Ale / Adrak)' },
      { english: 'Sweet Potato', marathi: 'रताळे (Ratale)' }
    ]
  },
  {
    id: 'daily-veg',
    name: 'Daily Veg',
    marathi: 'फळ भाज्या',
    items: [
      { english: 'Tomato', marathi: 'टोमॅटो (Tomato)' },
      { english: 'Brinjal / Eggplant', marathi: 'वांगी (Vangi)' },
      { english: 'Lady Finger / Okra', marathi: 'भेंडी (Bhendi)' },
      { english: 'Green Chili', marathi: 'हिरवी मिरची (Hirvi Mirchi)' },
      { english: 'Capsicum', marathi: 'ढोबळी मिरची (Dhobli Mirchi)' },
      { english: 'Drumstick', marathi: 'शेवगा (Shevga)' },
      { english: 'Cucumber', marathi: 'काकडी (Kakdi)' },
      { english: 'Lemon', marathi: 'लिंबू (Limbu)' }
    ]
  },
  {
    id: 'leafy-veg',
    name: 'Leafy Veg',
    marathi: 'पाला भाज्या',
    items: [
      { english: 'Coriander', marathi: 'कोथिंबीर (Kothimbir)' },
      { english: 'Fenugreek', marathi: 'मेथी (Methi)' },
      { english: 'Spinach', marathi: 'पालक (Palak)' },
      { english: 'Dill Leaves', marathi: 'शेपू (Shepu)' },
      { english: 'Amaranth', marathi: 'लाल माठ (Lal Math)' },
      { english: 'Mint', marathi: 'पुदिना (Pudina)' },
      { english: 'Curry Leaves', marathi: 'कढीपत्ता (Kadhipatta)' },
      { english: 'Spring Onion', marathi: 'कांद्याची पात (Kandyachi Paat)' }
    ]
  },
  {
    id: 'vine-veg',
    name: 'Vine Veg / Gourds',
    marathi: 'वेलवर्गीय',
    items: [
      { english: 'Bottle Gourd', marathi: 'दुधी भोपळा (Dudhi Bhopla)' },
      { english: 'Bitter Gourd', marathi: 'कारले (Karle)' },
      { english: 'Ridge Gourd', marathi: 'डोडका (Dodka)' },
      { english: 'Sponge Gourd', marathi: 'घोसाळे (Ghosale)' },
      { english: 'Snake Gourd', marathi: 'पडवळ (Padwal)' },
      { english: 'Pumpkin', marathi: 'लाल भोपळा / डांगर (Lal Bhopla)' },
      { english: 'Ash Gourd', marathi: 'कोहळा (Kohala)' }
    ]
  },
  {
    id: 'beans-pods',
    name: 'Beans / Pods',
    marathi: 'शेंगा भाज्या',
    items: [
      { english: 'Cluster Beans', marathi: 'गवार (Gavar)' },
      { english: 'French Beans', marathi: 'फरसबी (Farasbi)' },
      { english: 'Green Peas', marathi: 'मटार / ओला वाटाणा (Matar)' },
      { english: 'Flat Beans', marathi: 'घेवडा / वाल (Ghevda)' },
      { english: 'Double Beans', marathi: 'डबल बी (Double Bee)' },
      { english: 'Cowpea', marathi: 'चवळी (Chavali)' }
    ]
  },
  {
    id: 'roots-salad',
    name: 'Roots & Salad',
    marathi: 'कंदमुळं / कोबी',
    items: [
      { english: 'Cabbage', marathi: 'कोबी (Kobi)' },
      { english: 'Cauliflower', marathi: 'फ्लॉवर (Flower)' },
      { english: 'Carrot', marathi: 'गाजर (Gajar)' },
      { english: 'Radish', marathi: 'मुळा (Mula)' },
      { english: 'Beetroot', marathi: 'बीट (Beet)' },
      { english: 'Elephant Foot Yam', marathi: 'सुरण (Suran)' }
    ]
  },
  {
    id: 'fruits',
    name: 'Fruits',
    marathi: 'फळे',
    items: [
      { english: 'Banana', marathi: 'केळी (Keli)' },
      { english: 'Apple', marathi: 'सफरचंद (Safarchand)' },
      { english: 'Pomegranate', marathi: 'डाळिंब (Dalimb)' },
      { english: 'Guava', marathi: 'पेरू (Peru)' },
      { english: 'Orange', marathi: 'संत्री (Santri)' },
      { english: 'Sweet Lime', marathi: 'मोसंबी (Mosambi)' },
      { english: 'Papaya', marathi: 'पपई (Papai)' },
      { english: 'Watermelon', marathi: 'कलिंगड (Kalingad)' },
      { english: 'Grapes', marathi: 'द्राक्षे (Draksh)' },
      { english: 'Custard Apple', marathi: 'सीताफळ (Sitaphal)' },
      { english: 'Mango', marathi: 'आंबा (Amba)' },
      { english: 'Sapodilla', marathi: 'चिकू (Chiku)' },
      { english: 'Pineapple', marathi: 'अननस (Ananas)' }
    ]
  }
];

// --- ADD NEW RECORD SECTION ---
const AddNewRecordSection = ({ onBack, onSave }) => {
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedVegetable, setSelectedVegetable] = useState(null);
  
  // New State for 3-Way Conversion
  const [quantities, setQuantities] = useState({
    kg: '',
    ton: '',
    quintal: ''
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addedItems, setAddedItems] = useState([]); 

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleVegetableSelect = (item) => {
    setSelectedVegetable({
      english: item.english,
      marathi: item.marathi,
      display: `${item.english} (${item.marathi})`
    });
  };

  // --- QUANTITY CONVERSION LOGIC ---
  const handleQuantityChange = (value, type) => {
    // If input is empty, clear all fields
    if (value === '') {
      setQuantities({ kg: '', ton: '', quintal: '' });
      return;
    }

    const val = parseFloat(value);
    if (isNaN(val)) return;

    let newKg, newTon, newQuintal;

    if (type === 'kg') {
      newKg = value;
      newTon = (val / 1000).toFixed(3);    // 1000kg = 1 ton
      newQuintal = (val / 100).toFixed(2); // 100kg = 1 quintal
    } else if (type === 'ton') {
      newTon = value;
      newKg = (val * 1000).toFixed(2);
      newQuintal = (val * 10).toFixed(2);  // 1 ton = 10 quintals
    } else if (type === 'quintal') {
      newQuintal = value;
      newKg = (val * 100).toFixed(2);
      newTon = (val / 10).toFixed(3);
    }

    // Remove trailing zeros for cleaner display (optional)
    setQuantities({
      kg: type === 'kg' ? value : parseFloat(newKg).toString(),
      ton: type === 'ton' ? value : parseFloat(newTon).toString(),
      quintal: type === 'quintal' ? value : parseFloat(newQuintal).toString()
    });
  };

  const handleAddItem = () => {
    // Validate: Use quantities.kg as the base truth
    if (!selectedVegetable || !quantities.kg || parseFloat(quantities.kg) <= 0) {
      toast.error('Please select a vegetable and enter valid quantity');
      return;
    }

    const isDuplicate = addedItems.some(item => item.vegetable === selectedVegetable.display);
    if (isDuplicate) {
      toast.error('This vegetable is already added. Remove it first to change quantity.');
      return;
    }

    const newItem = {
      id: Date.now(),
      vegetable: selectedVegetable.display,
      quantity: parseFloat(quantities.kg) // We store everything in KG internally
    };

    setAddedItems([...addedItems, newItem]);
    toast.success(`${selectedVegetable.english} added!`);

    // Reset selection
    setSelectedVegetable(null);
    setQuantities({ kg: '', ton: '', quintal: '' });
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

    // Reset All
    setSelectedMarket('');
    setSelectedVegetable(null);
    setQuantities({ kg: '', ton: '', quintal: '' });
    setSelectedCategory(null);
    setAddedItems([]);
  };

  const selectedCategoryData = VEGETABLE_CATEGORIES.find(cat => cat.id === selectedCategory);

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

            {/* Added Items List */}
            {addedItems.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Added Items ({addedItems.length}):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {addedItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-200">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{item.vegetable}</p>
                        <p className="text-xs text-gray-600">{item.quantity} kg</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 ml-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition flex-shrink-0"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vegetable Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Vegetable Name *</label>
              
              {selectedVegetable && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Currently Selected:</p>
                  <p className="font-bold text-gray-900">{selectedVegetable.english}</p>
                  <p className="text-sm text-gray-600">{selectedVegetable.marathi}</p>
                </div>
              )}

              <div className="border border-gray-300 rounded-xl overflow-hidden bg-white flex flex-col sm:flex-row h-96">
                {/* Categories */}
                <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-gray-200 overflow-y-auto bg-gray-50">
                  {VEGETABLE_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-100 transition border-b border-gray-200 ${
                        selectedCategory === category.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                      }`}
                    >
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{category.name}</p>
                        <p className="text-xs text-gray-600">{category.marathi}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  ))}
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto bg-white">
                  {selectedCategoryData ? (
                    <div className="p-2">
                      {selectedCategoryData.items.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleVegetableSelect(item)}
                          className={`w-full px-4 py-3 text-left hover:bg-green-50 transition rounded-lg mb-1 ${
                            selectedVegetable?.english === item.english
                              ? 'bg-green-100 border-l-4 border-green-500'
                              : 'border-l-4 border-transparent'
                          }`}
                        >
                          <p className="text-base font-bold text-gray-900">{item.english}</p>
                          <p className="text-sm text-gray-600">{item.marathi}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 p-6">
                      <div className="text-center">
                        <Package size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Select a category from the left</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- UPDATED QUANTITY SECTION (Kg, Ton, Quintal) --- */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Kg Input */}
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

                {/* Tons Input */}
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

                {/* Quintal Input */}
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

            {/* Buttons Row */}
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
                className={`px-4 py-3 font-semibold rounded-xl transition shadow-lg hover:shadow-xl ${
                  addedItems.length === 0 
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
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    farmerId: '',
    location: '',
    initials: 'FK'
  });

  const [modals, setModals] = useState({
    editProfile: false,
    details: false
  });

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [profileForm, setProfileForm] = useState({ ...profile });

  useEffect(() => {
    const saved = localStorage.getItem('farmer-records');
    const prof = localStorage.getItem('farmer-profile');
    if (saved) setRecords(JSON.parse(saved));
    if (prof) {
      const p = JSON.parse(prof);
      setProfile(p);
      setProfileForm(p);
    }
  }, []);

  useEffect(() => {
    const handleOpenEditProfile = () => {
      setModals({ ...modals, editProfile: true });
    };
    window.addEventListener('openEditProfile', handleOpenEditProfile);
    return () => window.removeEventListener('openEditProfile', handleOpenEditProfile);
  }, [modals]);

  useEffect(() => {
    localStorage.setItem('farmer-records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('farmer-profile', JSON.stringify(profile));
  }, [profile]);

  const soldRecords = records.filter(r => r.status === 'Sold');
  const pendingRecords = records.filter(r => r.status === 'Pending');
  
  const totalGross = soldRecords.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);

  const filteredRecords = filterStatus === 'All' 
    ? records 
    : records.filter(r => r.status === filterStatus);

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'amount') return (b.totalAmount || 0) - (a.totalAmount || 0);
    return 0;
  });

  const handleAddRecord = (data) => {
    const newRecords = data.items.map(item => ({
      id: Date.now() + Math.random(),
      date: new Date().toLocaleDateString('en-GB'),
      market: data.market,
      vegetable: item.vegetable,
      quantity: item.quantity,
      status: 'Pending',
      rate: 0,
      totalAmount: 0,
      trader: '-'
    }));

    setRecords([...newRecords, ...records]);
    setView('dashboard');
    toast.success(`${newRecords.length} record(s) added successfully!`);
  };

  const generateInvoice = (record) => {
    const invoice = `
FARMER DETAILS:
  Name: ${profile.name}
  Farmer ID: ${profile.farmerId}

TRANSACTION DETAILS:
  Item: ${record.vegetable} (${record.quantity}kg)
  Total Amount: ₹${record.totalAmount.toLocaleString('en-IN')}
    `;
    alert(invoice);
  };

  const handleDelete = (id) => {
    if (window.confirm('Permanently delete this record?')) {
      setRecords(records.filter(r => r.id !== id));
      toast.success('Record deleted');
    }
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

          <div className="block sm:hidden">
            {sortedRecords.length === 0 ? (
               <div className="p-8 text-center">
                 <p className="text-gray-500">No records found</p>
               </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sortedRecords.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-gray-500">{record.date}</span>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          record.status === 'Sold'
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
                        {record.status === 'Sold' ? (
                          <p className="text-sm font-bold text-green-600">₹{record.totalAmount.toLocaleString('en-IN')}</p>
                        ) : (
                          <p className="text-xs text-gray-400">---</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-gray-50">
                      {record.status !== 'Pending' && (
                          <button 
                            onClick={() => generateInvoice(record)}
                            className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <Download size={14} /> Invoice
                          </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedRecord(record);
                          setModals({ ...modals, details: true });
                        }}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Date</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Market</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Item</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Qty</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Rate</th>
                  <th className="px-8 py-4 text-left font-semibold text-gray-900">Amount</th>
                  <th className="px-8 py-4 text-right font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-16 text-center">
                      <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-600 font-medium">No records found</p>
                      <p className="text-gray-500 text-sm mt-1">Click "New Record" to add your first entry</p>
                    </td>
                  </tr>
                ) : (
                  sortedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-4 text-gray-700">{record.date}</td>
                      <td className="px-8 py-4 text-gray-900 font-medium">{record.market}</td>
                      <td className="px-8 py-4 text-gray-900 font-semibold">{record.vegetable}</td>
                      <td className="px-8 py-4 text-gray-700">{record.quantity} kg</td>
                      <td className="px-8 py-4">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-2 ${
                          record.status === 'Sold'
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
                          {record.status !== 'Pending' && (
                            <button 
                              onClick={() => generateInvoice(record)}
                              className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition border border-blue-200"
                              title="Download Invoice"
                            >
                              <Download size={18} />
                            </button>
                          )}
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
                            onClick={() => handleDelete(record.id)}
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
        </div>
      </main>

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
                <p className="font-bold text-gray-900">{selectedRecord.date}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-1">MARKET</p>
                <p className="font-bold text-gray-900">{selectedRecord.market}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold mb-1">VEGETABLE</p>
              <p className="font-bold text-gray-900">{selectedRecord.vegetable}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-1">QUANTITY</p>
                <p className="font-bold text-gray-900">{selectedRecord.quantity} kg</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-1">STATUS</p>
                <p className={`font-bold ${selectedRecord.status === 'Sold' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedRecord.status}
                </p>
              </div>
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
                    onClick={() => generateInvoice(selectedRecord)}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download Invoice
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

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
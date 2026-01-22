import React, { useState } from 'react';
import WeightNavbar from '../components/WeightNavbar';
import { supabase } from '../lib/supabase'; // ✅ CONNECTED TO SUPABASE
import { Search, Scale, Save, CheckCircle, AlertCircle, History } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const WeightUpdatePanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFarmer, setActiveFarmer] = useState(null);
  const [pendingRecords, setPendingRecords] = useState([]);
  const [weightInput, setWeightInput] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Search Farmer from Supabase Profiles
  const handleSearch = async () => {
    if (!searchTerm) return toast.error('Enter a phone number');
    setIsSearching(true);

    try {
      // Find Farmer Profile by Phone
      const { data: farmer, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', searchTerm) 
        .eq('role', 'farmer')
        .single();

      if (error || !farmer) {
        toast.error('Farmer not found. Check phone number.');
        setActiveFarmer(null);
        setPendingRecords([]);
      } else {
        setActiveFarmer(farmer);
        fetchPendingRecords(farmer.id);
        toast.success(`Found: ${farmer.full_name || 'Farmer'}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // 2. Fetch Pending Records for that Farmer
  const fetchPendingRecords = async (farmerId) => {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('status', 'Pending'); // Only get records needing weighing

    if (!error) setPendingRecords(data || []);
  };

  // 3. Update Weight in Supabase
  const handleSubmitWeight = async () => {
    if (!weightInput || !selectedRecordId) return toast.error('Enter weight first');

    try {
      const { error } = await supabase
        .from('records')
        .update({
          official_qty: parseFloat(weightInput),
          status: 'Weighed', // ✅ This triggers the update in Farmer Dashboard
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRecordId);

      if (error) throw error;

      toast.success('Weight updated & synced!');
      setWeightInput('');
      setSelectedRecordId(null);
      fetchPendingRecords(activeFarmer.id); // Refresh list

    } catch (err) {
      toast.error('Update failed');
      console.error(err);
    }
  };

  const selectedRecord = pendingRecords.find(r => r.id === selectedRecordId);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Toaster position="top-center" />
      <WeightNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Search */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Search size={20} className="text-blue-600" /> Find Farmer
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Farmer Mobile</label>
                  <input 
                    type="text" 
                    placeholder="e.g. +919876543210" 
                    className="w-full p-3 border rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button onClick={handleSearch} disabled={isSearching} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                  {isSearching ? 'Searching...' : 'Search Records'}
                </button>
              </div>
            </div>

            {/* Farmer Profile */}
            {activeFarmer && (
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900">{activeFarmer.full_name || 'Farmer'}</h3>
                <p className="text-blue-700 font-medium">{activeFarmer.phone}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <Package size={16} /> {pendingRecords.length} Pending Lots
                </div>
              </div>
            )}
          </div>

          {/* Right: Weighing Station */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Scale className="text-blue-600"/> Weighing Station</h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Live</span>
              </div>

              {!activeFarmer ? (
                <div className="text-center py-12 text-gray-400">Search for a farmer to begin.</div>
              ) : pendingRecords.length === 0 ? (
                <div className="text-center py-12 text-green-600 font-bold">All caught up! No pending lots.</div>
              ) : (
                <div className="space-y-6">
                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pendingRecords.map((record) => (
                      <div key={record.id} onClick={() => setSelectedRecordId(record.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer ${selectedRecordId === record.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex justify-between font-bold mb-2">
                          <span>{record.vegetable}</span>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pending</span>
                        </div>
                        <p className="text-sm text-gray-500">Est: {record.quantity} kg</p>
                        <p className="text-xs text-gray-400">{record.market}</p>
                      </div>
                    ))}
                  </div>

                  {/* Input Section */}
                  {selectedRecordId && (
                    <div className="mt-8 pt-8 border-t animate-in fade-in">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Official Weight (kg)</label>
                      <div className="flex gap-4">
                        <input type="number" autoFocus className="flex-1 text-3xl font-bold p-4 border rounded-xl"
                          value={weightInput} onChange={(e) => setWeightInput(e.target.value)} placeholder="0.00" />
                        <button onClick={handleSubmitWeight} className="px-8 bg-green-600 text-white font-bold rounded-xl flex items-center gap-2">
                          <Save size={20} /> Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WeightUpdatePanel;
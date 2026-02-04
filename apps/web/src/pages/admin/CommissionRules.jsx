import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, AlertCircle, CheckCircle, RefreshCw, Info, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

export default function CommissionRules() {
  const [config, setConfig] = useState({
    farmerRate: 4,
    traderRate: 9
  });

  const queryClient = useQueryClient();

  // Fetch Rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ['commission-rules'],
    queryFn: () => api.admin.commissionRules.list(),
  });

  // Initialize config from rules
  useEffect(() => {
    if (rules && rules.length > 0) {
      // Find latest rule for farmer (crop_type = 'All')
      const farmerRule = rules.find(r => r.role_type === 'farmer' && r.crop_type === 'All');
      // Find latest rule for trader
      const traderRule = rules.find(r => r.role_type === 'trader' && r.crop_type === 'All');

      setConfig({
        farmerRate: farmerRule ? parseFloat(farmerRule.rate) * 100 : 4,
        traderRate: traderRule ? parseFloat(traderRule.rate) * 100 : 9
      });
    }
  }, [rules]);

  const createRuleMutation = useMutation({
    mutationFn: (newRule) => api.admin.commissionRules.create(newRule),
    onSuccess: () => {
      queryClient.invalidateQueries(['commission-rules']);
    }
  });

  const handleChange = (field, value) => {
    // Allow empty string to let user clear input
    if (value === '') {
      setConfig(prev => ({ ...prev, [field]: '' }));
      return;
    }

    // Allow typing decimals (e.g. "4.")
    if (/^\d*\.?\d*$/.test(value)) {
      setConfig(prev => ({ ...prev, [field]: value }));
      // setSaveSuccess(false); // REMOVED
    }
  };

  const handleSave = async () => {
    try {
      // Create new rules for both (history tracking)
      await Promise.all([
        createRuleMutation.mutateAsync({
          crop_type: 'All',
          role_type: 'farmer',
          rate: (parseFloat(config.farmerRate) || 0) / 100
        }),
        createRuleMutation.mutateAsync({
          crop_type: 'All',
          role_type: 'trader',
          rate: (parseFloat(config.traderRate) || 0) / 100
        })
      ]);

      toast.success('Commission rules saved successfully!');
    } catch (error) {
      console.error('Failed to save rules:', error);
      toast.error('Failed to save commission rules');
    }
  };

  const handleReset = () => {
    setConfig({
      farmerRate: 4,
      traderRate: 9
    });
    // setSaveSuccess(false); // REMOVED
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // Calculate example
  const exampleAmount = 10000;
  // Safely parse input state
  const currentFarmerRate = parseFloat(config.farmerRate) || 0;
  const currentTraderRate = parseFloat(config.traderRate) || 0;

  const farmerCommission = (exampleAmount * currentFarmerRate) / 100;
  const traderCommission = (exampleAmount * currentTraderRate) / 100;
  const totalCommission = farmerCommission + traderCommission;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Commission Rules</h1>
        <p className="text-gray-500 mt-1">Configure transaction commission rates for farmers and traders</p>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-3"
      >
        <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-600">
          <p className="font-medium text-slate-800">How Commission Works</p>
          <p className="mt-1">
            Commission is deducted from every transaction. Farmers pay a lower rate as they are the primary producers,
            while traders pay a higher rate for market access and services.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-emerald-50">
              <Settings className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Rate Configuration</h2>
              <p className="text-sm text-gray-500">Adjust commission percentages</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Farmer Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farmer Commission Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.farmerRate}
                  onChange={(e) => handleChange('farmerRate', e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-lg font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Applied on farmer's sale amount
              </p>
            </div>

            {/* Trader Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trader Commission Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.traderRate}
                  onChange={(e) => handleChange('traderRate', e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-lg font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Applied on trader's purchase amount
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={createRuleMutation.isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {createRuleMutation.isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>



            {/* Last Updated */}
            <p className="text-sm text-gray-400 text-center">
              Last updated: {rules?.[0]?.effective_date ? new Date(rules[0].effective_date).toLocaleString('en-IN') : 'Never'}
            </p>
          </div>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Commission Preview</h2>
          <p className="text-sm text-gray-500 mb-4">
            Example calculation for ₹{exampleAmount.toLocaleString()} transaction:
          </p>

          <div className="space-y-4">
            {/* Farmer Commission */}
            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Farmer Commission ({config.farmerRate}%)</span>
                <span className="text-lg font-bold text-emerald-600">₹{farmerCommission.toLocaleString()}</span>
              </div>
              <div className="mt-2 h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(config.farmerRate * 5, 100)}%` }}
                />
              </div>
            </div>

            {/* Trader Commission */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Trader Commission ({config.traderRate}%)</span>
                <span className="text-lg font-bold text-slate-700">₹{traderCommission.toLocaleString()}</span>
              </div>
              <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(config.traderRate * 5, 100)}%` }}
                />
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Commission Collected</span>
                <span className="text-xl font-bold text-gray-800">₹{totalCommission.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Per ₹{exampleAmount.toLocaleString()} transaction
              </p>
            </div>
          </div>

          {/* Warning for high rates */}
          {(config.farmerRate > 10 || config.traderRate > 15) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-start gap-2 p-3 bg-amber-50 text-amber-700 rounded-xl"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">
                High commission rates may discourage traders and farmers from using the market.
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Rate Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-6">Rate Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <p className="text-emerald-600 text-sm font-medium">Farmer Rate</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">{config.farmerRate}%</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Trader Rate</p>
            <p className="text-3xl font-bold text-slate-700 mt-1">{config.traderRate}%</p>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-slate-100">
            <p className="text-slate-400 text-sm font-medium">Combined Rate</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{(parseFloat(config.farmerRate || 0) + parseFloat(config.traderRate || 0)).toFixed(1)}%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

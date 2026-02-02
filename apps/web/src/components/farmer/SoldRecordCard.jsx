import React, { useState, lazy, Suspense, useCallback } from 'react';
import { Download, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Lazy load PDF components - only loads when user clicks download
const PDFDownloadLink = lazy(() =>
  import('@react-pdf/renderer').then(module => ({ default: module.PDFDownloadLink }))
);
const BillingInvoice = lazy(() => import('../committee/BillingInvoice'));

// Download Modal - Only renders PDF component when opened
const DownloadModal = ({ isOpen, onClose, invoiceData, recordId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Download Invoice</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">Invoice Details:</p>
            <p className="font-semibold text-gray-800">{invoiceData.crop}</p>
            <p className="text-sm text-gray-500">
              {invoiceData.qty > 0 && `${invoiceData.qty} kg`}
              {invoiceData.qty > 0 && invoiceData.carat > 0 && ' | '}
              {invoiceData.carat > 0 && `${invoiceData.carat} Crt`}
            </p>
            <p className="text-lg font-bold text-emerald-600 mt-2">
              ₹{invoiceData.finalAmount?.toLocaleString()}
            </p>
          </div>

          <Suspense fallback={
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-200 text-gray-500 font-medium"
            >
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Preparing PDF...
            </button>
          }>
            <PDFDownloadLink
              document={<BillingInvoice data={invoiceData} type="farmer" />}
              fileName={`farmer-bill-${(recordId || 'unknown').slice(-6)}.pdf`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
            >
              {({ loading }) => (
                <>
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download Invoice
                    </>
                  )}
                </>
              )}
            </PDFDownloadLink>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

const SoldRecordCard = ({ record }) => {
  const [showModal, setShowModal] = useState(false);

  const {
    vegetable,
    official_qty,
    sale_rate,
    sale_amount,
    farmer_commission,
    net_payable_to_farmer,
    farmer_payment_status,
    farmer_payment_mode,
    createdAt,
    official_carat
  } = record;

  const status = farmer_payment_status || 'Pending';
  const isPaid = status === 'Paid';
  const date = record.sold_at ? new Date(record.sold_at) : new Date(createdAt);

  // Prepare invoice data for BillingInvoice PDF component
  const invoiceData = {
    id: record._id || record.id || 'N/A',
    date: date.toISOString(),
    name: 'Farmer',
    crop: vegetable,
    qty: official_qty || 0,
    carat: official_carat || 0,
    baseAmount: sale_amount || 0,
    commission: farmer_commission || 0,
    finalAmount: net_payable_to_farmer || 0,
    status: status,
    type: 'pay'
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{date.toLocaleDateString()}</span>
          </div>
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${isPaid
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
            {isPaid ? 'PAYMENT RECEIVED' : 'PAYMENT PENDING'}
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{vegetable}</h3>
              <p className="text-sm text-gray-500">
                {official_qty} kg {official_carat > 0 && `| ${official_carat} Crt`} × ₹{sale_rate}/kg
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Net Payable</p>
              <p className="text-2xl font-bold text-emerald-600">₹{net_payable_to_farmer?.toLocaleString()}</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-2 mb-4">
            <div className="flex justify-between items-center text-gray-600">
              <span>Gross Amount</span>
              <span className="font-medium">₹{sale_amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <span>Commission ({sale_amount ? Math.round((farmer_commission / sale_amount) * 100) : 0}%)</span>
              <span className="font-medium">- ₹{farmer_commission?.toLocaleString()}</span>
            </div>
            {isPaid && farmer_payment_mode && (
              <div className="flex justify-between items-center text-gray-500 pt-2 border-t border-gray-200 mt-2">
                <span>Paid via:</span>
                <span className="font-medium text-gray-700 max-w-[150px] truncate">{farmer_payment_mode}</span>
              </div>
            )}
          </div>

          {/* Download Button - Opens Modal */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium transition text-sm"
          >
            <Download size={16} />
            Download Bill
          </button>
        </div>
      </div>

      {/* Lazy-loaded Download Modal */}
      <DownloadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        invoiceData={invoiceData}
        recordId={record._id || record.id}
      />
    </>
  );
};

export default SoldRecordCard;
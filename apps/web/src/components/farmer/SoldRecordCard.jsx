import React from 'react';
import { Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import BillingInvoice from '../committee/BillingInvoice';
const SoldRecordCard = ({ record }) => {
  const {
    vegetable,
    official_qty,
    sale_rate,
    sale_amount, // Gross
    farmer_commission,
    net_payable_to_farmer,
    farmer_payment_status,
    farmer_payment_mode,
    // sold_at,
    createdAt,
    official_carat // Destructure official_carat
  } = record;

  const status = farmer_payment_status || 'Pending';
  const isPaid = status === 'Paid';
  const date = record.sold_at ? new Date(record.sold_at) : new Date(createdAt);

  // Prepare invoice data for BillingInvoice PDF component
  const invoiceData = {
    id: record._id || record.id || 'N/A',
    date: date.toISOString(),
    name: 'Farmer', // Will show farmer name from context
    crop: vegetable,
    qty: official_qty || 0,
    carat: official_carat || 0,
    baseAmount: sale_amount || 0,
    commission: farmer_commission || 0,
    finalAmount: net_payable_to_farmer || 0,
    status: status,
    type: 'pay' // farmer payment type
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Replaced Lot ID with Date */}
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
            <span>Commission (4%)</span>
            <span className="font-medium">- ₹{farmer_commission?.toLocaleString()}</span>
          </div>
          {isPaid && farmer_payment_mode && (
            <div className="flex justify-between items-center text-gray-500 pt-2 border-t border-gray-200 mt-2">
              <span>Paid via:</span>
              <span className="font-medium text-gray-700 max-w-[150px] truncate">{farmer_payment_mode}</span>
            </div>
          )}
        </div>

        <PDFDownloadLink
          document={<BillingInvoice data={invoiceData} type="farmer" />}
          fileName={`farmer-bill-${(record._id || record.id || 'unknown').slice(-6)}.pdf`}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium transition text-sm"
        >
          {({ loading }) => (
            <>
              <Download size={16} className={loading ? 'animate-pulse' : ''} />
              {loading ? 'Generating...' : 'Download Bill'}
            </>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default SoldRecordCard;
import React from 'react';
import { Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        lot_id,
        createdAt
    } = record;

    const status = farmer_payment_status || 'Pending';
    const isPaid = status === 'Paid';
    const date = record.sold_at ? new Date(record.sold_at) : new Date(createdAt);

    const handleDownloadBill = () => {
        // Basic bill generation logic (could be moved to a util)
        toast.success("Downloading Bill...");

        // Create a printable window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Please allow popups");
            return;
        }

        const html = `
      <html>
        <head>
          <title>Farmer Bill - ${lot_id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            .header { border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
            .title { color: #16a34a; font-size: 24px; font-weight: bold; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .total { border-top: 1px solid #ccc; padding-top: 10px; font-weight: bold; font-size: 18px; margin-top: 20px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">AgroNond Market Committee</div>
            <p>Official Farmer Bill</p>
          </div>
          
          <div class="row">
            <span>Date:</span> <span>${date.toLocaleDateString()}</span>
          </div>
          <div class="row">
            <span>Lot ID:</span> <span>${lot_id}</span>
          </div>
          <div class="row">
            <span>Vegetable:</span> <span>${vegetable}</span>
          </div>
          
          <hr/>
          
          <div class="row">
            <span>Quantity:</span> <span>${official_qty} kg</span>
          </div>
          <div class="row">
            <span>Rate:</span> <span>₹${sale_rate}/kg</span>
          </div>
          <div class="row">
            <span>Gross Amount:</span> <span>₹${sale_amount}</span>
          </div>
          
          <div class="row" style="color: #dc2626;">
             <span>Market Fee (4%):</span> <span>- ₹${farmer_commission}</span>
          </div>
          
          <div class="row total">
             <span>Net Payable Amount:</span> <span>₹${net_payable_to_farmer}</span>
          </div>
          
          <div class="row" style="margin-top:20px;">
             <span>Payment Status:</span> 
             <span style="color: ${isPaid ? 'green' : 'orange'}">${status.toUpperCase()}</span>
          </div>

          <div class="footer">
            <p>This is a computer generated bill.</p>
          </div>
        </body>
      </html>
    `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">{lot_id}</span>
                    <span className="text-xs text-gray-400">•</span>
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
                        <p className="text-sm text-gray-500">{official_qty} kg × ₹{sale_rate}/kg</p>
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

                <button
                    onClick={handleDownloadBill}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium transition text-sm"
                >
                    <Download size={16} />
                    Download Bill
                </button>
            </div>
        </div>
    );
};

export default SoldRecordCard;

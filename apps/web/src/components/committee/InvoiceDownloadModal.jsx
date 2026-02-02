import { useState, lazy, Suspense } from 'react';
import { X, Download, FileText, Loader2 } from 'lucide-react';

// Lazy load the heavy PDF components - only loads when user opens the modal
const PDFDownloadLink = lazy(() =>
    import('@react-pdf/renderer').then(module => ({ default: module.PDFDownloadLink }))
);
const BillingInvoice = lazy(() => import('./BillingInvoice'));

/**
 * Lightweight Invoice Download Modal
 * PDF components are lazy-loaded ONLY when this modal is opened
 * This prevents heavy PDF library from blocking initial page render
 */
export default function InvoiceDownloadModal({ isOpen, onClose, data, type }) {
    const [isReady, setIsReady] = useState(false);

    if (!isOpen || !data) return null;

    const isFarmer = type === 'farmer';

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Download Invoice</h3>
                            <p className="text-xs text-slate-500">Generate PDF receipt</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-slate-400 hover:text-slate-600" />
                    </button>
                </div>

                {/* Invoice Preview Info */}
                <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-medium mb-1">
                                {isFarmer ? 'Pay To' : 'Bill To'}
                            </p>
                            <p className="font-bold text-slate-800">{data.name}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${data.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                            {data.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-slate-500 text-xs">Crop</p>
                            <p className="font-medium text-slate-700">{data.crop}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Date</p>
                            <p className="font-medium text-slate-700">
                                {new Date(data.date).toLocaleDateString('en-IN')}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Amount</p>
                            <p className="font-bold text-emerald-600">₹{data.finalAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Transaction ID</p>
                            <p className="font-medium text-slate-700">#{data.id?.slice(-6)?.toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Download Button - PDF loaded lazily */}
                <Suspense fallback={
                    <button
                        disabled
                        className="w-full py-3.5 bg-slate-200 text-slate-500 font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading PDF Generator...
                    </button>
                }>
                    <PDFDownloadLink
                        document={<BillingInvoice data={data} type={type} />}
                        fileName={`invoice_${data.id?.slice(-6) || 'unknown'}.pdf`}
                        className="w-full"
                    >
                        {({ loading, error }) => (
                            <button
                                disabled={loading}
                                className={`w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${loading
                                        ? 'bg-slate-200 text-slate-500'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-200'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating PDF...
                                    </>
                                ) : error ? (
                                    <>Error generating PDF</>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Download Invoice PDF
                                    </>
                                )}
                            </button>
                        )}
                    </PDFDownloadLink>
                </Suspense>

                {/* Cancel Button */}
                <button
                    onClick={onClose}
                    className="w-full mt-3 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

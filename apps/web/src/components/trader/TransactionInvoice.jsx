import { forwardRef } from 'react';

const TransactionInvoice = forwardRef(({ transaction, committeeInfo }, ref) => {
    if (!transaction) return null;

    // --- Utility Functions ---
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    // --- Calculations ---
    const purchaseAmount = transaction.grossAmount || 0;
    const commissionRate = 0.09; // 9%
    const commissionAmount = transaction.commission || (purchaseAmount * commissionRate);
    const totalAmount = transaction.totalCost || (purchaseAmount + commissionAmount);

    // --- Defaults ---
    const committee = committeeInfo || {
        name: 'MIT Devcode Software',
        location: 'Kothrud, Pune, Maharashtra - 423301',
        phone: '+91 94205 30466',
        email: 'contact@agronond.com',
    };

    const colors = {
        primary: '#059669', // Emerald 600
        primaryLight: '#ecfdf5', // Emerald 50
        textDark: '#1f2937', // Gray 800
        textMedium: '#4b5563', // Gray 600
        textLight: '#9ca3af', // Gray 400
        border: '#e5e7eb', // Gray 200
        white: '#ffffff',
    };

    return (
        <div
            ref={ref}
            style={{
                width: '210mm',
                height: '297mm', // Fixed A4 height
                padding: '12mm 15mm', // Reduced top/bottom padding
                fontFamily: "'Inter', 'Segoe UI', Helvetica, sans-serif",
                fontSize: '12px',
                color: colors.textDark,
                backgroundColor: colors.white,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* --- Top Header Bar --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                {/* Brand / Logo Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Logo Box */}
                    <div style={{
                        width: '44px',
                        height: '44px',
                        backgroundColor: colors.primary,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                    }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                        </svg>
                    </div>
                    {/* Text Block - vertically centered with logo */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h1 style={{
                            margin: '-10px 0 0 0',
                            fontSize: '22px',
                            fontWeight: '800',
                            color: colors.textDark,
                            letterSpacing: '-0.5px',
                            lineHeight: 1
                        }}>
                            AgroNond
                        </h1>
                        <p style={{
                            margin: '30px 0 0 0',
                            fontSize: '10px',
                            color: colors.textLight,
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            lineHeight: 1
                        }}>
                            Digital Mandi Invoice
                        </p>
                    </div>
                </div>

                {/* Receipt Title */}
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '300', color: colors.primary, textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Receipt
                    </h2>
                </div>
            </div>

            {/* --- Info Grid --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                {/* Left: Issued By */}
                <div style={{ width: '45%' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '10px', color: colors.textLight, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                        Issued By
                    </h3>
                    <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '14px', color: colors.textDark }}>
                        {committee.name}
                    </p>
                    <p style={{ margin: '0 0 2px', color: colors.textMedium }}>{committee.location}</p>
                    <p style={{ margin: '0', color: colors.textMedium }}>{committee.email}</p>
                    <p style={{ margin: '0', color: colors.textMedium }}>{committee.phone}</p>
                </div>

                {/* Right: Transaction Details */}
                <div style={{ width: '45%', textAlign: 'right' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '10px', color: colors.textLight, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                        Transaction Details
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '2px 0', color: colors.textMedium }}>Date:</td>
                                <td style={{ padding: '2px 0', fontWeight: '600', color: colors.textDark }}>{formatDate(transaction.date)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '2px 0', color: colors.textMedium }}>Time:</td>
                                <td style={{ padding: '2px 0', fontWeight: '600', color: colors.textDark }}>{formatTime(transaction.date)}</td>
                            </tr>
                            {transaction._id && (
                                <tr>
                                    <td style={{ padding: '2px 0', color: colors.textMedium }}>Ref ID:</td>
                                    <td style={{ padding: '2px 0', fontWeight: '600', color: colors.textDark, fontFamily: 'monospace' }}>
                                        #{transaction._id.slice(-6).toUpperCase()}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Item Table --- */}
            <div style={{ marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: `2px solid ${colors.primary}` }}>
                            <th style={{ textAlign: 'left', padding: '12px 0', color: colors.primary, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description / Crop</th>
                            <th style={{ textAlign: 'right', padding: '12px 0', color: colors.primary, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quantity</th>
                            <th style={{ textAlign: 'right', padding: '12px 0', color: colors.primary, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rate</th>
                            <th style={{ textAlign: 'right', padding: '12px 0', color: colors.primary, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                            <td style={{ padding: '16px 0', fontWeight: '600', color: colors.textDark }}>
                                {transaction.crop || 'Unknown Crop'}
                            </td>
                            <td style={{ padding: '16px 0', textAlign: 'right', color: colors.textMedium }}>
                                {transaction.quantity?.toLocaleString('en-IN')} kg
                            </td>
                            <td style={{ padding: '16px 0', textAlign: 'right', color: colors.textMedium }}>
                                ₹{transaction.rate?.toLocaleString('en-IN')} /kg
                            </td>
                            <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '600', color: colors.textDark }}>
                                ₹{purchaseAmount.toLocaleString('en-IN')}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* --- Footer & Totals Section --- */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '50%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px dashed ${colors.border}` }}>
                        <span style={{ color: colors.textMedium }}>Subtotal</span>
                        <span style={{ fontWeight: '600', color: colors.textDark }}>₹{purchaseAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px dashed ${colors.border}` }}>
                        <span style={{ color: colors.textMedium }}>
                            Market Fee (9%)
                            <span style={{ display: 'block', fontSize: '9px', color: colors.textLight }}>Commission to Committee</span>
                        </span>
                        <span style={{ fontWeight: '600', color: colors.textDark }}>₹{commissionAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', alignItems: 'center', borderBottom: `2px solid ${colors.primary}` }}>
                        <span style={{ fontWeight: '700', color: colors.textDark, fontSize: '14px' }}>Total Amount</span>
                        <span style={{ fontWeight: '800', color: colors.primary, fontSize: '22px' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Payment Status Badge - Now at bottom near total */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
                        <div style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            backgroundColor: transaction.paymentStatus === 'paid' ? '#dcfce7' : '#fef3c7',
                            color: transaction.paymentStatus === 'paid' ? '#166534' : '#92400e',
                            fontWeight: '700',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {transaction.paymentStatus === 'paid' ? '✓ PAID' : '⏳ PENDING'}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Bottom Note / Legal --- */}
            <div style={{
                marginTop: 'auto',
                borderTop: `1px solid ${colors.border}`,
                paddingTop: '15px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ maxWidth: '60%' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: colors.textDark }}>Terms & Conditions</h4>
                        <p style={{ margin: '0', fontSize: '9px', color: colors.textLight, lineHeight: '1.4' }}>
                            This receipt acts as an official proof of transaction within the AgroNond platform.
                            Any disputes must be reported to the market committee within 24 hours of issuance.
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0', fontSize: '9px', color: colors.textLight }}>Powered by</p>
                        <p style={{ margin: '0', fontSize: '11px', fontWeight: '700', color: colors.primary }}>AgroNond Platform</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

TransactionInvoice.displayName = 'TransactionInvoice';

export default TransactionInvoice;
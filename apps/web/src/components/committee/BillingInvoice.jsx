import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'NotoSansDevanagari',
    fonts: [
        {
            src: '/fonts/noto-sans-devanagari-devanagari-400-normal.woff',
            fontWeight: 'normal',
        },
        {
            src: '/fonts/noto-sans-devanagari-devanagari-700-normal.woff',
            fontWeight: 'bold',
        },
    ],
});


const colors = {
    primary: '#059669',
    primaryDark: '#047857',
    primaryLight: '#d1fae5',
    primaryLighter: '#ecfdf5',
    textDark: '#1f2937',
    textMedium: '#4b5563',
    textLight: '#9ca3af',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    white: '#ffffff',
    paidBg: '#dcfce7',
    paidText: '#166534',
    pendingBg: '#fef3c7',
    pendingText: '#92400e',
    red: '#dc2626',
    redBg: '#fee2e2',
    // Blue colors for Partial status (matching Sales Records UI)
    partialBg: '#dbeafe',
    partialText: '#1d4ed8',
    partialBorder: '#bfdbfe',
};

const styles = StyleSheet.create({
    page: {
        padding: '12mm 15mm',
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: colors.textDark,
        backgroundColor: colors.white,
    },

    // Header Section
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 3,
        borderBottomColor: colors.primary,
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBox: {
        width: 48,
        height: 48,
        backgroundColor: colors.primary,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: colors.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    brandText: {
        marginLeft: 12,
    },
    brandName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 2,
    },
    brandSubtitle: {
        fontSize: 8,
        color: colors.textLight,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    receiptTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 2.5,
        textAlign: 'right',
    },

    // Info Grid Section
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
        gap: 15,
    },
    infoSection: {
        flex: 1,
    },
    infoSectionRight: {
        flex: 1,
        backgroundColor: colors.primaryLighter,
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryLight,
    },
    sectionLabel: {
        marginBottom: 8,
        fontSize: 8,
        color: colors.textLight,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        letterSpacing: 1.2,
    },
    companyName: {
        marginBottom: 5,
        fontWeight: 'bold',
        fontSize: 13,
        color: colors.textDark,
    },
    companyDetail: {
        marginBottom: 3,
        color: colors.textMedium,
        fontSize: 9,
        lineHeight: 1.4,
    },

    // Transaction Details
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        paddingVertical: 2,
    },
    detailLabel: {
        color: colors.textMedium,
        fontSize: 9,
        textAlign: 'left',
    },
    detailValue: {
        color: colors.textDark,
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'right',
    },

    // Recipient Section
    recipientSection: {
        marginBottom: 18,
        padding: 14,
        backgroundColor: colors.primaryLight,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    recipientLabel: {
        fontSize: 8,
        color: colors.primaryDark,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 6,
        letterSpacing: 1,
    },
    recipientName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.textDark,
        fontFamily: 'NotoSansDevanagari',
    },

    // Table Styles — 5 columns now: Crop | Qty | Rate Details | Total Amount | Status
    table: {
        marginTop: 5,
        width: '100%',
        marginBottom: 18,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    th: {
        color: colors.white,
        fontSize: 7.5,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        letterSpacing: 0.6,
    },
    // Column flex weights tuned for 5-col layout
    thCrop: { textAlign: 'left', flex: 2.4 },
    thQty: { textAlign: 'center', flex: 1.0 },
    thRateDetails: { textAlign: 'left', flex: 2.2 },
    thTotalAmount: { textAlign: 'right', flex: 1.2 },
    thStatus: { textAlign: 'center', flex: 1.0 },

    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: colors.white,
        alignItems: 'center',
    },
    td: {
        fontSize: 9.5,
        color: colors.textDark,
    },
    tdCrop: {
        textAlign: 'left',
        flex: 2.4,
        fontWeight: 'bold',
        fontFamily: 'NotoSansDevanagari',
        fontSize: 10.5,
    },
    tdQty: {
        textAlign: 'center',
        flex: 1.0,
        color: colors.textMedium,
        fontSize: 9,
    },
    tdRateDetails: {
        textAlign: 'left',
        flex: 2.2,
        fontSize: 8.5,
        color: colors.textMedium,
        lineHeight: 1.6,
    },
    tdTotalAmount: {
        textAlign: 'right',
        flex: 1.2,
        fontWeight: 'bold',
        fontSize: 10,
    },
    tdStatus: {
        textAlign: 'center',
        flex: 1.0,
    },

    // Inline status badge inside the table row
    statusBadgeInline: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        alignSelf: 'center',
    },
    statusTextInline: {
        fontSize: 7.5,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    // Totals Section
    totalsSection: {
        alignSelf: 'flex-end',
        width: '58%',
        marginTop: 12,
        backgroundColor: colors.borderLight,
        borderRadius: 8,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomStyle: 'dashed',
        borderBottomColor: colors.border,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        marginTop: 8,
        borderTopWidth: 2,
        borderTopColor: colors.primary,
        backgroundColor: colors.primaryLighter,
        marginHorizontal: -14,
        paddingHorizontal: 14,
        borderRadius: 6,
    },
    totalLabel: {
        color: colors.textMedium,
        fontSize: 9.5,
    },
    totalValue: {
        fontWeight: 'bold',
        color: colors.textDark,
        fontSize: 9.5,
    },
    grandTotalLabel: {
        fontWeight: 'bold',
        color: colors.textDark,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    grandTotalValue: {
        fontWeight: 'bold',
        color: colors.primary,
        fontSize: 16,
    },

    // Bottom Status Badge (below totals)
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        marginTop: 12,
        alignSelf: 'flex-end',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    termsSection: {
        width: '62%',
    },
    termsTitle: {
        marginBottom: 5,
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.textDark,
    },
    termsText: {
        fontSize: 7.5,
        color: colors.textLight,
        lineHeight: 1.5,
    },
    poweredBySection: {
        textAlign: 'right',
    },
    poweredBy: {
        fontSize: 7.5,
        color: colors.textLight,
        textAlign: 'right',
        marginBottom: 2,
    },
    poweredByBrand: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'right',
    },

    // Watermark
    watermark: {
        position: 'absolute',
        fontSize: 60,
        color: colors.border,
        opacity: 0.05,
        transform: 'rotate(-45deg)',
        top: '40%',
        left: '25%',
    },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-IN');
};

const formatCurrency = (num) => {
    if (num === undefined || num === null || isNaN(num)) return 'Rs. 0';
    return `Rs. ${Number(num).toLocaleString('en-IN')}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Returns { bg, text, border } colour set for a given status string.
 * "Partial" → blue  |  "Sold" / "Paid" → green  |  anything else → amber
 */
const getStatusColors = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'partial') {
        return { bg: colors.partialBg, text: colors.partialText, border: colors.partialBorder };
    }
    if (s === 'sold' || s === 'paid') {
        return { bg: colors.paidBg, text: colors.paidText, border: colors.primaryLight };
    }
    // Pending / default → amber
    return { bg: colors.pendingBg, text: colors.pendingText, border: '#fcd34d' };
};

// ─── Component ──────────────────────────────────────────────────────────────

const BillingInvoice = ({ data, type = 'farmer' }) => {
    if (!data) return null;

    const isFarmer = type === 'farmer';
    const title = isFarmer ? 'PAYMENT ADVICE' : 'RECEIPT';

    // ── status: use the status already computed & passed from SoldRecordCard ──
    const status = data.status || 'Pending';   // "Paid" | "Partial" | "Pending"
    const statusColors = getStatusColors(status);

    // ── Committee info ──
    const committee = {
        name: 'APMC Market Committee',
        location: 'Tasgaon, Sangli, Maharashtra - 416312',
        phone: '+91 94205 30466',
        email: 'committee@agronond.com',
    };

    // ── Quantities ──
    const quantity = data.qty || data.quantity || 0;
    const carat = data.carat || data.crt || 0;
    const hasQuantity = quantity > 0;
    const hasCarat = carat > 0;
    const unit = hasQuantity ? 'kg' : 'Crt';
    const displayQty = hasQuantity ? quantity : carat;

    // ── Amounts — driven by what has ACTUALLY been received/sold ──
    //    SoldRecordCard already computes soldQty-based baseAmount & commission
    //    and passes them in invoiceData.  We honour those directly.
    const baseAmount = data.baseAmount || data.amount || data.grossAmount || 0;
    const commission = data.commission || 0;
    const finalAmount = data.finalAmount || data.netAmount || baseAmount;

    // Calculate rate - use provided rate or calculate as fallback
    let rate = data.rate || 0;
    let rateUnit = hasQuantity ? 'kg' : 'Crt';

    // Fallback calculation if rate not provided
    if (rate === 0 && baseAmount > 0) {
        if (hasQuantity && quantity > 0) {
            rate = baseAmount / quantity;
        } else if (hasCarat && carat > 0) {
            rate = baseAmount / carat;
        }
    }

    const rateDetailsLines = (() => {
        if (splits.length > 0) {
            return splits.map((s, i) => {
                const sUnit = hasQuantity ? 'kg' : 'Crt';
                return `₹${formatNumber(s.rate)} for ${formatNumber(s.qty)} ${sUnit}`;
            });
        }
        // Single-rate fallback
        if (displayQty > 0) {
            const rate = (baseAmount / displayQty).toFixed(2);
            return [`₹${rate} for ${formatNumber(displayQty)} ${unit}`];
        }
        return ['-'];
    })();

    // ── Commission percentage ──
    const commissionPercent = baseAmount > 0 ? ((commission / baseAmount) * 100).toFixed(1) : '4.0';

    // ── Quantity display string ──
    const getQuantityDisplay = () => {
        if (hasQuantity && hasCarat) return `${formatNumber(quantity)} kg / ${formatNumber(carat)} Crt`;
        if (hasQuantity) return `${formatNumber(quantity)} kg`;
        if (hasCarat) return `${formatNumber(carat)} Crt`;
        return '-';
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Watermark */}
                <Text style={styles.watermark}>AgroNond</Text>

                {/* ─── Header ─── */}
                <View style={styles.header}>
                    <View style={styles.brand}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>A</Text>
                        </View>
                        <View style={styles.brandText}>
                            <Text style={styles.brandName}>AgroNond</Text>
                            <Text style={styles.brandSubtitle}>Digital Mandi Platform</Text>
                        </View>
                    </View>
                    <Text style={styles.receiptTitle}>{title}</Text>
                </View>

                {/* ─── Info Grid ─── */}
                <View style={styles.infoGrid}>
                    {/* Issuer */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionLabel}>Issued By</Text>
                        <Text style={styles.companyName}>{committee.name}</Text>
                        <Text style={styles.companyDetail}>{committee.location}</Text>
                        <Text style={styles.companyDetail}>{committee.email}</Text>
                        <Text style={styles.companyDetail}>{committee.phone}</Text>
                    </View>

                    {/* Transaction Details */}
                    <View style={styles.infoSectionRight}>
                        <Text style={styles.sectionLabel}>Transaction Details</Text>
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailLabel}>Date:</Text>
                            <Text style={styles.detailValue}>{formatDate(data.date)}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailLabel}>Time:</Text>
                            <Text style={styles.detailValue}>{formatTime(data.date)}</Text>
                        </View>
                        {(data.id || data._id) && (
                            <View style={styles.detailsRow}>
                                <Text style={styles.detailLabel}>Transaction ID:</Text>
                                <Text style={styles.detailValue}>
                                    #{(data.id || data._id).slice(-6).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailLabel}>Type:</Text>
                            <Text style={styles.detailValue}>
                                {isFarmer ? 'Farmer Payment' : 'Trader Bill'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ─── PAY TO / BILL TO  ─── farmer name from backend via data.name ─── */}
                <View style={styles.recipientSection}>
                    <Text style={styles.recipientLabel}>
                        {isFarmer ? 'PAY TO' : 'BILL TO'}
                    </Text>
                    {/* data.name is populated from farmerName prop fetched from backend */}
                    <Text style={styles.recipientName}>{data.name || 'Unknown Farmer'}</Text>
                </View>

                {/* ─── Items Table  ── 5 columns: Crop | Qty | Rate Details | Total Amount | Status ─── */}
                <View style={styles.table}>
                    {/* Header row */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, styles.thCrop]}>Description / Crop</Text>
                        <Text style={[styles.th, styles.thQty]}>Quantity</Text>
                        <Text style={[styles.th, styles.thRateDetails]}>Rate Details</Text>
                        <Text style={[styles.th, styles.thTotalAmount]}>Total Amount</Text>
                        <Text style={[styles.th, styles.thStatus]}>Status</Text>
                    </View>

                    {/* Check if we have splits data for multiple rows */}
                    {data.splits && data.splits.length > 1 ? (
                        // Render individual rows for each split
                        data.splits.map((split, index) => {
                            const splitQty = split.qty || split.quantity || 0;
                            const splitCarat = split.carat || 0;
                            const splitRate = split.rate || 0;
                            const splitAmount = split.amount || (splitQty * splitRate);
                            const splitUnit = splitQty > 0 ? 'kg' : 'Crt';
                            const displayQty = splitQty > 0 ? splitQty : splitCarat;

                            return (
                                <View style={styles.tableRow} key={index}>
                                    <Text style={[styles.td, styles.tdCrop]}>
                                        {index === 0 ? (data.crop || 'Unknown Crop') : ''}
                                    </Text>
                                    <Text style={[styles.td, styles.tdCenter]}>
                                        {formatNumber(displayQty)} {splitUnit}
                                    </Text>
                                    <Text style={[styles.td, styles.tdCenter]}>
                                        {formatCurrency(splitRate.toFixed(2))}/{splitUnit}
                                    </Text>
                                    <Text style={[styles.td, styles.tdRight]}>
                                        {formatCurrency(splitAmount)}
                                    </Text>
                                </View>
                            );
                        })
                    ) : (
                        // Single row for non-split records
                        <View style={styles.tableRow}>
                            <Text style={[styles.td, styles.tdCrop]}>
                                {data.crop || 'Unknown Crop'}
                            </Text>
                            <Text style={[styles.td, styles.tdCenter]}>
                                {getQuantityDisplay()}
                            </Text>
                            <Text style={[styles.td, styles.tdCenter]}>
                                {formatCurrency(rate.toFixed(2))}/{rateUnit}
                            </Text>
                            <Text style={[styles.td, styles.tdRight]}>
                                {formatCurrency(baseAmount)}
                            </Text>
                        </View>
                    )}
                </View>


                {/* Totals Section */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal (Base Amount)</Text>
                        <Text style={styles.totalValue}>{formatCurrency(baseAmount)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>
                            {isFarmer
                                ? `Less: Commission (${commissionPercent}%)`
                                : `Add: Market Fee (${commissionPercent}%)`}
                        </Text>
                        <Text style={[
                            styles.totalValue,
                            { color: isFarmer ? colors.red : colors.textDark }
                        ]}>
                            {isFarmer ? '- ' : '+ '}{formatCurrency(commission)}
                        </Text>
                    </View>

                    {/* NET PAYABLE → renamed to TOTAL AMOUNT */}
                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>Total Amount</Text>
                        <Text style={styles.grandTotalValue}>
                            {formatCurrency(finalAmount)}
                        </Text>
                    </View>

                    {/* Bottom status badge — colour-matched: blue for Partial */}
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: statusColors.bg, borderWidth: 1, borderColor: statusColors.border }
                    ]}>
                        <Text style={[styles.statusText, { color: statusColors.text }]}>
                            {status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* ─── Footer ─── */}
                <View style={styles.footer}>
                    <View style={styles.termsSection}>
                        <Text style={styles.termsTitle}>Terms & Conditions</Text>
                        <Text style={styles.termsText}>
                            This document serves as an official proof of payment/billing within
                            the AgroNond platform. Any disputes must be reported to the market
                            committee within 24 hours. All transactions are subject to APMC rules
                            and regulations.
                        </Text>
                    </View>
                    <View style={styles.poweredBySection}>
                        <Text style={styles.poweredBy}>Powered by</Text>
                        <Text style={styles.poweredByBrand}>AgroNond Platform</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default BillingInvoice;
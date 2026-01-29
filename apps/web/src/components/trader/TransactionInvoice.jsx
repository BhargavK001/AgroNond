import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Reverted to standard font to ensure reliability
const colors = {
    primary: '#059669',
    textDark: '#1f2937',
    textMedium: '#4b5563',
    textLight: '#9ca3af',
    border: '#e5e7eb',
    white: '#ffffff',
    paidBg: '#dcfce7',
    paidText: '#166534',
    pendingBg: '#fef3c7',
    pendingText: '#92400e',
};

const styles = StyleSheet.create({
    page: {
        padding: '12mm 15mm',
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: colors.textDark,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoBox: {
        width: 36,
        height: 36,
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    brandText: {
        marginLeft: 10,
    },
    brandName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
    },
    brandSubtitle: {
        fontSize: 8,
        color: colors.textLight,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    receiptTitle: {
        fontSize: 20,
        fontWeight: 'normal',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    infoSection: {
        width: '55%',
    },
    infoSectionRight: {
        width: '40%',
        alignItems: 'flex-end',
    },
    sectionLabel: {
        marginBottom: 8,
        fontSize: 8,
        color: colors.textLight,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    companyName: {
        marginBottom: 4,
        fontWeight: 'bold',
        fontSize: 12,
        color: colors.textDark,
    },
    companyDetail: {
        marginBottom: 2,
        color: colors.textMedium,
        fontSize: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 2,
        alignItems: 'center',
    },
    label: {
        color: colors.textMedium,
        fontSize: 10,
        width: 70,
        textAlign: 'right',
        marginRight: 8,
    },
    value: {
        color: colors.textDark,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    table: {
        marginTop: 10,
        width: '100%',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        paddingBottom: 6,
        marginBottom: 6,
    },
    th: {
        color: colors.primary,
        fontSize: 9,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    thLeft: { textAlign: 'left', flex: 2 },
    thRight: { textAlign: 'right', flex: 1 },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: 8,
    },
    td: {
        fontSize: 10,
        color: colors.textDark,
    },
    itemName: { textAlign: 'left', flex: 2, fontWeight: 'bold' },
    itemValue: { textAlign: 'right', flex: 1, color: colors.textMedium },
    itemAmount: { textAlign: 'right', flex: 1, fontWeight: 'bold', color: colors.textDark },

    totalsSection: {
        alignSelf: 'flex-end',
        width: '50%',
        marginTop: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomStyle: 'dashed',
        borderBottomColor: colors.border,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        marginTop: 4,
    },
    totalLabel: {
        color: colors.textMedium,
        fontSize: 10,
    },
    totalValue: {
        fontWeight: 'bold',
        color: colors.textDark,
        fontSize: 10,
    },
    grandTotalLabel: {
        fontWeight: 'bold',
        color: colors.textDark,
        fontSize: 12,
    },
    grandTotalValue: {
        fontWeight: 'extrabold',
        color: colors.primary,
        fontSize: 16,
    },
    feeNote: {
        fontSize: 7,
        color: colors.textLight,
        marginLeft: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        marginTop: 12,
        alignSelf: 'flex-end',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    termsTitle: {
        marginBottom: 4,
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.textDark,
    },
    termsText: {
        fontSize: 7,
        color: colors.textLight,
        width: '70%',
    },
    poweredBy: {
        fontSize: 7,
        color: colors.textLight,
        textAlign: 'right',
    },
    poweredByBrand: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'right',
    },
});

const TransactionInvoice = ({ transaction, committeeInfo }) => {
    if (!transaction) return null;

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

    const purchaseAmount = transaction.grossAmount || 0;
    const commissionRate = 0.09;
    const commissionAmount = transaction.commission || (purchaseAmount * commissionRate);
    const totalAmount = transaction.totalCost || (purchaseAmount + commissionAmount);

    const committee = committeeInfo || {
        name: 'MIT Devcode Software',
        location: 'Kothrud, Pune, Maharashtra - 423301',
        phone: '+91 94205 30466',
        email: 'contact@agronond.com',
    };

    const isPaid = (transaction.paymentStatus || '').toLowerCase() === 'paid';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.brand}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>A</Text>
                        </View>
                        <View style={styles.brandText}>
                            <Text style={styles.brandName}>AgroNond</Text>
                            <Text style={styles.brandSubtitle}>Digital Mandi Invoice</Text>
                        </View>
                    </View>
                    <Text style={styles.receiptTitle}>Receipt</Text>
                </View>

                {/* Info Grid */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionLabel}>Issued By</Text>
                        <Text style={styles.companyName}>{committee.name}</Text>
                        <Text style={styles.companyDetail}>{committee.location}</Text>
                        <Text style={styles.companyDetail}>{committee.email}</Text>
                        <Text style={styles.companyDetail}>{committee.phone}</Text>
                    </View>

                    <View style={styles.infoSectionRight}>
                        <Text style={styles.sectionLabel}>Transaction Details</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Date:</Text>
                            <Text style={styles.value}>{formatDate(transaction.date)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Time:</Text>
                            <Text style={styles.value}>{formatTime(transaction.date)}</Text>
                        </View>
                        {transaction._id && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Ref ID:</Text>
                                <Text style={styles.value}>#{transaction._id.slice(-6).toUpperCase()}</Text>
                            </View>
                        )}
                        {/* Lot ID Removed from here */}
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, styles.thLeft]}>Description / Crop</Text>
                        <Text style={[styles.th, styles.thRight]}>Quantity</Text>
                        <Text style={[styles.th, styles.thRight]}>Rate</Text>
                        <Text style={[styles.th, styles.thRight]}>Amount</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.td, styles.itemName]}>{transaction.crop || 'Unknown Crop'}</Text>
                        <Text style={[styles.td, styles.itemValue]}>{transaction.quantity?.toLocaleString('en-IN')} kg</Text>
                        <Text style={[styles.td, styles.itemValue]}>₹{transaction.rate?.toLocaleString('en-IN')} /kg</Text>
                        <Text style={[styles.td, styles.itemAmount]}>₹{purchaseAmount.toLocaleString('en-IN')}</Text>
                    </View>
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>₹{purchaseAmount.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.totalLabel}>Market Fee (9%)</Text>
                            <Text style={styles.feeNote}>(Commission)</Text>
                        </View>
                        <Text style={styles.totalValue}>₹{commissionAmount.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>Total Amount</Text>
                        <Text style={styles.grandTotalValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
                    </View>

                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: isPaid ? colors.paidBg : colors.pendingBg }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: isPaid ? colors.paidText : colors.pendingText }
                        ]}>
                            {isPaid ? '✓ PAID' : '⏳ PENDING'}
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={{ width: '60%' }}>
                        <Text style={styles.termsTitle}>Terms & Conditions</Text>
                        <Text style={styles.termsText}>
                            This receipt acts as an official proof of transaction within the AgroNond platform.
                            Any disputes must be reported to the market committee within 24 hours of issuance.
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.poweredBy}>Powered by</Text>
                        <Text style={styles.poweredByBrand}>AgroNond Platform</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default TransactionInvoice;
export const transactionsData = [
    {
        id: 1,
        date: '2026-01-22',
        farmer: { id: 1, name: 'Ramesh Kumar', phone: '9876543210' },
        trader: { id: 1, name: 'Sharma Traders', business: 'Sharma Traders' },
        crop: 'Tomato',
        quantity: 500,
        rate: 40,
        baseAmount: 20000,
        farmerCommission: 800,  // 4%
        traderCommission: 1800, // 9%
        totalCommission: 2600,  // 13% total
        farmerPayable: 19200,
        traderReceivable: 21800,
        paymentStatus: 'Completed',
        farmerPaid: true,
        traderPaid: true
    },
    {
        id: 2,
        date: '2026-01-22',
        farmer: { id: 2, name: 'Suresh Patel', phone: '9876543211' },
        trader: { id: 2, name: 'Gupta & Sons', business: 'Gupta & Sons' },
        crop: 'Onion',
        quantity: 1200,
        rate: 15,
        baseAmount: 18000,
        farmerCommission: 720,
        traderCommission: 1620,
        totalCommission: 2340,
        farmerPayable: 17280,
        traderReceivable: 19620,
        paymentStatus: 'Pending',
        farmerPaid: false,
        traderPaid: false
    },
    {
        id: 3,
        date: '2026-01-21',
        farmer: { id: 3, name: 'Mahesh Singh', phone: '9876543212' },
        trader: { id: 3, name: 'Fresh Mart', business: 'Fresh Mart' },
        crop: 'Potato',
        quantity: 800,
        rate: 22,
        baseAmount: 17600,
        farmerCommission: 704,
        traderCommission: 1584,
        totalCommission: 2288,
        farmerPayable: 16896,
        traderReceivable: 19184,
        paymentStatus: 'Completed',
        farmerPaid: true,
        traderPaid: true
    },
    {
        id: 4,
        date: '2026-01-21',
        farmer: { id: 4, name: 'Dinesh Yadav', phone: '9876543213' },
        trader: { id: 1, name: 'Sharma Traders', business: 'Sharma Traders' },
        crop: 'Cabbage',
        quantity: 600,
        rate: 12,
        baseAmount: 7200,
        farmerCommission: 288,
        traderCommission: 648,
        totalCommission: 936,
        farmerPayable: 6912,
        traderReceivable: 7848,
        paymentStatus: 'Completed',
        farmerPaid: true,
        traderPaid: true
    },
    {
        id: 5,
        date: '2026-01-20',
        farmer: { id: 5, name: 'Ganesh Thakur', phone: '9876543214' },
        trader: { id: 4, name: 'City Grocers', business: 'City Grocers' },
        crop: 'Cauliflower',
        quantity: 400,
        rate: 30,
        baseAmount: 12000,
        farmerCommission: 480,
        traderCommission: 1080,
        totalCommission: 1560,
        farmerPayable: 11520,
        traderReceivable: 13080,
        paymentStatus: 'Partial',
        farmerPaid: true,
        traderPaid: false
    },
    {
        id: 6,
        date: '2026-01-20',
        farmer: { id: 6, name: 'Rajesh Sharma', phone: '9876543215' },
        trader: { id: 5, name: 'Veggie World', business: 'Veggie World' },
        crop: 'Brinjal',
        quantity: 350,
        rate: 25,
        baseAmount: 8750,
        farmerCommission: 350,
        traderCommission: 787.5,
        totalCommission: 1137.5,
        farmerPayable: 8400,
        traderReceivable: 9537.5,
        paymentStatus: 'Pending',
        farmerPaid: false,
        traderPaid: false
    },
    {
        id: 7,
        date: '2026-01-19',
        farmer: { id: 7, name: 'Mukesh Verma', phone: '9876543216' },
        trader: { id: 2, name: 'Gupta & Sons', business: 'Gupta & Sons' },
        crop: 'Green Chilli',
        quantity: 200,
        rate: 80,
        baseAmount: 16000,
        farmerCommission: 640,
        traderCommission: 1440,
        totalCommission: 2080,
        farmerPayable: 15360,
        traderReceivable: 17440,
        paymentStatus: 'Completed',
        farmerPaid: true,
        traderPaid: true
    },
    {
        id: 8,
        date: '2026-01-19',
        farmer: { id: 8, name: 'Naresh Gupta', phone: '9876543217' },
        trader: { id: 3, name: 'Fresh Mart', business: 'Fresh Mart' },
        crop: 'Carrot',
        quantity: 450,
        rate: 35,
        baseAmount: 15750,
        farmerCommission: 630,
        traderCommission: 1417.5,
        totalCommission: 2047.5,
        farmerPayable: 15120,
        traderReceivable: 17167.5,
        paymentStatus: 'Completed',
        farmerPaid: true,
        traderPaid: true
    }
];

export const calculateSummary = (data) => {
    const totalTransactions = data.length;
    const totalBaseAmount = data.reduce((acc, t) => acc + t.baseAmount, 0);
    const totalFarmerCommission = data.reduce((acc, t) => acc + t.farmerCommission, 0);
    const totalTraderCommission = data.reduce((acc, t) => acc + t.traderCommission, 0);
    const totalCommission = totalFarmerCommission + totalTraderCommission;

    const completedTransactions = data.filter(t => t.paymentStatus === 'Completed');
    const pendingTransactions = data.filter(t => t.paymentStatus === 'Pending');
    const partialTransactions = data.filter(t => t.paymentStatus === 'Partial');

    const receivedPayments = data.filter(t => t.traderPaid).reduce((acc, t) => acc + t.traderReceivable, 0);
    const pendingPayments = data.filter(t => !t.traderPaid).reduce((acc, t) => acc + t.traderReceivable, 0);

    const farmerPaymentsDue = data.filter(t => !t.farmerPaid).reduce((acc, t) => acc + t.farmerPayable, 0);
    const farmerPaymentsPaid = data.filter(t => t.farmerPaid).reduce((acc, t) => acc + t.farmerPayable, 0);

    return {
        totalTransactions,
        totalBaseAmount,
        totalFarmerCommission,
        totalTraderCommission,
        totalCommission,
        completedCount: completedTransactions.length,
        pendingCount: pendingTransactions.length,
        partialCount: partialTransactions.length,
        receivedPayments,
        pendingPayments,
        farmerPaymentsDue,
        farmerPaymentsPaid
    };
};

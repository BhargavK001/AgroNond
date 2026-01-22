// Mock Data for Admin Dashboard
// Dynamic commission rates - NOT hardcoded

export const commissionConfig = {
  farmerRate: 0.04, // 4%
  traderRate: 0.09, // 9%
  lastUpdated: '2026-01-15T10:30:00Z',
  updatedBy: 'admin_001'
};

// User roles for RBAC
export const USER_ROLES = {
  ADMIN: 'admin',
  FARMER: 'farmer',
  TRADER: 'trader',
  WEIGHT_STAFF: 'weight_staff',
  ACCOUNTANT: 'accountant'
};

export const VERIFICATION_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
};

// Mock Users (Farmers, Traders, Staff)
export const mockUsers = [
  // Farmers
  { id: 'F001', name: 'Ramesh Patil', phone: '9876543210', role: 'farmer', village: 'Koregaon', status: 'active', joinedDate: '2025-06-15', totalSales: 125000 },
  { id: 'F002', name: 'Sunita Jadhav', phone: '9876543211', role: 'farmer', village: 'Baramati', status: 'active', joinedDate: '2025-07-20', totalSales: 89000 },
  { id: 'F003', name: 'Vijay Kumar', phone: '9876543212', role: 'farmer', village: 'Shirur', status: 'pending', joinedDate: '2026-01-10', totalSales: 0 },
  { id: 'F004', name: 'Lakshmi Devi', phone: '9876543213', role: 'farmer', village: 'Indapur', status: 'active', joinedDate: '2025-08-05', totalSales: 156000 },
  { id: 'F005', name: 'Anil Shinde', phone: '9876543214', role: 'farmer', village: 'Daund', status: 'suspended', joinedDate: '2025-05-10', totalSales: 42000 },
  { id: 'F006', name: 'Meena Kale', phone: '9876543215', role: 'farmer', village: 'Junnar', status: 'active', joinedDate: '2025-09-12', totalSales: 78000 },
  { id: 'F007', name: 'Prakash Gaikwad', phone: '9876543216', role: 'farmer', village: 'Haveli', status: 'pending', joinedDate: '2026-01-18', totalSales: 0 },
  
  // Traders
  { id: 'T001', name: 'Rajesh Agarwal', phone: '9988776655', role: 'trader', businessName: 'Agarwal Traders', status: 'active', joinedDate: '2025-04-10', totalPurchases: 890000 },
  { id: 'T002', name: 'Suresh Gupta', phone: '9988776656', role: 'trader', businessName: 'Gupta Vegetables', status: 'active', joinedDate: '2025-05-15', totalPurchases: 650000 },
  { id: 'T003', name: 'Amit Sharma', phone: '9988776657', role: 'trader', businessName: 'Sharma Fresh Foods', status: 'pending', joinedDate: '2026-01-12', totalPurchases: 0 },
  { id: 'T004', name: 'Deepak Jain', phone: '9988776658', role: 'trader', businessName: 'Jain Agro Traders', status: 'active', joinedDate: '2025-06-20', totalPurchases: 420000 },
  { id: 'T005', name: 'Manoj Bansal', phone: '9988776659', role: 'trader', businessName: 'Bansal Exports', status: 'suspended', joinedDate: '2025-03-05', totalPurchases: 180000 },
  
  // Staff
  { id: 'S001', name: 'Sunil Kamble', phone: '9123456789', role: 'weight_staff', department: 'Weighing', status: 'active', joinedDate: '2025-02-10' },
  { id: 'S002', name: 'Priya Deshmukh', phone: '9123456790', role: 'accountant', department: 'Accounts', status: 'active', joinedDate: '2025-03-15' },
  { id: 'S003', name: 'Rahul Pawar', phone: '9123456791', role: 'weight_staff', department: 'Weighing', status: 'pending', joinedDate: '2026-01-05' },
  
  // Admin
  { id: 'A001', name: 'Admin User', phone: '9999999999', role: 'admin', department: 'Administration', status: 'active', joinedDate: '2025-01-01' }
];

// Mock Transactions (Lot Entries)
export const mockTransactions = [
  {
    id: 'TXN001',
    lotId: 'LOT-2026-001',
    date: '2026-01-20',
    farmerId: 'F001',
    farmerName: 'Ramesh Patil',
    traderId: 'T001',
    traderName: 'Rajesh Agarwal',
    crop: 'Tomatoes',
    quantity: 500, // kg
    rate: 45, // per kg
    grossAmount: 22500,
    farmerCommission: 900, // 4%
    traderCommission: 2025, // 9%
    netFarmerAmount: 21600,
    status: 'completed',
    weighedBy: 'S001',
    paymentStatus: 'paid'
  },
  {
    id: 'TXN002',
    lotId: 'LOT-2026-002',
    date: '2026-01-20',
    farmerId: 'F002',
    farmerName: 'Sunita Jadhav',
    traderId: 'T002',
    traderName: 'Suresh Gupta',
    crop: 'Onions',
    quantity: 800,
    rate: 28,
    grossAmount: 22400,
    farmerCommission: 896,
    traderCommission: 2016,
    netFarmerAmount: 21504,
    status: 'completed',
    weighedBy: 'S001',
    paymentStatus: 'paid'
  },
  {
    id: 'TXN003',
    lotId: 'LOT-2026-003',
    date: '2026-01-19',
    farmerId: 'F004',
    farmerName: 'Lakshmi Devi',
    traderId: 'T001',
    traderName: 'Rajesh Agarwal',
    crop: 'Potatoes',
    quantity: 1200,
    rate: 22,
    grossAmount: 26400,
    farmerCommission: 1056,
    traderCommission: 2376,
    netFarmerAmount: 25344,
    status: 'completed',
    weighedBy: 'S001',
    paymentStatus: 'pending'
  },
  {
    id: 'TXN004',
    lotId: 'LOT-2026-004',
    date: '2026-01-19',
    farmerId: 'F006',
    farmerName: 'Meena Kale',
    traderId: 'T004',
    traderName: 'Deepak Jain',
    crop: 'Cabbage',
    quantity: 600,
    rate: 15,
    grossAmount: 9000,
    farmerCommission: 360,
    traderCommission: 810,
    netFarmerAmount: 8640,
    status: 'completed',
    weighedBy: 'S001',
    paymentStatus: 'paid'
  },
  {
    id: 'TXN005',
    lotId: 'LOT-2026-005',
    date: '2026-01-18',
    farmerId: 'F001',
    farmerName: 'Ramesh Patil',
    traderId: 'T002',
    traderName: 'Suresh Gupta',
    crop: 'Brinjal',
    quantity: 400,
    rate: 35,
    grossAmount: 14000,
    farmerCommission: 560,
    traderCommission: 1260,
    netFarmerAmount: 13440,
    status: 'completed',
    weighedBy: 'S001',
    paymentStatus: 'paid'
  },
  {
    id: 'TXN006',
    lotId: 'LOT-2026-006',
    date: '2026-01-18',
    farmerId: 'F002',
    farmerName: 'Sunita Jadhav',
    traderId: 'T004',
    traderName: 'Deepak Jain',
    crop: 'Cauliflower',
    quantity: 300,
    rate: 40,
    grossAmount: 12000,
    farmerCommission: 480,
    traderCommission: 1080,
    netFarmerAmount: 11520,
    status: 'completed',
    weighedBy: 'S001',
    paymentStatus: 'pending'
  },
  {
    id: 'TXN007',
    lotId: 'LOT-2026-007',
    date: '2026-01-17',
    farmerId: 'F004',
    farmerName: 'Lakshmi Devi',
    traderId: 'T001',
    traderName: 'Rajesh Agarwal',
    crop: 'Green Chillies',
    quantity: 150,
    rate: 80,
    grossAmount: 12000,
    farmerCommission: 480,
    traderCommission: 1080,
    netFarmerAmount: 11520,
    status: 'completed',
    weighedBy: 'S001',
    paymentStatus: 'paid'
  },
  {
    id: 'TXN008',
    lotId: 'LOT-2026-008',
    date: '2026-01-16',
    farmerId: 'F006',
    farmerName: 'Meena Kale',
    traderId: 'T002',
    traderName: 'Suresh Gupta',
    crop: 'Carrots',
    quantity: 450,
    rate: 30,
    grossAmount: 13500,
    farmerCommission: 540,
    traderCommission: 1215,
    netFarmerAmount: 12960,
    status: 'completed',
    weighedBy: 'S001',
    paymentStatus: 'paid'
  }
];

// Market Activity Data (for charts)
export const marketActivityData = [
  { date: '2026-01-14', volume: 4500, transactions: 12, revenue: 135000 },
  { date: '2026-01-15', volume: 5200, transactions: 15, revenue: 156000 },
  { date: '2026-01-16', volume: 4800, transactions: 14, revenue: 144000 },
  { date: '2026-01-17', volume: 6100, transactions: 18, revenue: 183000 },
  { date: '2026-01-18', volume: 5500, transactions: 16, revenue: 165000 },
  { date: '2026-01-19', volume: 7200, transactions: 21, revenue: 216000 },
  { date: '2026-01-20', volume: 6800, transactions: 19, revenue: 204000 }
];

// Dashboard Stats
export const getDashboardStats = () => {
  const farmers = mockUsers.filter(u => u.role === 'farmer');
  const traders = mockUsers.filter(u => u.role === 'trader');
  const pendingUsers = mockUsers.filter(u => u.status === 'pending');
  const todayTransactions = mockTransactions.filter(t => t.date === '2026-01-20');
  const pendingBillings = mockTransactions.filter(t => t.paymentStatus === 'pending');
  
  const todayVolume = todayTransactions.reduce((sum, t) => sum + t.quantity, 0);
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.grossAmount, 0);
  const pendingAmount = pendingBillings.reduce((sum, t) => sum + t.grossAmount, 0);
  
  return {
    totalFarmers: farmers.length,
    activeFarmers: farmers.filter(f => f.status === 'active').length,
    totalTraders: traders.length,
    activeTraders: traders.filter(t => t.status === 'active').length,
    todayVolume,
    todayRevenue,
    todayTransactions: todayTransactions.length,
    pendingVerifications: pendingUsers.length,
    pendingBillings: pendingBillings.length,
    pendingAmount,
    totalCommissionCollected: mockTransactions.reduce((sum, t) => sum + t.farmerCommission + t.traderCommission, 0)
  };
};

// Top commodities
export const topCommodities = [
  { name: 'Tomatoes', volume: 2500, avgPrice: 45, trend: 'up' },
  { name: 'Onions', volume: 2200, avgPrice: 28, trend: 'down' },
  { name: 'Potatoes', volume: 1800, avgPrice: 22, trend: 'stable' },
  { name: 'Cabbage', volume: 1200, avgPrice: 15, trend: 'up' },
  { name: 'Cauliflower', volume: 900, avgPrice: 40, trend: 'up' }
];

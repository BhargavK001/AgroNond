import { Link } from 'react-router-dom';
import { transactionsData, calculateSummary } from './data';
import OverviewStats from './components/OverviewStats';
import TransactionsView from './components/TransactionsView';

export default function AccountingDashboard() {
  const summary = calculateSummary(transactionsData);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Accounting Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <OverviewStats summary={summary} />

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
          <Link
            to="/dashboard/accounting/transactions"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            View All &rarr;
          </Link>
        </div>
        <TransactionsView transactions={transactionsData.slice(0, 5)} />
      </div>
    </div>
  );
}

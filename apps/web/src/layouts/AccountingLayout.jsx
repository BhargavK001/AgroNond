import { Outlet } from 'react-router-dom';
import AccountingNavbar from '../components/AccountingNavbar';

export default function AccountingLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/40">
      <AccountingNavbar />

      {/* Main Content */}
      <main className="pt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

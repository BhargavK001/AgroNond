import { Outlet } from 'react-router-dom';
import CommitteeNavbar from '../components/CommitteeNavbar';

export default function CommitteeLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <CommitteeNavbar />

      {/* Main Content - No page transition animations to prevent remounting */}
      <main className="pt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

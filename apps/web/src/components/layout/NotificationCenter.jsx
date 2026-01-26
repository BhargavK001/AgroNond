import { useState, useRef, useEffect } from "react";

const notifications = [
  { id: 1, title: 'Payment Received', desc: '₹45,000 received from Trader A', time: '2 mins ago', type: 'success' },
  { id: 2, title: 'New Market Rate', desc: 'Tomato prices up by 5%', time: '1 hr ago', type: 'info' },
  { id: 3, title: 'Gate Pass Expiring', desc: 'Renew your pass before tomorrow', time: '5 hrs ago', type: 'warning' },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-[var(--surface-muted)] transition-colors focus:outline-none group"
      >
        <svg className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[360px] rounded-2xl shadow-xl border border-[var(--border)] bg-white/95 backdrop-blur-sm z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full px-5 py-3 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-50)] gap-4 rounded-t-2xl">
            <h4 className="font-bold text-[var(--text-primary)] text-lg">Notifications</h4>
            <span className="h-6 px-2 text-xs font-semibold text-white bg-[var(--primary)] rounded-full flex items-center">3 New</span>
          </div>

          <div className="max-h-[300px] overflow-y-auto px-2 py-2">
            <div className="flex flex-col gap-1">
              {notifications.map((n) => (
                <button key={n.id} className="w-full text-left py-2 px-3 hover:bg-[var(--surface-muted)] rounded-xl transition-colors group flex gap-3 items-start">
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{n.title}</span>
                    <span className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{n.desc}</span>
                    <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{n.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-2 border-t border-[var(--border)] rounded-b-2xl">
            <button className="w-full py-1.5 text-xs text-[var(--primary)] font-medium hover:bg-[var(--primary-50)] rounded-lg transition-colors">
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

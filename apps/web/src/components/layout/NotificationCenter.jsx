import { useState, useRef, useEffect } from "react";
import { useNotification } from "../../context/NotificationContext";
import { formatDistanceToNow } from 'date-fns';

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
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

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      markAsRead(n._id);
    }
    // Navigate if needed, e.g. navigate(`/records/${n.data.recordId}`)
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-[var(--surface-muted)] transition-colors focus:outline-none group"
      >
        <svg className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[360px] rounded-2xl shadow-xl border border-[var(--border)] bg-white/95 backdrop-blur-sm z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full px-5 py-3 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-50)] gap-4 rounded-t-2xl">
            <h4 className="font-bold text-[var(--text-primary)] text-lg">Notifications</h4>
            {unreadCount > 0 && (
              <span className="h-6 px-2 text-xs font-semibold text-white bg-[var(--primary)] rounded-full flex items-center">{unreadCount} New</span>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto px-2 py-2">
            <div className="flex flex-col gap-1">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-[var(--text-muted)]">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left py-2 px-3 hover:bg-[var(--surface-muted)] rounded-xl transition-colors group flex gap-3 items-start ${n.isRead ? 'opacity-60' : ''}`}
                  >
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-yellow-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{n.title}</span>
                      <span className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{n.message}</span>
                      <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="p-2 border-t border-[var(--border)] rounded-b-2xl">
            <button
              onClick={markAllAsRead}
              className="w-full py-1.5 text-xs text-[var(--primary)] font-medium hover:bg-[var(--primary-50)] rounded-lg transition-colors"
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { Popover, PopoverTrigger, PopoverContent, Button, Listbox, ListboxItem, Chip } from "@heroui/react";
import { useState } from "react";

const notifications = [
  { id: 1, title: 'Payment Received', desc: '₹45,000 received from Trader A', time: '2 mins ago', type: 'success' },
  { id: 2, title: 'New Market Rate', desc: 'Tomato prices up by 5%', time: '1 hr ago', type: 'info' },
  { id: 3, title: 'Gate Pass Expiring', desc: 'Renew your pass before tomorrow', time: '5 hrs ago', type: 'warning' },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover placement="bottom-end" isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <PopoverTrigger>
        <button className="relative p-2 rounded-full hover:bg-[var(--surface-muted)] transition-colors focus:outline-none group">
          <svg className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0 rounded-2xl shadow-xl border border-[var(--border)] bg-white/95 backdrop-blur-sm">
         <div className="w-full px-5 py-3 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-50)] gap-4">
             <h4 className="font-bold text-[var(--text-primary)] text-large">Notifications</h4>
             <Chip size="sm" color="primary" variant="flat" className="h-6 px-1">3 New</Chip>
         </div>
         <div className="max-h-[300px] overflow-y-auto px-2 py-2">
           <Listbox aria-label="Notifications" variant="flat" className="gap-0">
             {notifications.map((n) => (
                <ListboxItem key={n.id} className="py-2 px-3 data-[hover=true]:bg-[var(--surface-muted)] rounded-xl" textValue={n.title}>
                   <div className="flex gap-3 items-start">
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                          n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex flex-col gap-0.5">
                         <span className="text-sm font-semibold text-[var(--text-primary)]">{n.title}</span>
                         <span className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{n.desc}</span>
                         <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{n.time}</span>
                      </div>
                   </div>
                </ListboxItem>
             ))}
           </Listbox>
         </div>
         <div className="p-2 border-t border-[var(--border)]">
            <Button size="sm" variant="light" className="w-full text-xs text-[var(--primary)] font-medium">
                Mark all as read
            </Button>
         </div>
      </PopoverContent>
    </Popover>
  );
}

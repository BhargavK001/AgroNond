import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, title, value, subtitle, trend, trendValue }) {
  // Enforce minimal single-color theme (Emerald & Slate)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} // Reduced motion for smoothness
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }} // Smoother ease
      className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-lg bg-emerald-50">
          <Icon className="w-6 h-6 text-emerald-600" />
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-slate-500'
            }`}>
            <span>{trend === 'up' ? '↑' : '↓'}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1 text-slate-800">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

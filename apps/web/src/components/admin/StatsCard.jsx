import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, title, value, subtitle, trend, trendValue, color = 'emerald' }) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'bg-emerald-500',
      text: 'text-emerald-600'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-500',
      text: 'text-blue-600'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'bg-amber-500',
      text: 'text-amber-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-500',
      text: 'text-purple-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-red-500',
      text: 'text-red-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            <span>{trend === 'up' ? '↑' : '↓'}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${colors.text}`}>{value}</p>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

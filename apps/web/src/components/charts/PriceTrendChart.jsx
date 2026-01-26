import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { day: 'Mon', price: 38 },
  { day: 'Tue', price: 42 },
  { day: 'Wed', price: 45 },
  { day: 'Thu', price: 40 },
  { day: 'Fri', price: 48 },
  { day: 'Sat', price: 52 },
  { day: 'Sun', price: 50 },
];

export default function PriceTrendChart() {
  return (
    <div className="w-full h-full min-h-[300px] border border-[var(--border)] shadow-sm bg-white/80 backdrop-blur-xl rounded-2xl flex flex-col">
      <div className="p-5 pb-0 flex gap-3">
        <div className="flex flex-col">
          <p className="text-md font-bold text-[var(--text-primary)]">Market Price Trends</p>
          <p className="text-small text-[var(--text-muted)]">Average price per kg (Tomato)</p>
        </div>
      </div>
      <div className="overflow-hidden p-5 pt-4 flex-grow">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                formatter={(value) => [`₹${value}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="var(--primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

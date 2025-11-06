import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

const data = [
  { name: '1k', value: 25000 },
  { name: '5k', value: 32000 },
  { name: '10k', value: 45000 },
  { name: '15k', value: 38000 },
  { name: '20k', value: 52000 },
  { name: '25k', value: 64364.77 },
  { name: '30k', value: 48000 },
  { name: '35k', value: 58000 },
  { name: '40k', value: 68000 },
  { name: '45k', value: 75000 },
  { name: '50k', value: 70000 },
  { name: '55k', value: 78000 },
  { name: '60k', value: 82000 },
];

interface TooltipPayload {
  value: number;
  name: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-semibold">
        ${payload[0].value.toLocaleString()}
      </div>
    );
  }
  return null;
};

const SalesChart = () => {
  return (
    <div className="relative h-full bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-4 lg:p-6 border border-gray-100 overflow-hidden animate-slide-up flex flex-col">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 via-purple-50 to-transparent rounded-full -mr-32 -mt-32 opacity-30"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Sales Details
            </h2>
            <p className="text-xs text-gray-500 mt-1">Monthly revenue overview</p>
          </div>
          <button className="group flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-200 shadow-sm hover:shadow w-full sm:w-auto">
            <span>October</span>
            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        <div className="flex-1 bg-white/50 rounded-xl p-3 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3B82F6" floodOpacity="0.3"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} opacity={0.5} />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '11px', fill: '#6B7280', fontWeight: '500' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '11px', fill: '#6B7280', fontWeight: '500' }}
                ticks={[20000, 40000, 60000, 80000, 100000]}
                domain={[0, 100000]}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={3}
                fill="url(#colorValue)"
                dot={false}
                activeDot={{ 
                  r: 8, 
                  fill: '#3B82F6', 
                  stroke: '#fff', 
                  strokeWidth: 3,
                  filter: 'url(#shadow)'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
import React from 'react';

export interface StatItem {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}

interface StatCardsProps {
  stats?: StatItem[];
}

const defaultStats: StatItem[] = [
  {
    title: 'Total Vendors',
    value: '186',
    change: '+15 this month',
    isPositive: true,
  },
  {
    title: 'Active Vendors',
    value: '148',
    change: '+12 active',
    isPositive: true,
  },
  {
    title: 'Active Subscriptions',
    value: '132',
    change: '95% retention',
    isPositive: true,
  },
  {
    title: 'Total Revenue',
    value: '$24,850',
    change: '+18.4% growth',
    isPositive: true,
  },
];

export function StatCards({ stats = defaultStats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {stat.title}
            </h3>
            <div className="text-2xl font-black text-[#1f114a] mt-1 tracking-tight">
              {stat.value}
            </div>
          </div>

          {stat.change && (
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className={`font-medium ${stat.isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stat.change}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default StatCards;

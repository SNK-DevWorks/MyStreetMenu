import React from 'react';

export interface ActivityItem {
  text: string;
}

const defaultActivities: ActivityItem[] = [
  { text: 'Burger Corner created a menu' },
  { text: 'Tea Time updated shop details' },
  { text: 'Roll House generated a QR code' },
  { text: 'Pizza Hub signed up' },
];

export function RecentActivity({ activities = defaultActivities }: { activities?: ActivityItem[] }) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#1f114a] mb-4">Recent Activity</h2>

        <ul className="space-y-3 text-xs text-gray-700">
          {activities.map((act, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="text-gray-400 font-bold text-sm leading-none select-none">•</span>
              <span className="font-medium text-gray-700 leading-snug">{act.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RecentActivity;

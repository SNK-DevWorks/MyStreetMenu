import React from 'react';

export interface SubscriptionOverviewItem {
  title: string;
  value: string | number;
  emoji: string;
}

const defaultCards: SubscriptionOverviewItem[] = [
  {
    title: 'Total Subscriptions',
    value: '128',
    emoji: '💳',
  },
  {
    title: 'Active Plans',
    value: '115',
    emoji: '🟢',
  },
  {
    title: 'Expiring Soon',
    value: '8',
    emoji: '⏳',
  },
  {
    title: 'Monthly Revenue',
    value: '₹12,400',
    emoji: '💰',
  },
];

interface SubscriptionOverviewCardsProps {
  cards?: SubscriptionOverviewItem[];
}

export function SubscriptionOverviewCards({
  cards = defaultCards,
}: SubscriptionOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
              {card.title}
            </span>
            <span className="text-xl leading-none select-none">{card.emoji}</span>
          </div>

          <div className="text-2xl font-black text-[#1f114a] tracking-tight">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SubscriptionOverviewCards;

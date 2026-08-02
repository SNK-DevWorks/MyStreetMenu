'use server';

import { analyticsService } from '@/services';
import { getVendorDashboardData } from '@/queries';
import { getCurrentUserId } from '@/lib/auth/get-user';

export type DashboardAnalytics = {
  today: {
    menuViews: number;
    uniqueVisitors: number;
    qrScans: number;
    shareClicks: number;
    likeClicks: number;
    whatsappClicks: number;
    directionClicks: number;
  };
  yesterday: {
    menuViews: number;
    uniqueVisitors: number;
    qrScans: number;
    shareClicks: number;
    likeClicks: number;
    whatsappClicks: number;
    directionClicks: number;
  };
  topItems: {
    itemId: string;
    itemName: string;
    views: number;
    uniqueViews: number;
    likes: number;
    shares: number;
    clicks: number;
    trendScore: number;
  }[];
};

const EMPTY_DAY = {
  menuViews: 0, uniqueVisitors: 0, qrScans: 0,
  shareClicks: 0, likeClicks: 0, whatsappClicks: 0, directionClicks: 0,
};

export async function getDashboardAnalyticsAction(): Promise<DashboardAnalytics> {
  let userId: string;
  try {
    userId = await getCurrentUserId();
  } catch {
    return { today: EMPTY_DAY, yesterday: EMPTY_DAY, topItems: [] };
  }

  const shop = await getVendorDashboardData(userId);
  if (!shop) {
    return { today: EMPTY_DAY, yesterday: EMPTY_DAY, topItems: [] };
  }

  const [stats, topItems] = await Promise.all([
    analyticsService.getDashboardStats(shop.id),
    analyticsService.getTrendingItems(shop.id, 3),
  ]);

  return {
    today:     stats.today,
    yesterday: stats.yesterday,
    topItems:  topItems.map(item => ({
      itemId:      item.itemId,
      itemName:    item.itemName,
      views:       item.views,
      uniqueViews: item.uniqueViews,
      likes:       item.likes,
      shares:      item.shares,
      clicks:      item.clicks,
      trendScore:  Number(item.trendScore ?? 0),
    })),
  };
}

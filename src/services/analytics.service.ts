import { analyticsRepository } from '@/repositories';
import { getShopEventCounts, getShopDailyTrend } from '@/queries';
import type { NewAnalyticsEvent } from '../../drizzle/schema/analytics-events';

export const analyticsService = {
  /**
   * Track an analytics event.
   */
  async trackEvent(data: Omit<NewAnalyticsEvent, 'id'>) {
    return analyticsRepository.recordEvent(data);
  },

  /**
   * Get dashboard stats for a shop (aggregated event counts).
   */
  async getDashboardStats(shopId: string) {
    const counts = await getShopEventCounts(shopId);

    const statsMap: Record<string, number> = {};
    for (const row of counts) {
      statsMap[row.eventType] = row.count;
    }

    return {
      menuViews: statsMap['menu_view'] ?? 0,
      qrScans: statsMap['qr_scan'] ?? 0,
      itemViews: statsMap['item_view'] ?? 0,
      shareClicks: statsMap['share_click'] ?? 0,
      directionClicks: statsMap['direction_click'] ?? 0,
      whatsappClicks: statsMap['whatsapp_click'] ?? 0,
    };
  },

  /**
   * Get daily trend data for charts.
   */
  async getShopTrend(shopId: string, days: number = 30) {
    return getShopDailyTrend(shopId, days);
  },
};

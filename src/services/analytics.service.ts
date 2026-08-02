import { analyticsRepository, type BatchEvent } from '@/repositories';
import { getDailyShopStats, getShopStatsByDates, getShopStatsForMonth, getDailyItemStats, getTrendingItems } from '@/queries';
import type { NewAnalyticsEvent } from '../../drizzle/schema/analytics-events';

export const analyticsService = {
  /**
   * Track a single analytics event (server-side only, e.g. from Server Actions).
   */
  async trackEvent(data: Omit<NewAnalyticsEvent, 'id'>) {
    return analyticsRepository.recordEvent(data);
  },

  /**
   * Process a full browser-batched flush:
   *  - Bulk insert raw events
   *  - Track unique visitors via daily_unique_visitors junction table
   *  - Upsert daily_shop_stats and daily_item_stats aggregate counters
   */
  async processBatch(events: BatchEvent[], today: string) {
    return analyticsRepository.processBatch(events, today);
  },

  /**
   * Dashboard stats — reads from aggregate tables (single-row reads, instant).
   * Returns today's and yesterday's stats for delta calculation.
   */
  async getDashboardStats(shopId: string) {
    const today     = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    const [rows, monthRow] = await Promise.all([
      getShopStatsByDates(shopId, [today, yesterday]),
      getShopStatsForMonth(shopId),
    ]);

    const todayRow     = rows.find(r => r.date === today);
    const yesterdayRow = rows.find(r => r.date === yesterday);

    const toNum = (v: number | null | undefined) => Number(v ?? 0);

    return {
      today: {
        menuViews:       toNum(todayRow?.menuViews),
        uniqueVisitors:  toNum(todayRow?.uniqueVisitors),
        qrScans:         toNum(todayRow?.qrScans),
        shareClicks:     toNum(todayRow?.shareClicks),
        likeClicks:      toNum(todayRow?.likeClicks),
        whatsappClicks:  toNum(todayRow?.whatsappClicks),
        directionClicks: toNum(todayRow?.directionClicks),
      },
      yesterday: {
        menuViews:       toNum(yesterdayRow?.menuViews),
        uniqueVisitors:  toNum(yesterdayRow?.uniqueVisitors),
        qrScans:         toNum(yesterdayRow?.qrScans),
        shareClicks:     toNum(yesterdayRow?.shareClicks),
        likeClicks:      toNum(yesterdayRow?.likeClicks),
        whatsappClicks:  toNum(yesterdayRow?.whatsappClicks),
        directionClicks: toNum(yesterdayRow?.directionClicks),
      },
      thisMonth: {
        menuViews:       toNum(monthRow?.menuViews),
        uniqueVisitors:  toNum(monthRow?.uniqueVisitors),
        qrScans:         toNum(monthRow?.qrScans),
        shareClicks:     toNum(monthRow?.shareClicks),
        likeClicks:      toNum(monthRow?.likeClicks),
        whatsappClicks:  toNum(monthRow?.whatsappClicks),
        directionClicks: toNum(monthRow?.directionClicks),
      },
    };
  },

  /**
   * Weekly trend data (last 7 or 30 days) for line charts.
   */
  async getShopTrend(shopId: string, days: number = 7) {
    return getDailyShopStats(shopId, days);
  },

  /**
   * Per-item stats for today, joined with item names.
   * Items ordered by computed trend score DESC.
   */
  async getItemStats(shopId: string, limit = 20) {
    const today = new Date().toISOString().slice(0, 10);
    return getDailyItemStats(shopId, today, limit);
  },

  /**
   * Top trending items for today (views×0.5 + likes×3 + shares×4).
   */
  async getTrendingItems(shopId: string, limit = 10) {
    return getTrendingItems(shopId, limit);
  },
};

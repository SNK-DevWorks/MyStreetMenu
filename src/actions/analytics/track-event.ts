'use server';

import { analyticsService } from '@/services';
import type { ActionResponse } from '@/types/action-response';

type EventType = 'menu_view' | 'qr_scan' | 'item_view' | 'share_click' | 'direction_click' | 'whatsapp_click';

export async function trackEventAction(
  shopId: string,
  eventType: EventType,
  sessionId?: string,
  metadata?: Record<string, unknown>
): Promise<ActionResponse> {
  if (!shopId || !eventType) {
    return { success: false, error: 'Shop ID and event type are required' };
  }

  try {
    await analyticsService.trackEvent({
      shopId,
      eventType,
      sessionId: sessionId ?? null,
      metadata: metadata ?? null,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to track event' };
  }
}

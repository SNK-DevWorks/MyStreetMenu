'use server';

import { createClient } from '@/lib/supabase/server';
import { authService } from '@/services';
import { shopService } from '@/services';
import { resolveLocationInput } from '@/lib/resolve-maps';
import type { ActionResponse } from '@/types/action-response';

interface CompleteOnboardingInput {
  shopName: string;
  category: string;
  phone: string;
  whatsapp: string;
  location: string;
}

/**
 * Finalises vendor onboarding:
 *  1. Upserts a row in the public `users` table (linked to Supabase auth.users.id)
 *  2. Creates a row in the `shops` table for the vendor
 *  3. Updates Supabase auth metadata (onboarding_completed flag)
 *
 * Idempotent — safe to call more than once; existing records are not duplicated.
 */
export async function completeOnboardingAction(
  input: CompleteOnboardingInput
): Promise<ActionResponse<{ shopId: string }>> {
  const supabase = await createClient();

  // ── 1. Verify the user is authenticated ──────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated. Please log in again.' };
  }

  const userId = user.id;
  const userEmail = user.email || (user.user_metadata?.email as string) || undefined;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    input.shopName ||
    'Vendor';

  try {
    // ── 2. Upsert public `users` row ────────────────────────────────────────
    // authService.signup throws if the user already exists, so we check first.
    let dbUser = await authService.getCurrentUser(userId).catch(() => null);

    if (!dbUser) {
      dbUser = await authService.signup({
        id: userId,
        name: displayName,
        email: userEmail,
        phone: input.phone || undefined,
      });
    } else {
      // Update phone and email if updated/missing
      const updateData: Record<string, string> = {};
      if (input.phone && dbUser.phone !== input.phone) updateData.phone = input.phone;
      if (userEmail && dbUser.email !== userEmail) updateData.email = userEmail;

      if (Object.keys(updateData).length > 0) {
        dbUser = await authService.updateProfile(userId, updateData);
      }
    }

    // Resolve location (map URL -> human readable address & mapUrl)
    const resolvedLocation = await resolveLocationInput(input.location || '');

    // ── 3. Create / ensure `shops` row exists ───────────────────────────────
    let shop = await shopService.getVendorShop(userId);

    if (!shop) {
      shop = await shopService.createShop(userId, {
        name: input.shopName.trim(),
        foodType: input.category || undefined,
        phone: input.phone || undefined,
        whatsapp: input.whatsapp || undefined,
        address: resolvedLocation.address || undefined,
        mapUrl: resolvedLocation.mapUrl || undefined,
      });
    } else {
      // If shop already exists, ensure address & mapUrl are updated if provided
      shop = await shopService.updateShop(userId, shop.id, {
        name: input.shopName.trim(),
        foodType: input.category || undefined,
        phone: input.phone || undefined,
        whatsapp: input.whatsapp || undefined,
        address: resolvedLocation.address || shop.address || undefined,
        mapUrl: resolvedLocation.mapUrl || shop.mapUrl || undefined,
      });
    }

    // ── 4. Persist onboarding metadata to Supabase Auth ────────────────────
    await supabase.auth.updateUser({
      data: {
        shop_name: input.shopName.trim(),
        category: input.category,
        phone: input.phone,
        whatsapp: input.whatsapp,
        location: resolvedLocation.address || input.location,
        address: resolvedLocation.address || input.location,
        map_url: resolvedLocation.mapUrl,
        onboarding_completed: true,
      },
    });

    return { success: true, data: { shopId: shop.id } };
  } catch (error) {
    console.error('[completeOnboardingAction] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.',
    };
  }
}

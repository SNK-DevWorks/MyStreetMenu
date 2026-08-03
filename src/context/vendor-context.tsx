'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getVendorDashboardDataAction } from '@/actions/shop/get-vendor-dashboard-data';
import { getVendorShopAction } from '@/actions/shop/get-vendor-shop';
import { getMenuDataAction } from '@/actions/shop/get-menu-data';
import { getAllPromotionsByTypeAction } from '@/actions/promotion/get-promotions';
import { createClient } from '@/lib/supabase/client';
import type { Shop } from '../../drizzle/schema/shops';
import type { Category } from '../../drizzle/schema/categories';
import type { Promotion } from '../../drizzle/schema/promotions';
import type { MenuItemWithCategory } from '@/actions/shop/get-menu-data';

interface VendorContextType {
  shop: Shop | null;
  vendorName: string;
  vendorLocation: string;
  rawLocation: string;
  publicMenuUrl: string;
  loading: boolean;
  refetchShop: () => Promise<void>;
  // Shared Menu State
  categories: Category[];
  dbItems: MenuItemWithCategory[];
  menuLoading: boolean;
  refetchMenu: () => Promise<void>;
  // Shared Promotions State
  offers: Promotion[];
  announcements: Promotion[];
  promotionsLoading: boolean;
  refetchPromotions: () => Promise<void>;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [vendorName, setVendorName] = useState<string>('');
  const [vendorLocation, setVendorLocation] = useState<string>('');
  const [rawLocation, setRawLocation] = useState<string>('');
  const [publicMenuUrl, setPublicMenuUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  // Tracks whether the very first load attempt has completed (success OR failure)
  const [bootstrapDone, setBootstrapDone] = useState<boolean>(false);

  // Menu State
  const [categories, setCategories] = useState<Category[]>([]);
  const [dbItems, setDbItems] = useState<MenuItemWithCategory[]>([]);
  const [menuLoading, setMenuLoading] = useState<boolean>(true);

  // Promotions State
  const [offers, setOffers] = useState<Promotion[]>([]);
  const [announcements, setAnnouncements] = useState<Promotion[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState<boolean>(true);

  // Consolidated Initial Load (1 single HTTP POST request instead of 4 separate calls)
  const fetchAllVendorData = useCallback(async () => {
    setLoading(true);
    setMenuLoading(true);
    setPromotionsLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await getVendorDashboardDataAction();

      if (res.success && res.data) {
        const { shop: shopData, categories: cats, dbItems: items, offers: offerList, announcements: annList } = res.data;
        setShop(shopData);
        setVendorName(shopData.name || 'Your Shop');
        setVendorLocation(shopData.address || '');
        setRawLocation(shopData.mapUrl || shopData.address || '');

        if (shopData.slug) {
          setPublicMenuUrl(`${origin}/menu/${shopData.slug}`);
        } else {
          setPublicMenuUrl(`${origin}/menu/my-street-menu-demo`);
        }

        setCategories(cats);
        setDbItems(items);
        setOffers(offerList);
        setAnnouncements(annList);
      } else {
        // API returned an error response — try to hydrate display-only info from
        // the Supabase auth session so the header/name still renders. The shop
        // will be null (no DB row), so menu management will show an empty state
        // instead of a skeleton that never resolves.
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const name =
              user.user_metadata?.shop_name ||
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'Your Shop';
            const raw =
              user.user_metadata?.address ||
              user.user_metadata?.location ||
              user.user_metadata?.shop_address ||
              '';
            const slug = user.user_metadata?.slug || 'my-street-menu-demo';

            setVendorName(name);
            setRawLocation(raw);
            setVendorLocation(user.user_metadata?.address || raw);
            setPublicMenuUrl(`${origin}/menu/${slug}`);
          } else {
            setPublicMenuUrl(`${origin}/menu/my-street-menu-demo`);
          }
        } catch (authErr) {
          console.error('Failed to get fallback user info:', authErr);
          setPublicMenuUrl(`${origin}/menu/my-street-menu-demo`);
        }
      }
    } catch (err) {
      console.error('Failed to load vendor context:', err);
    } finally {
      setLoading(false);
      setMenuLoading(false);
      setPromotionsLoading(false);
      // Always mark bootstrap as done so consumers never stay stuck in skeleton
      setBootstrapDone(true);
    }
  }, []);

  useEffect(() => {
    fetchAllVendorData();
  }, [fetchAllVendorData]);

  const refetchShop = useCallback(async () => {
    const res = await getVendorShopAction();
    if (res.success && res.data) {
      setShop(res.data);
      setVendorName(res.data.name || 'Your Shop');
      setVendorLocation(res.data.address || '');
      setRawLocation(res.data.mapUrl || res.data.address || '');
    }
  }, []);

  const refetchMenu = useCallback(async () => {
    if (shop?.id) {
      const menuRes = await getMenuDataAction(shop.id);
      if (menuRes.success && menuRes.data) {
        setCategories(menuRes.data.categories);
        setDbItems(menuRes.data.items);
      }
    }
  }, [shop?.id]);

  const refetchPromotions = useCallback(async () => {
    const [offersRes, announcementsRes] = await Promise.all([
      getAllPromotionsByTypeAction('offer'),
      getAllPromotionsByTypeAction('announcement'),
    ]);
    if (offersRes.success && offersRes.data) setOffers(offersRes.data);
    if (announcementsRes.success && announcementsRes.data) setAnnouncements(announcementsRes.data);
  }, []);

  return (
    <VendorContext.Provider
      value={{
        shop,
        vendorName,
        vendorLocation,
        rawLocation,
        publicMenuUrl,
        loading,
        refetchShop,
        categories,
        dbItems,
        // menuLoading is false once the first fetch attempt finishes (success or fail)
        menuLoading: menuLoading && !bootstrapDone,
        refetchMenu,
        offers,
        announcements,
        promotionsLoading,
        refetchPromotions,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};

export const useVendor = () => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
};

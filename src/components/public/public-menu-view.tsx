'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import { FoodTypeIcon } from './menu/ui/food-type-icon';
import { useCart } from './menu/hooks/use-cart';
import { useSearch } from './menu/hooks/use-search';
import { useFavorites } from './menu/hooks/use-favorites';
import { useVoiceSearch } from './menu/hooks/use-voice-search';
import { useMenuFilter } from './menu/hooks/use-menu-filter';
import { MobileHeader } from './menu/layout/mobile-header';
import { DesktopSidebar } from './menu/layout/desktop-sidebar';
import { CategoryTabs } from './menu/layout/category-tabs';
import { FloatingCartBar } from './menu/layout/floating-cart-bar';
import { ItemCard } from './menu/cards/item-card';
import { OfferCarousel } from './menu/carousel/offer-carousel';
import { TodaysSpecialCarousel } from './menu/carousel/todays-special-carousel';
import { ItemDetailSheet } from './menu/overlays/item-detail-sheet';
import { AllSpecialsOverlay } from './menu/overlays/all-specials-overlay';
import { CartSheet } from './menu/overlays/cart-sheet';
import { useAnalytics } from '@/providers/analytics-provider';
import { createCustomerOrderRealtime } from '@/lib/orders/realtime';
import { getCustomerOrderStatusesAction } from '@/actions/order/get-order-status';
import { ensureAnonymousSession } from '@/lib/supabase/customer';
import type { AnnouncementItem, PublicOfferItem, PublicMenuViewProps, ActiveOrder } from './menu/types';
import type { FoodCardItem } from '@/components/shared/item';

// Re-export types for external consumers
export type { AnnouncementItem, PublicOfferItem };

export default function PublicMenuView({
  vendorName = 'Crispy Bites',
  vendorAddress = 'Hatiara, Rajarhat, Kolkata',
  phone = null,
  whatsapp = null,
  mapUrl = null,
  shopId,
  shopSlug,
  items = [],
  categories = ['All Items'],
  offers = [],
  announcements = [],
}: PublicMenuViewProps & { shopId?: string; shopSlug?: string }) {
  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { track } = useAnalytics();
  const search = useSearch();
  const cart = useCart(items);
  const favorites = useFavorites();
  const voice = useVoiceSearch();
  const filter = useMenuFilter(items, categories, search.searchQuery);

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [selectedItem, setSelectedItem] = useState<FoodCardItem | null>(null);
  const [showAllSpecials, setShowAllSpecials] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [ordersList, setOrdersList] = useState<ActiveOrder[]>([]);
  const [customerUserId, setCustomerUserId] = useState<string | null>(null);

  // Single Realtime manager instance (persisted across re-renders)
  const realtimeManagerRef = useRef(createCustomerOrderRealtime());

  const storageKey = `msm_active_orders_${shopId || 'default'}`;

  // ── Celebratory "Your Order is Ready!" Chime Sound + Vibration + Tab Alert ─
  const triggerReadyAlert = useCallback((token?: string) => {
    // 1. Celebratory Chime Sound
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);
        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + index * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.5);
      });
    } catch {
      // Audio autoplay restrictions
    }

    // 2. Strong Multi-Pulse Vibration Pattern (3 distinctive buzzes, only when user has interacted with frame)
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function' &&
      (typeof (navigator as unknown as { userActivation?: { hasBeenActive?: boolean } }).userActivation === 'undefined' ||
        (navigator as unknown as { userActivation?: { hasBeenActive?: boolean } }).userActivation?.hasBeenActive)
    ) {
      try {
        navigator.vibrate([300, 100, 300, 100, 500]);
      } catch {}
    }


    // 3. Flash Browser Tab Title
    if (typeof document !== 'undefined') {
      const originalTitle = document.title;
      let count = 0;
      const iv = setInterval(() => {
        document.title = count % 2 === 0 ? `🔔 🎉 Order Ready! ${token ? `#${token}` : ''}` : originalTitle;
        if (++count >= 12) {
          clearInterval(iv);
          document.title = originalTitle;
        }
      }, 600);
    }
  }, []);

  // Keep a fresh ref to ordersList for use in async callbacks and timer intervals
  const ordersListRef = useRef(ordersList);
  useEffect(() => {
    ordersListRef.current = ordersList;
  }, [ordersList]);

  // ── Helper to verify and sync live order statuses from DB ───────────────────
  // Used on mount, on Realtime reconnect, and during active order tracking.
  const verifyOrderStatuses = useCallback(async (currentOrders: ActiveOrder[]) => {
    const orderIds = currentOrders.map((o) => o.orderId).filter(Boolean) as string[];
    if (orderIds.length === 0) return;

    try {
      const res = await getCustomerOrderStatusesAction(orderIds);
      if (res.success && res.data && res.data.length > 0) {
        const statusMap = new Map(res.data.map((item) => [item.id, item.status]));

        // Check if anything actually changed before triggering React state updates
        const currentList = ordersListRef.current;
        const hasChanges = currentList.some((o) => {
          if (!o.orderId) return false;
          const newStatus = statusMap.get(o.orderId);
          return newStatus && newStatus !== o.status;
        });

        if (!hasChanges) return;

        // Detect if any order just transitioned to ready
        const justReadyOrder = currentList.find(
          (o) => o.orderId && statusMap.get(o.orderId) === 'ready' && o.status !== 'ready',
        );
        if (justReadyOrder) triggerReadyAlert(justReadyOrder.tokenNumber);

        // Update orders list
        const updated = currentList
          .map((o) => {
            const dbStatus = o.orderId ? statusMap.get(o.orderId) : undefined;
            return dbStatus ? { ...o, status: dbStatus } : o;
          })
          .filter((o) => o.status !== 'completed' && o.status !== 'cancelled');

        setOrdersList(updated);
        try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}

        setActiveOrder((prev) => {
          if (!prev?.orderId) return prev;
          const dbStatus = statusMap.get(prev.orderId);
          if (dbStatus === 'completed' || dbStatus === 'cancelled') return null;
          return dbStatus ? { ...prev, status: dbStatus } : prev;
        });
      }
    } catch {
      // Ignore errors — Realtime will deliver the next update
    }
  }, [storageKey, triggerReadyAlert]);

  // ── 1. Ensure anonymous Supabase session on mount ────────────────────────
  useEffect(() => {
    ensureAnonymousSession().then((uid) => {
      if (uid) setCustomerUserId(uid);
    });
  }, []);

  // ── 2. Restore placed active orders from localStorage on mount & verify ───
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: ActiveOrder[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const activeOnly = parsed.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
          setOrdersList(activeOnly);
          setActiveOrder(activeOnly.length > 0 ? activeOnly[activeOnly.length - 1] : null);
          // Verify with database on mount
          verifyOrderStatuses(activeOnly);
        }
      }
    } catch {
      // Ignored if storage is blocked
    }
  }, [storageKey, verifyOrderStatuses]);

  // ── 3. Smart Background Status Check (every 4 seconds for active orders) ──
  // Dual-channel sync: Instant Realtime WebSocket + smart fallback check
  useEffect(() => {
    if (ordersList.length === 0) return;

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        verifyOrderStatuses(ordersListRef.current);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [ordersList.length, verifyOrderStatuses]);

  // Helper to persist orders state
  const saveOrders = (orders: ActiveOrder[]) => {
    // Keep active orders
    const activeOnly = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    setOrdersList(activeOnly);
    setActiveOrder(activeOnly.length > 0 ? activeOnly[activeOnly.length - 1] : null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(activeOnly));
      } catch {}
    }
  };

  // Derive ordered cart items from itemQuantities for CartSheet
  const cartItems = Object.entries(cart.itemQuantities)
    .filter(([, qty]) => qty > 0)
    .map(([itemId, quantity]) => {
      const item = items.find(i => i.id === itemId);
      return item ? { item, quantity } : null;
    })
    .filter((x): x is { item: FoodCardItem; quantity: number } => x !== null);

  // ── Analytics ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrId = params.get('qr');
    if (qrId) {
      track('qr_scan', {
        qrId,
        source: params.get('src') ?? 'direct',
        tableNo: params.get('table') ?? null,
        campaign: params.get('campaign') ?? null,
      });
    }
    track('menu_view');
  }, [track]);

  // ── Customer Realtime — single channel for all active orders ─────────────
  useEffect(() => {
    const orderIds = ordersList.map((o) => o.orderId).filter(Boolean) as string[];
    const rt = realtimeManagerRef.current;

    if (orderIds.length === 0) {
      rt.unsubscribe();
      return;
    }

    rt.subscribe(orderIds, {
      onUpdate: (payload) => {
        const { id, status, token } = payload;

        if (status === 'completed' || status === 'cancelled') {
          // Vendor completed/cancelled → remove from customer view
          const next = ordersListRef.current.filter((o) => o.orderId !== id);
          setOrdersList(next);
          try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
          setActiveOrder((prev) => (prev?.orderId === id ? null : prev));
        } else {
          // preparing or ready → update badge
          if (status === 'ready') triggerReadyAlert(token);
          const next = ordersListRef.current.map((o) => (o.orderId === id ? { ...o, status } : o));
          setOrdersList(next);
          try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
          setActiveOrder((prev) => (prev?.orderId === id ? { ...prev, status } : prev));
        }
      },
      onDelete: (payload) => {
        // Defensive: handle unexpected deletions
        const { id } = payload;
        const next = ordersListRef.current.filter((o) => o.orderId !== id);
        setOrdersList(next);
        try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
        setActiveOrder((prev) => (prev?.orderId === id ? null : prev));
      },
      onReconnect: () => {
        // Channel reconnected — do ONE reconciliation fetch to catch missed events
        verifyOrderStatuses(ordersListRef.current);
      },
    });

    return () => {
      // Do NOT call rt.unsubscribe() here — let the next subscribe() replace the channel.
      // Calling unsubscribe on every ordersList change would drop the channel momentarily.
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersList.map((o) => o.orderId).join(','), storageKey]);


  // Clean up on unmount
  useEffect(() => {
    const rt = realtimeManagerRef.current;
    return () => rt.unsubscribe();
  }, []);

  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleItemClick = (item: FoodCardItem) => {
    track('item_view', { itemId: item.id, itemName: item.title });
    setSelectedItem(item);
  };

  const handleShare = () => {
    track('share_click');
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: vendorName, url: window.location.href }).catch(() => {});
    }
  };

  const handleWhatsApp = () => track('whatsapp_click');
  const handlePhone = () => {};

  // ── Shared diet filter UI ──────────────────────────────────────────────────
  const DietFilterBar = ({ className = '' }: { className?: string }) => {
    if (filter.availableFoodTypes.size <= 1) return null;
    return (
      <div className={`bg-gray-100/90 rounded-full flex p-1 border border-gray-200/50 items-center shrink-0 ${className}`}>
        <button type="button" onClick={() => filter.setDietFilter('all')} className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold transition-all ${filter.dietFilter === 'all' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}>All</button>
        {filter.availableFoodTypes.has('veg') && (
          <button type="button" onClick={() => filter.setDietFilter('veg')} className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold transition-all flex items-center gap-1.5 ${filter.dietFilter === 'veg' ? 'bg-emerald-600 shadow-xs text-white' : 'text-gray-500'}`}>
            <FoodTypeIcon type="veg" showLabel={false} /><span>Veg</span>
          </button>
        )}
        {filter.availableFoodTypes.has('non-veg') && (
          <button type="button" onClick={() => filter.setDietFilter('non-veg')} className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold transition-all flex items-center gap-1.5 ${filter.dietFilter === 'non-veg' ? 'bg-[#8F291D] shadow-xs text-white' : 'text-gray-500'}`}>
            <FoodTypeIcon type="non-veg" showLabel={false} /><span>Non-Veg</span>
          </button>
        )}
        {filter.availableFoodTypes.has('egg') && (
          <button type="button" onClick={() => filter.setDietFilter('egg')} className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold transition-all flex items-center gap-1.5 ${filter.dietFilter === 'egg' ? 'bg-amber-600 shadow-xs text-white' : 'text-gray-500'}`}>
            <FoodTypeIcon type="egg" showLabel={false} /><span>Egg</span>
          </button>
        )}
      </div>
    );
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <div className="text-center py-14 text-gray-400 bg-gray-50/50 rounded-2xl border border-gray-100 my-4">
      <Search size={34} className="mx-auto mb-2 opacity-40 text-gray-400" />
      <p className="font-bold text-sm text-gray-700">No items found</p>
      <p className="text-xs text-gray-400 mt-0.5">Try selecting another category or filter</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans selection:bg-orange-200">
      {/* Global animation keyframes for bottom sheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes zeptoSheetUp { from { transform: translateY(100%); opacity: 0.8; } to { transform: translateY(0); opacity: 1; } }
        @keyframes zeptoSheetDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
        @keyframes zeptoFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zeptoFadeOut { from { opacity: 1; } to { opacity: 0; } }
        .zepto-sheet-in { animation: zeptoSheetUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .zepto-sheet-out { animation: zeptoSheetDown 0.22s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
        .zepto-backdrop-in { animation: zeptoFadeIn 0.25s ease-out forwards; }
        .zepto-backdrop-out { animation: zeptoFadeOut 0.2s ease-in forwards; }
      `}} />

      {/* ── Mobile & Tablet Layout (hidden on lg+) ── */}
      <div className="w-full max-w-full md:max-w-4xl mx-auto bg-[#FDFBF7] min-h-screen relative overflow-hidden flex flex-col shadow-xl lg:hidden">
        <MobileHeader
          vendorName={vendorName}
          vendorAddress={vendorAddress}
          phone={phone}
          whatsapp={whatsapp}
          mapUrl={mapUrl}
          searchQuery={search.searchQuery}
          onSearchChange={search.setSearchQuery}
          onClearSearch={search.clearSearch}
          onVoiceSearch={() => voice.startListening(search.setSearchQuery)}
          isListening={voice.status === 'listening'}
          announcements={announcements}
          onShare={handleShare}
          onWhatsApp={handleWhatsApp}
          onPhone={handlePhone}
        />

        {/* Hero Offer Carousel */}
        {offers.length > 0 && !search.searchQuery && (
          <div className="px-4 sm:px-8 -mt-7 sm:-mt-8 relative z-20 mb-4 max-w-3xl mx-auto w-full">
            <OfferCarousel offers={offers} />
          </div>
        )}

        {/* Today's Special Carousel */}
        {!search.searchQuery && filter.todaysSpecialsList.length > 0 && (
          <div className="w-full max-w-4xl mx-auto">
            <TodaysSpecialCarousel
              items={filter.todaysSpecialsList}
              onItemClick={handleItemClick}
              onLikeClick={favorites.handleLikeClick}
              isLiked={favorites.isLiked}
              getLikeCount={favorites.getLikeCount}
              isLikePending={favorites.isLikePending}
              onViewAllSpecials={() => setShowAllSpecials(true)}
            />
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-6 mt-2 px-5 sm:px-8 max-w-3xl mx-auto w-full">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Categories</h3>
          <CategoryTabs
            categories={filter.categoryList}
            selectedCategory={filter.selectedCategory}
            onSelect={filter.setSelectedCategory}
            className="-mx-5 px-5 sm:mx-0 sm:px-0"
          />
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-t-[32px] sm:rounded-t-[44px] pt-7 pb-20 px-5 sm:px-8 shadow-[0_-8px_24px_rgba(0,0,0,0.03)] relative z-20 flex-1 border-t border-gray-100 min-h-[60vh]">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-start gap-3 mb-6 flex-wrap">
              <DietFilterBar />
            </div>
            {filter.filteredItems.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {filter.filteredItems.map(item => (
                  <ItemCard
                    key={`list-${item.id}`}
                    item={item}
                    quantity={cart.getQuantity(item.id)}
                    onCardClick={handleItemClick}
                    onIncrement={cart.incrementItem}
                    onDecrement={cart.decrementItem}
                    onAddFirst={itemId => { cart.addItem(itemId, 1); track('cart_click'); }}
                    isLiked={favorites.isLiked(item.id)}
                    likeCount={favorites.getLikeCount(item.id)}
                    isLikePending={favorites.isLikePending(item.id)}
                    onLikeClick={favorites.handleLikeClick}
                    variant="mobile"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop Layout (lg+) ── */}
      <div className="hidden lg:flex min-h-screen">
        <DesktopSidebar
          vendorName={vendorName}
          vendorAddress={vendorAddress}
          phone={phone}
          whatsapp={whatsapp}
          searchQuery={search.searchQuery}
          onSearchChange={search.setSearchQuery}
          onClearSearch={search.clearSearch}
          onShare={handleShare}
          onWhatsApp={handleWhatsApp}
          categories={filter.categoryList}
          selectedCategory={filter.selectedCategory}
          onCategorySelect={filter.setSelectedCategory}
          announcements={announcements}
          onCartClick={() => track('cart_click')}
        />

        <main className="flex-1 min-w-0 px-8 xl:px-12 py-8 overflow-y-auto bg-[#FDFBF7] min-h-[70vh]">
          {/* Offer Carousel */}
          {offers.length > 0 && !search.searchQuery && (
            <div className="mb-8 w-full">
              <OfferCarousel offers={offers} />
            </div>
          )}

          {/* Today's Specials */}
          {!search.searchQuery && filter.todaysSpecialsList.length > 0 && (
            <div className="mb-8 w-full">
              <TodaysSpecialCarousel
                items={filter.todaysSpecialsList}
                onItemClick={handleItemClick}
                onLikeClick={favorites.handleLikeClick}
                isLiked={favorites.isLiked}
                getLikeCount={favorites.getLikeCount}
                isLikePending={favorites.isLikePending}
                onViewAllSpecials={() => setShowAllSpecials(true)}
              />
            </div>
          )}

          {/* Category Pills */}
          <div className="mb-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Categories</h3>
            <CategoryTabs
              categories={filter.categoryList}
              selectedCategory={filter.selectedCategory}
              onSelect={filter.setSelectedCategory}
            />
          </div>

          {/* Diet Filter + Section Title */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#FF6B00] tracking-tight">
              {filter.isAllCategory ? '' : filter.selectedCategory}
            </h2>
            <DietFilterBar className="bg-white border border-gray-200 shadow-2xs" />
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filter.filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                quantity={cart.getQuantity(item.id)}
                onCardClick={handleItemClick}
                onIncrement={cart.incrementItem}
                onDecrement={cart.decrementItem}
                onAddFirst={itemId => { cart.addItem(itemId, 1); track('cart_click'); }}
                isLiked={favorites.isLiked(item.id)}
                likeCount={favorites.getLikeCount(item.id)}
                isLikePending={favorites.isLikePending(item.id)}
                onLikeClick={favorites.handleLikeClick}
                variant="desktop"
              />
            ))}
          </div>
        </main>
      </div>

      {/* ── Overlays ── */}
      {selectedItem && (
        <ItemDetailSheet
          item={selectedItem}
          initialQuantity={cart.getQuantity(selectedItem.id) || 1}
          onClose={() => setSelectedItem(null)}
          onAddToCart={(itemId, qty) => { cart.addItem(itemId, qty); track('cart_click'); }}
          isLiked={favorites.isLiked(selectedItem.id)}
          likeCount={favorites.getLikeCount(selectedItem.id)}
          isLikePending={favorites.isLikePending(selectedItem.id)}
          onLikeClick={favorites.handleLikeClick}
          onShare={handleShare}
        />
      )}

      {showAllSpecials && (
        <AllSpecialsOverlay
          items={filter.todaysSpecialsList}
          vendorName={vendorName}
          onClose={() => setShowAllSpecials(false)}
          onItemClick={handleItemClick}
          isLiked={favorites.isLiked}
          getLikeCount={favorites.getLikeCount}
          isLikePending={favorites.isLikePending}
          onLikeClick={favorites.handleLikeClick}
        />
      )}

      {/* ── Floating Cart & Active Order Bar ── */}
      <FloatingCartBar
        cartSummary={cart.cartSummary}
        activeOrder={activeOrder}
        ordersList={ordersList}
        onContinue={() => setShowCart(true)}
        onViewActiveOrder={() => setShowCart(true)}
      />

      {/* ── Cart & Active Order Sheet ── */}
      {showCart && (
        <CartSheet
          cartItems={cartItems.length > 0 ? cartItems : (activeOrder?.items || [])}
          cartSummary={cart.cartSummary}
          vendorName={vendorName}
          vendorAddress={vendorAddress}
          whatsapp={whatsapp}
          phone={phone}
          shopId={shopId}
          shopSlug={shopSlug}
          onClose={() => setShowCart(false)}
          onIncrement={cart.incrementItem}
          onDecrement={cart.decrementItem}
          onRemove={cart.removeItem}
          onClearCart={cart.clearCart}
          onOrderPlaced={(order: ActiveOrder) => {
            saveOrders([...ordersList, order]);
          }}
          initialOrderStatus={cart.cartSummary.totalItemsCount === 0 && (ordersList.length > 0 || activeOrder) ? 'success' : 'idle'}
          activeOrder={activeOrder}
          ordersList={ordersList}
        />
      )}
    </div>
  );
}

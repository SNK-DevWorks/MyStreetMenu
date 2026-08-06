import { useState, useMemo } from 'react';
import type { FoodCardItem } from '@/components/shared/item';
import type { CartSummary } from '../types';
import { getItemUnitPrice } from '../utils';

export interface UseCartReturn {
  itemQuantities: Record<string, number>;
  setItemQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  addItem: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  incrementItem: (itemId: string) => void;
  decrementItem: (itemId: string) => void;
  clearCart: () => void;
  getQuantity: (itemId: string) => number;
  cartSummary: CartSummary;
}

export function useCart(items: FoodCardItem[]): UseCartReturn {
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const cartSummary = useMemo<CartSummary>(() => {
    let totalItemsCount = 0;
    let totalSavings = 0;
    let totalPrice = 0;
    let lastAddedItem: FoodCardItem | null = null;

    Object.entries(itemQuantities).forEach(([itemId, qty]) => {
      if (qty <= 0) return;
      const found = items.find(i => i.id === itemId);
      if (!found) return;

      lastAddedItem = found;
      totalItemsCount += qty;

      const unitPrice = getItemUnitPrice(found);
      totalPrice += unitPrice * qty;

      if (
        found.hasDiscount &&
        found.priceOriginal != null &&
        found.priceFinal != null &&
        found.priceOriginal > found.priceFinal
      ) {
        totalSavings += (found.priceOriginal - found.priceFinal) * qty;
      }
    });

    return { totalItemsCount, totalSavings, totalPrice, lastAddedItem };
  }, [itemQuantities, items]);

  const addItem = (itemId: string, quantity = 1) => {
    setItemQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const removeItem = (itemId: string) => {
    setItemQuantities(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const incrementItem = (itemId: string) => {
    setItemQuantities(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const decrementItem = (itemId: string) => {
    setItemQuantities(prev => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  const clearCart = () => setItemQuantities({});

  const getQuantity = (itemId: string) => itemQuantities[itemId] || 0;

  return {
    itemQuantities,
    setItemQuantities,
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    clearCart,
    getQuantity,
    cartSummary,
  };
}

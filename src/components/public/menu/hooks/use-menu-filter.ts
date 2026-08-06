import { useState, useMemo } from 'react';
import type { FoodCardItem } from '@/components/shared/item';
import type { DietFilter } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

export interface UseMenuFilterReturn {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  dietFilter: DietFilter;
  setDietFilter: (filter: DietFilter) => void;
  categoryList: string[];
  isAllCategory: boolean;
  availableFoodTypes: Set<'veg' | 'non-veg' | 'egg'>;
  filteredItems: FoodCardItem[];
  todaysSpecialsList: FoodCardItem[];
}

export function useMenuFilter(
  items: FoodCardItem[],
  categories: string[],
  searchQuery: string
): UseMenuFilterReturn {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');

  const categoryList = useMemo(() => {
    const list = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
    if (!list.some(c => c.toLowerCase() === 'all' || c.toLowerCase() === 'all items')) {
      return ['All', ...list];
    }
    return list;
  }, [categories]);

  const isAllCategory = useMemo(() => {
    const lower = selectedCategory.toLowerCase().trim();
    return lower === 'all' || lower === 'all items' || selectedCategory === categoryList[0];
  }, [selectedCategory, categoryList]);

  const availableFoodTypes = useMemo(() => {
    const types = new Set<'veg' | 'non-veg' | 'egg'>();
    items.forEach(item => {
      if (item.isAvailable !== false && item.foodType) {
        types.add(item.foodType);
      }
    });
    return types;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = isAllCategory || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiet =
        dietFilter === 'all' ||
        (dietFilter === 'non-veg'
          ? item.foodType === 'non-veg' || item.foodType === 'egg'
          : item.foodType === dietFilter);
      return matchesCategory && matchesSearch && matchesDiet && item.isAvailable !== false;
    });
  }, [items, searchQuery, selectedCategory, isAllCategory, dietFilter]);

  const todaysSpecialsList = useMemo(() => {
    return items.filter(i => i.isTodaysSpecial && i.isAvailable !== false);
  }, [items]);

  return {
    selectedCategory,
    setSelectedCategory,
    dietFilter,
    setDietFilter,
    categoryList,
    isAllCategory,
    availableFoodTypes,
    filteredItems,
    todaysSpecialsList,
  };
}

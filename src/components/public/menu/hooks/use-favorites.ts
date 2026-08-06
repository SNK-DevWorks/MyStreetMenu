import { useAnalytics } from '@/providers/analytics-provider';

export interface UseFavoritesReturn {
  isLiked: (id: string) => boolean;
  getLikeCount: (id: string) => number;
  isLikePending: (id: string) => boolean;
  handleLikeClick: (id: string, e: React.MouseEvent) => void;
}

export function useFavorites(): UseFavoritesReturn {
  const { isLiked, getLikeCount, isLikePending, likeMenuItem } = useAnalytics();

  const handleLikeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    likeMenuItem(id);
  };

  return { isLiked, getLikeCount, isLikePending, handleLikeClick };
}

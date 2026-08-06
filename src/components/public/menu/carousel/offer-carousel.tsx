'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { PublicOfferItem } from '../types';
import { OfferCard } from '@/components/shared/offer-card';
import { CAROUSEL_INTERVAL_MS } from '../constants';

interface OfferCarouselProps {
  offers: PublicOfferItem[];
}

export function OfferCarousel({ offers }: OfferCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const touchStartX = useRef<number | null>(null);

  // Extended list with cloned first item for seamless single-direction loop
  const displayOffers = useMemo(() => {
    if (offers && offers.length > 1) {
      return [...offers, offers[0]];
    }
    return offers || [];
  }, [offers]);

  useEffect(() => {
    if (offers.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setActiveIndex(prev => prev + 1);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [offers.length, isPaused]);

  const handleTransitionEnd = () => {
    if (activeIndex >= offers.length) {
      setIsTransitioning(false);
      setActiveIndex(0);
    }
  };

  if (!offers || offers.length === 0) return null;

  const realActiveIndex = activeIndex % offers.length;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (diffX < -40) {
      setIsTransitioning(true);
      setActiveIndex(prev => prev + 1);
    } else if (diffX > 40) {
      setIsTransitioning(true);
      setActiveIndex(prev => (prev > 0 ? prev - 1 : offers.length - 1));
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full overflow-hidden rounded-[24px] shadow-[0_8px_24px_rgba(255,107,0,0.14)] border border-[#FF6B00]/25 bg-[#111111]">
        <div
          className={`flex w-full ${isTransitioning ? 'transition-transform duration-600 ease-out' : 'transition-none'}`}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {displayOffers.map((offer, idx) => (
            <div key={`${offer.id}-${idx}`} className="w-full min-w-full shrink-0 overflow-hidden">
              <OfferCard
                offer={offer}
                index={idx % offers.length}
                className="w-full min-h-[220px] xs:min-h-[245px] sm:min-h-[275px] rounded-none border-none"
              />
            </div>
          ))}
        </div>

        {offers.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 shadow-xs">
            {offers.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setIsTransitioning(true);
                  setActiveIndex(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === realActiveIndex
                    ? 'w-3 h-1 bg-[#FF6B00] shadow-2xs'
                    : 'w-1 h-1 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

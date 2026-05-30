import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 70;

export function usePullToRefresh(
  onRefresh: () => void,
  enabled = true,
): { pullDistance: number; isRefreshing: boolean } {
  const startYRef = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const enabledRef = useRef(enabled);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
    enabledRef.current = enabled;
  });

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (!enabledRef.current || window.scrollY > 0 || isRefreshingRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      startYRef.current = touch.clientY;
    }

    function onTouchMove(e: TouchEvent) {
      if (startYRef.current === null) return;
      if (window.scrollY > 0) {
        startYRef.current = null;
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }
      const touch = e.touches[0];
      if (!touch) return;
      const delta = touch.clientY - startYRef.current;
      if (delta > 0) {
        pullDistanceRef.current = Math.min(delta, THRESHOLD * 1.5);
        setPullDistance(pullDistanceRef.current);
      } else {
        startYRef.current = null;
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    }

    function onTouchEnd() {
      if (startYRef.current === null) return;
      const dist = pullDistanceRef.current;
      startYRef.current = null;
      pullDistanceRef.current = 0;
      setPullDistance(0);
      if (dist >= THRESHOLD) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        onRefreshRef.current();
        setTimeout(() => {
          isRefreshingRef.current = false;
          setIsRefreshing(false);
        }, 1200);
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return { pullDistance, isRefreshing };
}

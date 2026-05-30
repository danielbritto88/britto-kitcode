import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function usePWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        pollRef.current = setInterval(() => void r.update(), 60_000);
      }
    },
  });

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return { isOnline, needRefresh, updateServiceWorker };
}

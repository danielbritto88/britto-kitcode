import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSignedPhotoUrl } from '@/lib/photo';
import { isLocalPhotoKey, getLocalPhotoUrl, localPhotoVehicleId } from '@/lib/localPhoto';

interface UrlState {
  key: string | null | undefined;
  url: string | null;
}

// Resolve uma `photo_key` em URL assinada (PROJETO §7.1).
// Se for chave local (`local:<vehicleId>`), lê do localStorage.
// Retorna null enquanto carrega ou se a sessão estiver travada.
export function usePhotoUrl(key: string | null | undefined): string | null {
  const { signing } = useAuth();
  const [state, setState] = useState<UrlState>({ key: null, url: null });

  useEffect(() => {
    if (!key) return;

    // Chave local — resolve síncrono do localStorage
    if (isLocalPhotoKey(key)) {
      const vehicleId = localPhotoVehicleId(key);
      const localUrl = getLocalPhotoUrl(vehicleId);
      setState({ key, url: localUrl });
      return;
    }

    if (!signing) return;
    let cancelled = false;
    void (async () => {
      try {
        const u = await getSignedPhotoUrl(signing, key);
        if (!cancelled) setState({ key, url: u });
      } catch {
        // mantém URL anterior em silêncio; o caller mostra avatar fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key, signing]);

  return state.key === key ? state.url : null;
}

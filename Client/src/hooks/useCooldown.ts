import { useCallback, useEffect, useState } from 'react';

/**
 * Returns `active` as `true` and `secondsLeft` countdown for `duration` ms
 * after `trigger` is called, then resets to `false`.
 * Supports an optional `storageKey` to persist cooldown across page reloads.
 */
export function useCooldown(duration = 3000, storageKey?: string) {
  const getRemainingSeconds = useCallback(() => {
    if (!storageKey || typeof window === 'undefined') return 0;
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (!stored) return 0;
      const targetTime = parseInt(stored, 10);
      const remainingMs = targetTime - Date.now();
      return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
    } catch {
      return 0;
    }
  }, [storageKey]);

  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    getRemainingSeconds()
  );

  const trigger = useCallback(() => {
    const expiresAt = Date.now() + duration;
    if (storageKey && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(storageKey, String(expiresAt));
      } catch (err) {
        console.warn('Failed to persist cooldown in sessionStorage:', err);
      }
    }
    setSecondsLeft(Math.ceil(duration / 1000));
  }, [duration, storageKey]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (storageKey && typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem(storageKey);
        } catch {
          // ignore
        }
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (storageKey && typeof window !== 'undefined') {
            try {
              sessionStorage.removeItem(storageKey);
            } catch {
              // ignore
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, storageKey]);

  return { active: secondsLeft > 0, secondsLeft, trigger };
}

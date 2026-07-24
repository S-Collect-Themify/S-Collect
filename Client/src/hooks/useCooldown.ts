import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Returns `true` for `duration` ms after `trigger` is called,
 * then resets to `false`. Useful for briefly disabling a button
 * after an action completes to prevent rapid re-submission.
 */
export function useCooldown(duration = 3000) {
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(() => {
    setActive(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setActive(false), duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { active, trigger };
}

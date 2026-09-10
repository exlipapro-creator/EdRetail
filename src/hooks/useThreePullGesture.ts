import { useEffect, useRef, useState } from 'react';

/**
 * Hidden internal-access gesture — NOT a security boundary.
 *
 * Three deliberate upward pulls (wheel up / touch swipe up) within a
 * designated bottom activation zone open the Distributor Login. Inside the
 * Distributor Login, the same gesture (its own activation zone) opens the
 * Super Admin Login. Actual access is always enforced server-side (Supabase
 * auth + user_roles + RLS).
 *
 * Safety rules:
 * - Bound to an explicit activation zone element via `zoneRef`. Events are
 *   only counted when they originate inside that zone — ordinary scrolling,
 *   swiping product cards, or touching the middle of the page never counts.
 * - Requires three distinct pulls with a deliberate cadence; ordinary
 *   scrolling is too slow/smeared to accumulate three hits.
 * - Counter resets after 2.5s of inactivity or when `resetKey` changes.
 */

const REQUIRED_PULLS = 3;
const RESET_MS = 2500;
/** Minimum deliberate upward swipe (px) for a touch pull. */
const MIN_SWIPE_PX = 120;
/** Minimum deliberate wheel notch (px) for a wheel pull. */
const MIN_WHEEL_PX = 8;

interface ThreePullGestureProps {
  /** Called when the pull threshold is reached (open Distributor Login). */
  onTrigger: () => void;
  /** Changing this key resets the counter (screen/navigation reset). */
  resetKey?: string;
  /** Disable the gesture entirely. */
  disabled?: boolean;
  /**
   * Designated activation zone. When provided, wheel/touch listeners attach
   * to this element only (plus a containment check), so the gesture cannot
   * fire from anywhere else on the screen. When omitted, listeners attach to
   * `window` (legacy behavior — keep only for full-screen surfaces).
   */
  zoneRef?: { current: HTMLElement | null };
}

export function useThreePullGesture({ onTrigger, resetKey, disabled, zoneRef }: ThreePullGestureProps) {
  const pullsRef = useRef(0);
  const lastPullAtRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const [remaining, setRemaining] = useState(REQUIRED_PULLS);

  const registerPull = () => {
    if (disabled) return;
    const now = Date.now();
    // Deliberate cadence: pulls must come in a steady rhythm, not smeared out
    // by ordinary scrolling (which rarely produces 3 clean wheel-ups in 2.5s)
    // and not a jittery double-fire.
    if (now - lastPullAtRef.current < 220 && lastPullAtRef.current !== 0) return;
    if (now - lastPullAtRef.current > RESET_MS) pullsRef.current = 0;
    lastPullAtRef.current = now;
    pullsRef.current += 1;
    setRemaining(REQUIRED_PULLS - pullsRef.current);

    if (pullsRef.current >= REQUIRED_PULLS) {
      pullsRef.current = 0;
      setRemaining(REQUIRED_PULLS);
      onTrigger();
    }
  };

  const eventTargetInZone = (e: Event) => {
    const zone = zoneRef?.current;
    if (!zone) return true; // no zone → window listeners (legacy)
    const target = e.target as Node | null;
    return !!target && (target === zone || zone.contains(target));
  };

  useEffect(() => {
    if (disabled) return;
    const zone = zoneRef?.current;
    const attachTarget: HTMLElement | Window = zone ?? window;
    const onWheel = (e: Event) => {
      if (eventTargetInZone(e) && (e as WheelEvent).deltaY < -MIN_WHEEL_PX) registerPull();
    };
    const onTouchStart = (e: Event) => {
      if (!eventTargetInZone(e)) return;
      touchStartYRef.current = (e as TouchEvent).touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (e: Event) => {
      if (!eventTargetInZone(e)) return;
      const te = e as TouchEvent;
      const startY = touchStartYRef.current;
      touchStartYRef.current = null;
      const endY = te.changedTouches[0]?.clientY;
      if (startY == null || endY == null) return;
      const dy = startY - endY; // positive = upward
      const dt = Date.now() - (lastPullAtRef.current || 0);
      // Deliberate swipe: at least 120px up, spaced from the previous pull,
      // and not while momentum-scrolling (long fast swipes at the top).
      if (dy > MIN_SWIPE_PX && dt > 250) registerPull();
    };
    attachTarget.addEventListener('wheel', onWheel, { passive: true });
    attachTarget.addEventListener('touchstart', onTouchStart, { passive: true });
    attachTarget.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      attachTarget.removeEventListener('wheel', onWheel);
      attachTarget.removeEventListener('touchstart', onTouchStart);
      attachTarget.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, onTrigger, zoneRef]);

  // Reset on navigation / key change.
  useEffect(() => {
    pullsRef.current = 0;
    lastPullAtRef.current = 0;
    setRemaining(REQUIRED_PULLS);
  }, [resetKey]);

  return { remaining };
}
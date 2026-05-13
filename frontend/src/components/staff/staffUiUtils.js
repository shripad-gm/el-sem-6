import { useEffect, useRef, useState } from 'react';

export function useAnimatedNumber(target, duration = 900) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = typeof target === 'number' && !Number.isNaN(target) ? target : 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - p) ** 2.4;
      const v = from + (to - from) * eased;
      const rounded = Math.round(v);
      setDisplay(rounded);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display;
}

export function formatInr(n) {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  }
}

export const STATUS_STYLES = {
  active: 'border-status-running/40 text-status-running bg-status-running/10 shadow-[0_0_12px_rgba(0,255,136,0.12)]',
  idle: 'border-status-idle/40 text-status-idle bg-status-idle/10',
  assigned: 'border-brand-primary/40 text-brand-primary bg-brand-primary/10',
  unassigned: 'border-white/20 text-white/60 bg-white/5',
  on_leave: 'border-brand-secondary/40 text-brand-secondary bg-brand-secondary/10',
  absent: 'border-status-error/40 text-status-error bg-status-error/10',
  overloaded: 'border-status-warning/50 text-status-warning bg-status-warning/10',
};

export function statusLabel(s) {
  return s.replace(/_/g, ' ');
}

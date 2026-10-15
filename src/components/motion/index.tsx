'use client';

import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/cn';

/**
 * Motion primitives.
 *
 * Three rules these are built around, from the motion craft references:
 *
 *  1. Animate `transform` and `opacity` only. Both are compositor properties;
 *     animating `height`, `top`, or `margin` forces layout on every frame and
 *     is what makes motion feel janky on a mid-range phone.
 *
 *  2. Ease-out for anything entering. It front-loads the movement, so the thing
 *     appears to respond immediately. `ease-in` delays the first frame, which is
 *     precisely the moment the user is watching.
 *
 *  3. Respect `prefers-reduced-motion`, and mean it. `useReducedMotion()` is
 *     read once per component so the fallback is "render it already in place",
 *     not "animate faster". A reduced-motion user gets no movement at all.
 *
 * Durations stay at or under 300ms for anything the user triggers. Scroll
 * reveals may run slightly longer because they are not a direct answer to a
 * click, but they still stay under 600ms.
 */

const REVEAL_DURATION = 0.45;
const REVEAL_DISTANCE = 16;
/** Stagger between siblings. Above ~80ms a list feels like it is loading. */
const STAGGER = 0.06;

/**
 * Reveal — fades and lifts a block into view once, on scroll.
 *
 * Uses `whileInView` with `once: true` so content that scrolls out and back
 * does not re-animate. Re-animating on every pass reads as noise, and it also
 * re-runs the compositor work for content the user has already read.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: _as,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Kept for API symmetry; the motion element is always a div. */
  as?: 'div';
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: REVEAL_DISTANCE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: REVEAL_DURATION,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * RevealGroup — parent for a staggered list of `RevealItem`s.
 *
 * Staggering from the parent rather than passing an incrementing delay to each
 * child keeps the timing correct when the list length changes, and lets one
 * `useReducedMotion()` check cover the whole group.
 */
export function RevealGroup({
  children,
  className,
  stagger = STAGGER,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger } },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  const item: Variants = {
    hidden: { opacity: 0, y: REVEAL_DISTANCE },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: REVEAL_DURATION, ease: [0.23, 1, 0.32, 1] },
    },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

/**
 * CountUp — counts a numeric part of a label up when it scrolls into view.
 *
 * The label is often mixed, e.g. "09.00" or "4". Only the digits animate; the
 * wrapper text is passed through untouched. The final value is rendered
 * immediately under reduced motion, so nobody is left staring at a zero.
 *
 * `tabular-nums` is applied by the caller where column alignment matters; it is
 * not forced here because a standalone stat does not need it.
 */
export function CountUp({
  value,
  suffix = '',
  prefix = '',
  pad = 0,
  duration = 0.9,
  delay = 0,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  /** Left-pad the number to this width, e.g. 2 renders 9 as "09". */
  pad?: number;
  duration?: number;
  /** Seconds to wait before starting. Used to offset split values like 09.00. */
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = React.useState(reduce ? value : 0);

  React.useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / (duration * 1000), 1);
        // Cubic ease-out: fast at the start, settling at the end.
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(eased * value));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (delay > 0) timer = setTimeout(run, delay * 1000);
    else run();

    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [value, duration, delay, reduce]);

  const text = pad > 0 ? String(display).padStart(pad, '0') : String(display);

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

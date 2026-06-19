'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Avoid running on server
    if (typeof window === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential out
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Store lenis reference globally so components can control scrolling if needed (e.g. locking it during intro)
    const lenisWindow = window as unknown as { lenis?: Lenis };
    lenisWindow.lenis = lenis;

    return () => {
      lenisWindow.lenis = undefined;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

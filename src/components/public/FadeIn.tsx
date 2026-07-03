'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

type FadeInProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'section' | 'article' | 'li';
};

export function FadeIn({ children, className, style, as: Tag = 'div' }: FadeInProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -72px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible]);

  return createElement(
    Tag,
    {
      ref,
      className: ['site-fade-in', isVisible ? 'is-visible' : '', className].filter(Boolean).join(' '),
      style,
    },
    children,
  );
}

'use client';

import React, { useRef, useEffect } from 'react';
import { Theme } from '@/domain/themes/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GSAPLayerProps {
  theme: Theme;
  /** 'hero' | 'storybook' | 'final' */
  section: 'hero' | 'storybook' | 'final';
  /** The trigger element (the section itself) */
  triggerRef: React.RefObject<HTMLElement | null>;
}

/**
 * GSAPLayer — A decorative GSAP-driven 3D depth layer that is rendered
 * absolutely inside a specific section. Used to give Hero, StoryBook and
 * Final sections their own depth atmosphere on top of the global
 * MultilayerBackground parallax.
 *
 * It uses ScrollTrigger to drive rotation, scale, and opacity of SVG
 * depth planes, creating a sense of 3-dimensional depth as the user
 * scrolls through each section.
 */
export default function GSAPLayer({ theme, section, triggerRef }: GSAPLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const accent =
    theme.id === 'floral'
      ? '#4A5D4E'
      : theme.id === 'azure'
      ? '#8AAED6'
      : theme.id === 'modern'
      ? '#222222'
      : '#C5A880';

  const accent2 =
    theme.id === 'floral'
      ? '#E5B1A8'
      : theme.id === 'azure'
      ? '#4A7EC0'
      : theme.id === 'modern'
      ? '#555555'
      : '#EDE0C4';

  useEffect(() => {
    if (!containerRef.current || !triggerRef.current) return;

    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>('.gsap-depth-layer', containerRef.current!);

      layers.forEach((layer, i) => {
        const depth = i + 1; // 1, 2, 3
        const speedMultiplier = depth * 0.04; // deeper = slower
        const dirX = i % 2 === 0 ? 1 : -1;

        if (section === 'hero') {
          // Hero: layers drift from center outward + fade in at start
          gsap.fromTo(
            layer,
            { opacity: 0, scale: 0.85 + depth * 0.04, y: 30 * depth },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 1.4 + depth * 0.3,
              delay: depth * 0.15,
              ease: 'power3.out',
            }
          );

          // Scroll parallax — layers shift at different speeds as user scrolls hero
          ScrollTrigger.create({
            trigger: triggerRef.current!,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5 + depth * 0.3,
            onUpdate: (self) => {
              gsap.set(layer, {
                y: self.progress * (window.innerHeight * speedMultiplier * -1),
                x: self.progress * dirX * 20 * depth,
              });
            },
          });
        } else if (section === 'storybook') {
          // StoryBook: pages-turning depth — rotate and scale with scroll
          ScrollTrigger.create({
            trigger: triggerRef.current!,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1,
            onUpdate: (self) => {
              gsap.set(layer, {
                rotationY: self.progress * dirX * 8 * depth,
                z: self.progress * 20 * depth,
                opacity: 0.6 + self.progress * 0.4,
                transformOrigin: i % 2 === 0 ? 'left center' : 'right center',
              });
            },
          });

          // Entrance animation
          gsap.fromTo(
            layer,
            { opacity: 0, x: dirX * 40 * depth },
            {
              opacity: 0.8,
              x: 0,
              duration: 1.2,
              delay: depth * 0.2,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: triggerRef.current!,
                start: 'top 75%',
                once: true,
              },
            }
          );
        } else {
          // Final: everything gently rises and glows on scroll-in
          gsap.fromTo(
            layer,
            { opacity: 0, y: 40 + depth * 15, scale: 1.1 },
            {
              opacity: 0.7,
              y: 0,
              scale: 1,
              duration: 1.6 + depth * 0.4,
              delay: depth * 0.2,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: triggerRef.current!,
                start: 'top 70%',
                once: true,
              },
            }
          );

          // Lenis-aware continuous slow float
          gsap.to(layer, {
            y: `-=${12 + depth * 6}`,
            duration: 3 + depth * 0.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: depth * 0.5,
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [section, triggerRef, theme.id]);

  // ----- Render themed depth planes -----

  const renderLayers = () => {
    if (section === 'hero') {
      return (
        <>
          {/* Layer 1 — Large background silhouette */}
          <div
            className="gsap-depth-layer absolute pointer-events-none opacity-0"
            style={{
              top: '-5%',
              left: '-10%',
              width: '55%',
              aspectRatio: '1',
              filter: 'blur(2px)',
            }}
          >
            <svg viewBox="0 0 200 200" fill={accent} className="w-full h-full opacity-[0.04]">
              <ellipse cx="100" cy="100" rx="90" ry="80" />
              <ellipse cx="70" cy="60" rx="50" ry="70" />
            </svg>
          </div>

          {/* Layer 2 — Mid ornament */}
          <div
            className="gsap-depth-layer absolute pointer-events-none opacity-0"
            style={{ bottom: '5%', right: '-8%', width: '40%', aspectRatio: '1' }}
          >
            <svg viewBox="0 0 100 100" fill="none" stroke={accent} strokeWidth="0.6" className="w-full h-full opacity-[0.07]">
              <circle cx="50" cy="50" r="45" />
              <circle cx="50" cy="50" r="30" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="15" />
            </svg>
          </div>

          {/* Layer 3 — Foreground micro particles */}
          <div
            className="gsap-depth-layer absolute pointer-events-none opacity-0"
            style={{ top: '30%', right: '12%', width: '8%', aspectRatio: '1' }}
          >
            <svg viewBox="0 0 20 20" fill={accent2} className="w-full h-full opacity-[0.15]">
              <path d="M10,0 L11.5,7 L18,10 L11.5,13 L10,20 L8.5,13 L2,10 L8.5,7 Z" />
            </svg>
          </div>
        </>
      );
    }

    if (section === 'storybook') {
      return (
        <>
          {/* Layer 1 — Wide page-like gradient plane */}
          <div
            className="gsap-depth-layer absolute pointer-events-none opacity-0"
            style={{
              top: '0',
              left: '-15%',
              width: '35%',
              height: '100%',
              background: `linear-gradient(to right, ${accent}08, transparent)`,
              borderRight: `1px solid ${accent}12`,
            }}
          />
          {/* Layer 2 — Right side */}
          <div
            className="gsap-depth-layer absolute pointer-events-none opacity-0"
            style={{
              top: '0',
              right: '-15%',
              width: '35%',
              height: '100%',
              background: `linear-gradient(to left, ${accent}08, transparent)`,
              borderLeft: `1px solid ${accent}12`,
            }}
          />
          {/* Layer 3 — Center spine glow */}
          <div
            className="gsap-depth-layer absolute pointer-events-none opacity-0"
            style={{
              top: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '2px',
              height: '80%',
              background: `linear-gradient(to bottom, transparent, ${accent}25, transparent)`,
            }}
          />
        </>
      );
    }

    // final
    return (
      <>
        {/* Layer 1 — Large radial atmosphere */}
        <div
          className="gsap-depth-layer absolute pointer-events-none opacity-0"
          style={{
            inset: '-20%',
            background: `radial-gradient(ellipse 65% 55% at 50% 60%, ${accent}0F 0%, transparent 65%)`,
          }}
        />
        {/* Layer 2 — Floating ornamental ring */}
        <div
          className="gsap-depth-layer absolute pointer-events-none opacity-0"
          style={{ top: '15%', left: '50%', transform: 'translateX(-50%)', width: '60%', maxWidth: '320px', aspectRatio: '1' }}
        >
          <svg viewBox="0 0 100 100" fill="none" stroke={accent} strokeWidth="0.4" className="w-full h-full opacity-[0.10]">
            <circle cx="50" cy="50" r="48" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="38" />
          </svg>
        </div>
        {/* Layer 3 — Small diamond */}
        <div
          className="gsap-depth-layer absolute pointer-events-none opacity-0"
          style={{ bottom: '20%', left: '50%', transform: 'translateX(-50%)', width: '5%', minWidth: '24px', aspectRatio: '1' }}
        >
          <svg viewBox="0 0 20 20" fill={accent} className="w-full h-full opacity-[0.2]">
            <polygon points="10,1 19,10 10,19 1,10" />
          </svg>
        </div>
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 0, perspective: '800px' }}
    >
      {renderLayers()}
    </div>
  );
}

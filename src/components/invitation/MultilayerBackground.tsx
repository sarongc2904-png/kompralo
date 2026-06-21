/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Theme } from '@/domain/themes/types';
import { useThemeV2, resolveThemeBackgroundAssets } from '@/domain/themes-v2';
import type { ThemeIdV2 } from '@/domain/themes-v2/types';
import type { ThemeBackgroundAssets } from '@/domain/themes-v2/resolveThemeBackgroundAssets';

// ─── FLOATING HEARTS ─────────────────────────────────────────────────────────
function FloatingHearts() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const COUNT = Math.min(Math.floor(W * H / 18000), W < 768 ? 18 : 55);

    type Heart = {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      phase: number; phaseSpeed: number;
      swayAmp: number; swayFreq: number;
      color: string; alpha: number;
      rotation: number; rotSpeed: number;
    };

    const COLORS = [
      'rgba(197,168,128,',  // gold
      'rgba(220,160,160,',  // rose
      'rgba(210,140,150,',  // dusty pink
      'rgba(180,140,110,',  // warm tan
      'rgba(230,185,170,',  // blush
    ];

    const hearts: Heart[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H + H,          // start below screen
      vx: (Math.random() - 0.5) * 0.2,
      vy: -(Math.random() * 0.5 + 0.25), // float upward
      size: Math.random() * 10 + 5,      // 5–15px
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.006 + Math.random() * 0.01,
      swayAmp: 18 + Math.random() * 28,
      swayFreq: 0.003 + Math.random() * 0.004,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.06 + Math.random() * 0.14,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
    }));

    // Draw a heart centered at (0,0) with given half-size
    function drawHeart(size: number) {
      const s = size;
      ctx!.beginPath();
      ctx!.moveTo(0, -s * 0.3);
      ctx!.bezierCurveTo( s * 0.9, -s * 1.1,  s * 1.6,  s * 0.2,  0,  s);
      ctx!.bezierCurveTo(-s * 1.6,  s * 0.2, -s * 0.9, -s * 1.1,  0, -s * 0.3);
      ctx!.closePath();
    }

    function tick() {
      ctx!.clearRect(0, 0, W, H);

      hearts.forEach((h) => {
        // Sway on X, drift upward
        h.phase += h.phaseSpeed;
        h.x += Math.sin(h.phase * h.swayFreq * 200) * 0.4 + h.vx;
        h.y += h.vy;
        h.rotation += h.rotSpeed;

        // Wrap top → bottom
        if (h.y < -h.size * 2) {
          h.y = H + h.size * 2;
          h.x = Math.random() * W;
        }
        if (h.x < -30) h.x = W + 30;
        if (h.x > W + 30) h.x = -30;

        // Pulse opacity
        const pulse = 0.5 + 0.5 * Math.sin(h.phase);
        const alpha = h.alpha * (0.6 + 0.4 * pulse);

        ctx!.save();
        ctx!.translate(h.x, h.y);
        ctx!.rotate(h.rotation);

        // Glow
        const glow = ctx!.createRadialGradient(0, 0, 0, 0, 0, h.size * 2.5);
        glow.addColorStop(0, `${h.color}${(alpha * 0.22).toFixed(3)})`);
        glow.addColorStop(1, `${h.color}0)`);
        drawHeart(h.size * 1.6);
        ctx!.fillStyle = glow;
        ctx!.fill();

        // Heart fill
        drawHeart(h.size);
        ctx!.fillStyle = `${h.color}${alpha.toFixed(3)})`;
        ctx!.fill();

        ctx!.restore();
      });

      raf = requestAnimationFrame(tick);
    }

    tick();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// ─── PETAL CONFIG ─────────────────────────────────────────────────────────────
const PETALS = [
  { x: 4,  delay: 0,    dur: 14, size: 18, sway: 'A', color: '#E8A0A0', opacity: 0.75 },
  { x: 13, delay: 3.5,  dur: 18, size: 14, sway: 'B', color: '#F2C4B8', opacity: 0.70 },
  { x: 22, delay: 7,    dur: 13, size: 20, sway: 'C', color: '#D4906A', opacity: 0.65 },
  { x: 31, delay: 1.5,  dur: 16, size: 15, sway: 'A', color: '#F0B8C0', opacity: 0.72 },
  { x: 40, delay: 10,   dur: 12, size: 18, sway: 'B', color: '#E8A8A0', opacity: 0.68 },
  { x: 51, delay: 5,    dur: 15, size: 14, sway: 'C', color: '#F2BEB0', opacity: 0.70 },
  { x: 60, delay: 8.5,  dur: 17, size: 18, sway: 'A', color: '#E09090', opacity: 0.65 },
  { x: 69, delay: 2,    dur: 11, size: 16, sway: 'B', color: '#F5C8B8', opacity: 0.72 },
  { x: 78, delay: 12,   dur: 14, size: 20, sway: 'C', color: '#EDB0A8', opacity: 0.68 },
  { x: 87, delay: 6,    dur: 16, size: 15, sway: 'A', color: '#E8A8A0', opacity: 0.70 },
  { x: 8,  delay: 14,   dur: 13, size: 16, sway: 'B', color: '#F2C0B4', opacity: 0.65 },
  { x: 47, delay: 9,    dur: 18, size: 14, sway: 'C', color: '#E8A0A8', opacity: 0.72 },
  { x: 93, delay: 4,    dur: 12, size: 18, sway: 'A', color: '#F0B8B0', opacity: 0.68 },
  { x: 35, delay: 16,   dur: 15, size: 15, sway: 'B', color: '#EDACAC', opacity: 0.70 },
  { x: 72, delay: 11,   dur: 14, size: 18, sway: 'C', color: '#E8A0A4', opacity: 0.65 },
] as const;

// Petal SVG shapes (3 varieties)
function PetalShape({ size, color }: { size: number; color: string }) {
  const s = size;
  return (
    <svg width={s} height={s * 1.55} viewBox="0 0 20 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 1 C15 1 20 7 19 14 C18 21 13 29 10 30 C7 29 2 21 1 14 C0 7 5 1 10 1Z"
        fill={color}
        opacity="0.88"
      />
      {/* Central vein */}
      <path d="M10 3 Q10.5 16 10 29" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" fill="none"/>
      {/* Lateral veins */}
      <path d="M10 10 Q14 12 17 11" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none"/>
      <path d="M10 10 Q6 12 3 11"  stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none"/>
      <path d="M10 17 Q13 19 16 17" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" fill="none"/>
      <path d="M10 17 Q7 19 4 17"  stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" fill="none"/>
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FallingPetals() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {PETALS.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: 0,
            animationName: 'petalFallY',
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationFillMode: 'both',
          }}
        >
          <div
            style={{
              animationName: `petalSway${p.sway}`,
              animationDuration: `${p.dur * 0.7}s`,
              animationDelay: `${p.delay}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              opacity: p.opacity,
            }}
          >
            <PetalShape size={p.size} color={p.color} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FOG LAYERS ───────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FogLayers() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {/* Fog 1 — bottom ground mist */}
      <div
        style={{
          position: 'absolute',
          bottom: '-8%', left: '-10%',
          width: '130%', height: '38%',
          background: 'radial-gradient(ellipse 80% 60% at 50% 90%, rgba(255,250,242,0.72) 0%, rgba(255,248,238,0.40) 45%, transparent 100%)',
          filter: 'blur(28px)',
          animationName: 'fogDrift1',
          animationDuration: '28s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        }}
      />
      {/* Fog 2 — mid-height ethereal band */}
      <div
        style={{
          position: 'absolute',
          top: '28%', left: '-8%',
          width: '120%', height: '28%',
          background: 'radial-gradient(ellipse 90% 55% at 50% 50%, rgba(255,250,244,0.38) 0%, rgba(253,246,238,0.18) 50%, transparent 100%)',
          filter: 'blur(38px)',
          animationName: 'fogDrift2',
          animationDuration: '36s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        }}
      />
      {/* Fog 3 — subtle top fade */}
      <div
        style={{
          position: 'absolute',
          top: '-5%', left: '-5%',
          width: '110%', height: '25%',
          background: 'radial-gradient(ellipse 85% 60% at 50% 0%, rgba(255,252,244,0.45) 0%, rgba(255,250,240,0.20) 50%, transparent 100%)',
          filter: 'blur(32px)',
          animationName: 'fogDrift3',
          animationDuration: '42s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        }}
      />
    </div>
  );
}

// ─── V2 LAYER CONTENT ─────────────────────────────────────────────────────────
// Returns JSX for each parallax depth layer keyed by V2 theme ID.
// Only the asset source and blend-mode change per theme; positions/sizes are unchanged.
function buildLayerContent(
  themeId: ThemeIdV2,
  assets: ThemeBackgroundAssets
): { layer1: React.ReactNode; layer2: React.ReactNode; layer3: React.ReactNode } {

  switch (themeId) {

    case 'luxury-gold':
      // Pastel light theme — layer images designed for dark bg; render empty to keep background clean
      return { layer1: <></>, layer2: <></>, layer3: <></> };

    case 'modern-dark':
      // Pastel light theme — layer images designed for dark bg; render empty to keep background clean
      return { layer1: <></>, layer2: <></>, layer3: <></> };

    case 'floral':
      // Blush botanical — multiply blend for soft petal depth
      return {
        layer1: (
          <>
            <div className="absolute inset-0 w-full" style={{ height: '300vh' }}>
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '2vh', left: '-5vw', width: '55vw', maxWidth: '640px', mixBlendMode: 'multiply', opacity: 0.55 }} />
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '140vh', right: '-8vw', width: '50vw', maxWidth: '580px', mixBlendMode: 'multiply', opacity: 0.40, transform: 'rotate(180deg) scaleX(-1)' }} />
            </div>
            <div className="absolute w-full" style={{ top: '300vh', height: '600vh' }}>
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '50vh', left: '-5vw', width: '48vw', maxWidth: '560px', mixBlendMode: 'multiply', opacity: 0.45, transform: 'scaleX(-1)' }} />
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '350vh', right: '-6vw', width: '52vw', maxWidth: '600px', mixBlendMode: 'multiply', opacity: 0.38, transform: 'rotate(90deg)' }} />
            </div>
          </>
        ),
        layer2: (
          <div className="absolute inset-0 w-full" style={{ height: '900vh' }}>
            <img src={assets.layer2} alt="" className="absolute pointer-events-none select-none"
              style={{ top: '35vh', right: '2vw', width: '35vw', maxWidth: '400px', mixBlendMode: 'multiply', opacity: 0.65 }} />
            <img src={assets.layer2} alt="" className="absolute pointer-events-none select-none"
              style={{ top: '310vh', left: '3vw', width: '30vw', maxWidth: '360px', mixBlendMode: 'multiply', opacity: 0.55, transform: 'scaleX(-1) rotate(-15deg)' }} />
            <img src={assets.layer2} alt="" className="absolute pointer-events-none select-none"
              style={{ top: '600vh', right: '5vw', width: '32vw', maxWidth: '380px', mixBlendMode: 'multiply', opacity: 0.50, transform: 'rotate(20deg)' }} />
          </div>
        ),
        layer3: (
          <div className="absolute inset-0 w-full" style={{ height: '900vh' }}>
            <img src={assets.layer3} alt="" className="absolute pointer-events-none select-none animate-[float_10s_ease-in-out_infinite]"
              style={{ top: '60vh', left: '10vw', width: '40vw', maxWidth: '460px', mixBlendMode: 'multiply', opacity: 0.40 }} />
            <img src={assets.layer3} alt="" className="absolute pointer-events-none select-none animate-[float_8s_ease-in-out_infinite_2s]"
              style={{ top: '450vh', right: '8vw', width: '38vw', maxWidth: '440px', mixBlendMode: 'multiply', opacity: 0.35, transform: 'scaleX(-1)' }} />
          </div>
        ),
      };

    case 'ivory-editorial':
    case 'editorial':
    default:
      // Warm ivory/champagne — multiply blend for elegant paper layering
      return {
        layer1: (
          <>
            <div className="absolute inset-0 w-full" style={{ height: '350vh' }}>
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '0', left: '-4vw', width: '58vw', maxWidth: '680px', mixBlendMode: 'multiply', opacity: 0.35 }} />
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '190vh', right: '-6vw', width: '54vw', maxWidth: '640px', mixBlendMode: 'multiply', opacity: 0.26, transform: 'rotate(180deg) scaleX(-1)' }} />
            </div>
            <div className="absolute w-full" style={{ top: '350vh', height: '550vh' }}>
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '60vh', left: '-5vw', width: '52vw', maxWidth: '620px', mixBlendMode: 'multiply', opacity: 0.26, transform: 'scaleX(-1) rotate(15deg)' }} />
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '290vh', right: '-5vw', width: '50vw', maxWidth: '600px', mixBlendMode: 'multiply', opacity: 0.20, transform: 'rotate(-20deg)' }} />
            </div>
          </>
        ),
        layer2: (
          <div className="absolute inset-0 w-full" style={{ height: '900vh' }}>
            <img src={assets.layer2} alt="" className="absolute pointer-events-none select-none"
              style={{ top: '40vh', right: '2vw', width: '38vw', maxWidth: '440px', mixBlendMode: 'multiply', opacity: 0.38 }} />
            <img src={assets.layer2} alt="" className="absolute pointer-events-none select-none"
              style={{ top: '320vh', left: '3vw', width: '34vw', maxWidth: '400px', mixBlendMode: 'multiply', opacity: 0.30, transform: 'scaleX(-1) rotate(-10deg)' }} />
            <img src={assets.layer2} alt="" className="absolute pointer-events-none select-none"
              style={{ top: '640vh', right: '4vw', width: '36vw', maxWidth: '420px', mixBlendMode: 'multiply', opacity: 0.26, transform: 'rotate(15deg)' }} />
          </div>
        ),
        layer3: (
          <div className="absolute inset-0 w-full" style={{ height: '900vh' }}>
            <img src={assets.layer3} alt="" className="absolute pointer-events-none select-none animate-[float_10s_ease-in-out_infinite]"
              style={{ top: '70vh', left: '8vw', width: '42vw', maxWidth: '500px', mixBlendMode: 'multiply', opacity: 0.26 }} />
            <img src={assets.layer3} alt="" className="absolute pointer-events-none select-none animate-[float_8s_ease-in-out_infinite_1.5s]"
              style={{ top: '380vh', right: '6vw', width: '40vw', maxWidth: '480px', mixBlendMode: 'multiply', opacity: 0.22, transform: 'scaleX(-1)' }} />
            <img src={assets.layer3} alt="" className="absolute pointer-events-none select-none animate-[float_12s_ease-in-out_infinite_3s]"
              style={{ top: '720vh', left: '12vw', width: '38vw', maxWidth: '460px', mixBlendMode: 'multiply', opacity: 0.18, transform: 'rotate(10deg)' }} />
          </div>
        ),
      };
  }
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface MultilayerBackgroundProps {
  theme: Theme;
}

export default function MultilayerBackground({ theme }: MultilayerBackgroundProps) {
  // V2 theme — available because MultilayerBackground renders inside ThemeProviderV2
  const themeV2 = useThemeV2();
  const bgAssets = resolveThemeBackgroundAssets(themeV2);
  const layerContent = buildLayerContent(themeV2.id, bgAssets);

  const [isMobile, setIsMobile] = useState(true);

  // Scroll tracking
  const { scrollY } = useScroll();

  // Mouse position tracking (for 3D mouse parallax on desktop)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Springs for smooth cursor tracking
  const springConfig = { damping: 30, stiffness: 120 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  // Mouse offsets for different layers
  const mouseXOffset1 = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15]);
  const mouseYOffset1 = useTransform(mouseYSpring, [-0.5, 0.5], [-15, 15]);

  const mouseXOffset2 = useTransform(mouseXSpring, [-0.5, 0.5], [-35, 35]);
  const mouseYOffset2 = useTransform(mouseYSpring, [-0.5, 0.5], [-35, 35]);

  const mouseXOffset3 = useTransform(mouseXSpring, [-0.5, 0.5], [-60, 60]);
  const mouseYOffset3 = useTransform(mouseYSpring, [-0.5, 0.5], [-60, 60]);

  // Combine scroll Y and mouse move offsets for each depth layer
  // Layer 1: Deep Slow background (0.04x scroll speed)
  const yLayer1 = useTransform([scrollY, mouseYOffset1], ([s, m]) => {
    const scrollFactor = isMobile ? -0.02 : -0.04;
    return scrollFactor * (s as number) + (m as number);
  });
  const xLayer1 = mouseXOffset1;

  // Layer 2: Midground details (0.1x scroll speed)
  const yLayer2 = useTransform([scrollY, mouseYOffset2], ([s, m]) => {
    const scrollFactor = isMobile ? -0.05 : -0.1;
    return scrollFactor * (s as number) + (m as number);
  });
  const xLayer2 = mouseXOffset2;

  // Layer 3: Faster foreground drifting elements (0.2x scroll speed)
  const yLayer3 = useTransform([scrollY, mouseYOffset3], ([s, m]) => {
    const scrollFactor = isMobile ? -0.1 : -0.2;
    return scrollFactor * (s as number) + (m as number);
  });
  const xLayer3 = mouseXOffset3;

  // Detect mobile user agents and screen widths to disable heavy effects
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return; // Disable mouse tracking on mobile
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) - 0.5;
      const y = (e.clientY / innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
  <>
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-[-10]">
      {/* 0. Viewport-fixed Ambient Glow Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-20]">
        {/* Base gradient — V2 background-main token with v1 fallback */}
        <div
          className="absolute inset-0 transition-colors duration-1000"
          style={{ background: `var(--v2-background-main, ${theme.backgrounds.main || theme.bgSolid || 'transparent'})` }}
        />

        {/* Subtle radial center brightening (makes content area feel lit) */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 20%, var(--v2-color-overlay, ${theme.colors.overlay || 'rgba(255,252,248,0.28)'}) 0%, transparent 70%)`,
          }}
        />

        {/* Premium Ambient Glows — driven by V1 theme.bgGlows */}
        {theme.bgGlows && theme.bgGlows.length >= 3 && (
          <>
            {/* Glow 1: warm — top-left atmospheric wash */}
            <div
              className="absolute top-[-18%] left-[-12%] w-[70%] h-[65%] rounded-full animate-glow-slow-1 transition-all duration-1000"
              style={{
                backgroundColor: theme.bgGlows[0],
                filter: 'blur(110px)',
                opacity: 0.12,
                mixBlendMode: 'multiply',
              }}
            />
            {/* Glow 2: deep — bottom-right counterweight */}
            <div
              className="absolute bottom-[5%] right-[-14%] w-[65%] h-[65%] rounded-full animate-glow-slow-2 transition-all duration-1000"
              style={{
                backgroundColor: theme.bgGlows[1],
                filter: 'blur(130px)',
                opacity: 0.10,
                mixBlendMode: 'multiply',
              }}
            />
            {/* Glow 3: accent — center */}
            <div
              className="absolute top-[35%] left-[25%] w-[55%] h-[50%] rounded-full animate-glow-slow-3 transition-all duration-1000"
              style={{
                backgroundColor: theme.bgGlows[2],
                filter: 'blur(120px)',
                opacity: 0.07,
                mixBlendMode: 'multiply',
              }}
            />
            {/* Glow 4: soft white highlight — top-center bloom */}
            <div
              className="absolute top-[-5%] left-[20%] w-[60%] h-[40%] rounded-full"
              style={{
                background: 'rgba(255, 252, 246, 0.20)',
                filter: 'blur(90px)',
              }}
            />
          </>
        )}

        {/* Edge vignette — frames the page with depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 120% 100% at 50% 50%,
                transparent 55%,
                var(--v2-color-accent-soft, ${theme.colors.accentSoft || 'rgba(180, 148, 100, 0.07)'}) 80%,
                var(--v2-color-accent-soft, ${theme.colors.accentSoft || 'rgba(160, 128, 80, 0.13)'}) 100%
              )
            `,
          }}
        />
      </div>

      {/* 1. Parallax Layer 1 — deep/slow (0.04× scroll + mouse depth 1) */}
      <motion.div
        className="invitation-bg-layer invitation-bg-layer-1"
        aria-hidden="true"
        style={{ x: xLayer1, y: yLayer1, position: 'absolute', inset: 0, pointerEvents: 'none', willChange: isMobile ? 'auto' : 'transform' }}
      >
        {layerContent.layer1}
      </motion.div>

      {/* 2. Parallax Layer 2 — midground (0.1× scroll + mouse depth 2) */}
      <motion.div
        className="invitation-bg-layer invitation-bg-layer-2"
        aria-hidden="true"
        style={{ x: xLayer2, y: yLayer2, position: 'absolute', inset: 0, pointerEvents: 'none', willChange: isMobile ? 'auto' : 'transform' }}
      >
        {layerContent.layer2}
      </motion.div>

      {/* 3. Parallax Layer 3 — foreground drift (0.2× scroll + mouse depth 3) */}
      <motion.div
        className="invitation-bg-layer invitation-bg-layer-3"
        aria-hidden="true"
        style={{ x: xLayer3, y: yLayer3, position: 'absolute', inset: 0, pointerEvents: 'none', willChange: isMobile ? 'auto' : 'transform' }}
      >
        {layerContent.layer3}
      </motion.div>
    </div>

    {/* Floating hearts — driven by V2 theme particles flag */}
    {themeV2.effects.particles && <FloatingHearts />}

  </>
  );
}

/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';

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
      alpha: 0.03 + Math.random() * 0.05,
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
        position: 'absolute', inset: 0,
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

// ─── GOLDEN WEDDING RINGS WATERMARK ──────────────────────────────────────────
function GoldenWeddingRings({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 200 120"
      className={className}
      style={{
        width: '320px',
        height: '200px',
        color: 'var(--v2-color-accent, #C8A75D)',
        ...style,
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ringGold" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DFBA73" />
          <stop offset="50%" stopColor="#C8A75D" />
          <stop offset="100%" stopColor="#9E7D3B" />
        </linearGradient>
        <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g transform="rotate(-12 70 60)">
        <circle cx="70" cy="60" r="42" stroke="url(#ringGold)" strokeWidth="5.5" filter="url(#ringGlow)" opacity="0.8" />
        <circle cx="70" cy="60" r="42" stroke="#FFF" strokeWidth="1" opacity="0.3" />
      </g>
      <g transform="rotate(12 130 60)">
        <circle cx="130" cy="60" r="42" stroke="url(#ringGold)" strokeWidth="5.5" filter="url(#ringGlow)" opacity="0.8" />
        <circle cx="130" cy="60" r="42" stroke="#FFF" strokeWidth="1" opacity="0.3" />
      </g>
      <path d="M95,25 Q95,35 105,35 Q95,35 95,45 Q95,35 85,35 Q95,35 95,25 Z" fill="#FFF" opacity="0.9" />
      <circle cx="95" cy="35" r="2" fill="#DFBA73" />
      <path d="M145,85 Q145,92 152,92 Q145,92 145,99 Q145,92 138,92 Q145,92 145,85 Z" fill="#FFF" opacity="0.8" />
      <path d="M50,80 Q50,85 55,85 Q50,85 50,90 Q50,85 45,85 Q50,85 50,80 Z" fill="#FFF" opacity="0.7" />
    </svg>
  );
}

// ─── GOLDEN FLORAL CORNER ORNAMENT ───────────────────────────────────────────
function GoldenFloralCorner({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 150 150"
      className={className}
      style={{
        width: '160px',
        height: '160px',
        color: 'var(--v2-color-accent, #C8A75D)',
        ...style,
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cornerGold" x1="0" y1="0" x2="150" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DFBA73" />
          <stop offset="100%" stopColor="#A88744" />
        </linearGradient>
      </defs>
      <path d="M10,140 L10,10 L140,10" stroke="url(#cornerGold)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <path d="M20,130 C20,60 60,20 130,20" stroke="url(#cornerGold)" strokeWidth="1.5" opacity="0.6" />
      <path d="M30,120 C30,70 70,30 120,30" stroke="url(#cornerGold)" strokeWidth="0.8" opacity="0.4" />
      
      <g transform="translate(25, 25)" stroke="url(#cornerGold)" strokeWidth="1.5">
        <circle cx="0" cy="0" r="14" strokeWidth="1" fill="rgba(255,250,238,0.7)" />
        <path d="M-8,-8 C-4,-14 4,-14 8,-8" fill="none" />
        <path d="M8,-8 C14,-4 14,4 8,8" fill="none" />
        <path d="M8,8 C4,14 -4,14 -8,8" fill="none" />
        <path d="M-8,8 C-14,4 -14,-4 -8,-8" fill="none" />
        <circle cx="0" cy="0" r="6" fill="none" />
        <path d="M-2,-2 C0,-4 2,-4 2,-2 C2,0 0,2 -2,2" fill="none" />
      </g>
      
      <g transform="translate(75, 20) scale(0.7)" stroke="url(#cornerGold)" strokeWidth="1.2">
        <circle cx="0" cy="0" r="10" fill="rgba(255,250,238,0.5)" />
        <path d="M-6,-6 C-3,-10 3,-10 6,-6 C10,-3 10,3 6,6 C3,10 -3,10 -6,6 C-10,3 -10,-3 -6,-6 Z" fill="none" />
      </g>
      
      <g transform="translate(20, 75) scale(0.7)" stroke="url(#cornerGold)" strokeWidth="1.2">
        <circle cx="0" cy="0" r="10" fill="rgba(255,250,238,0.5)" />
        <path d="M-6,-6 C-3,-10 3,-10 6,-6 C10,-3 10,3 6,6 C3,10 -3,10 -6,6 C-10,3 -10,-3 -6,-6 Z" fill="none" />
      </g>
      
      <path d="M25,39 C25,60 40,80 60,90" stroke="url(#cornerGold)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <path d="M39,25 C60,25 80,40 90,60" stroke="url(#cornerGold)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      
      <path d="M60,90 C62,82 70,80 75,85 C70,90 65,92 60,90 Z" fill="url(#cornerGold)" opacity="0.7" />
      <path d="M90,60 C82,62 80,70 85,75 C90,70 92,65 90,60 Z" fill="url(#cornerGold)" opacity="0.7" />
      <path d="M110,15 C115,10 125,12 130,8" stroke="url(#cornerGold)" strokeWidth="1" opacity="0.6" />
      <path d="M15,110 C10,115 12,125 8,130" stroke="url(#cornerGold)" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

// ─── GOLDEN LAUREL/OLIVE BRANCH ORNAMENT ─────────────────────────────────────
function GoldenBranch({ className, style, flipped = false }: { className?: string; style?: React.CSSProperties; flipped?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 200"
      className={className}
      style={{
        width: '100px',
        height: '200px',
        color: 'var(--v2-color-accent, #C8A75D)',
        transform: flipped ? 'scaleX(-1)' : undefined,
        ...style,
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="branchGold" x1="0" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DFBA73" />
          <stop offset="100%" stopColor="#9E7D3B" />
        </linearGradient>
      </defs>
      <path d="M15,190 Q30,120 20,10 Q25,80 60,40" stroke="url(#branchGold)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      
      <path d="M19,160 C25,155 35,158 38,152 C32,158 25,162 19,160 Z" fill="url(#branchGold)" opacity="0.6" />
      <path d="M19,160 C12,158 5,162 2,156 C8,154 15,157 19,160 Z" fill="url(#branchGold)" opacity="0.6" />
      
      <path d="M22,125 C30,118 42,120 45,112 C38,120 30,125 22,125 Z" fill="url(#branchGold)" opacity="0.7" />
      <path d="M22,125 C14,121 6,128 2,122 C9,118 16,121 22,125 Z" fill="url(#branchGold)" opacity="0.6" />
      
      <path d="M22,90 C32,82 42,85 46,78 C38,85 30,90 22,90 Z" fill="url(#branchGold)" opacity="0.7" />
      <path d="M22,90 C14,85 8,92 3,86 C10,82 17,85 22,90 Z" fill="url(#branchGold)" opacity="0.6" />
      
      <path d="M20,55 C30,47 38,50 42,42 C34,50 28,55 20,55 Z" fill="url(#branchGold)" opacity="0.8" />
      <path d="M20,55 C12,50 8,57 2,51 C9,48 15,51 20,55 Z" fill="url(#branchGold)" opacity="0.7" />
      
      <path d="M20,10 C24,5 23,-5 19,-8 C15,-4 16,5 20,10 Z" fill="url(#branchGold)" opacity="0.8" />
      
      <circle cx="45" cy="112" r="1.5" fill="#FFF" opacity="0.7" />
      <circle cx="5" cy="51" r="1" fill="#FFF" opacity="0.6" />
    </svg>
  );
}

// ─── FLORAL SILHOUETTE OVERLAY ────────────────────────────────────────────────
function FloralOverlay({ className, style, position = 'top-left' }: { className?: string; style?: React.CSSProperties; position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  let transform = '';
  if (position === 'top-right') transform = 'scaleX(-1)';
  else if (position === 'bottom-left') transform = 'scaleY(-1)';
  else if (position === 'bottom-right') transform = 'scale(-1)';

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={{
        width: '280px',
        height: '280px',
        color: 'var(--v2-color-accent, #C8A75D)',
        transform,
        opacity: 0.15,
        ...style,
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0,0 C40,10 70,30 90,60 C100,80 90,110 70,120 C50,130 20,110 10,80 C5,60 15,30 0,0 Z" fill="rgba(200, 167, 93, 0.035)" />
      <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="6" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
      
      <path d="M50,38 C56,26 68,26 74,38" stroke="currentColor" strokeWidth="1" fill="rgba(255,250,238,0.3)" />
      <path d="M62,50 C74,56 74,68 62,74" stroke="currentColor" strokeWidth="1" fill="rgba(255,250,238,0.3)" />
      <path d="M50,62 C44,74 32,74 26,62" stroke="currentColor" strokeWidth="1" fill="rgba(255,250,238,0.3)" />
      <path d="M38,50 C26,44 26,32 38,26" stroke="currentColor" strokeWidth="1" fill="rgba(255,250,238,0.3)" />
      
      <path d="M58,42 C68,34 76,42 68,52" stroke="currentColor" strokeWidth="0.8" />
      <path d="M58,58 C68,68 76,58 68,48" stroke="currentColor" strokeWidth="0.8" />
      <path d="M42,58 C32,68 24,58 32,48" stroke="currentColor" strokeWidth="0.8" />
      <path d="M42,42 C32,34 24,42 32,52" stroke="currentColor" strokeWidth="0.8" />
      
      <path d="M50,62 C60,90 90,110 120,110" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M62,50 C90,60 110,90 110,120" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      
      <path d="M90,85 C100,80 115,82 120,75 C112,85 100,90 90,85 Z" fill="currentColor" opacity="0.4" />
      <path d="M90,85 C80,95 82,110 75,115 C85,107 90,95 90,85 Z" fill="currentColor" opacity="0.4" />
      <path d="M105,100 C115,95 130,97 135,90 C127,100 115,105 105,100 Z" fill="currentColor" opacity="0.3" />
      
      <path d="M120,110 C125,105 132,105 135,110 C132,115 125,115 120,110 Z" fill="currentColor" opacity="0.5" />
      <path d="M135,110 L145,110" stroke="currentColor" strokeWidth="0.8" />
      
      <path d="M20,80 A50,50 0 0,0 80,140" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 4" />
      <path d="M30,90 A40,40 0 0,0 90,150" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 4" />
    </svg>
  );
}

// ─── V2 LAYER CONTENT ─────────────────────────────────────────────────────────
function buildLayerContent(
  themeId: ThemeIdV2,
  assets: ThemeBackgroundAssets
): { layer1: React.ReactNode; layer2: React.ReactNode; layer3: React.ReactNode } {

  switch (themeId) {

    case 'luxury-gold':
      return { layer1: <></>, layer2: <></>, layer3: <></> };

    case 'modern-dark':
      return { layer1: <></>, layer2: <></>, layer3: <></> };

    case 'floral':
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

    case 'luxury-champagne':
      return {
        layer1: (
          <>
            <div className="absolute inset-0 w-full" style={{ height: '300vh' }}>
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '5vh', left: '-4vw', width: '50vw', maxWidth: '580px', mixBlendMode: 'multiply', opacity: 0.45 }} />
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '150vh', right: '-6vw', width: '46vw', maxWidth: '540px', mixBlendMode: 'multiply', opacity: 0.35, transform: 'rotate(180deg) scaleX(-1)' }} />
            </div>
            <div className="absolute w-full" style={{ top: '300vh', height: '700vh' }}>
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '80vh', left: '-4vw', width: '44vw', maxWidth: '520px', mixBlendMode: 'multiply', opacity: 0.38, transform: 'scaleX(-1)' }} />
              <img src={assets.layer1} alt="" className="absolute pointer-events-none select-none"
                style={{ top: '400vh', right: '-5vw', width: '48vw', maxWidth: '560px', mixBlendMode: 'multiply', opacity: 0.32, transform: 'rotate(90deg)' }} />
            </div>
          </>
        ),
        layer2: (
          <div className="absolute inset-0 w-full" style={{ height: '1000vh' }}>
            <img src={assets.layer2} alt="" className="absolute pointer-events-none select-none"
              style={{ top: '40vh', right: '1vw', width: '32vw', maxWidth: '380px', mixBlendMode: 'multiply', opacity: 0.55 }} />
            <img src={assets.layer2} alt="" className="absolute pointer-events-none select-none"
              style={{ top: '330vh', left: '2vw', width: '28vw', maxWidth: '340px', mixBlendMode: 'multiply', opacity: 0.45, transform: 'scaleX(-1)' }} />
            <img src={assets.layer2} alt="" className="absolute pointer-events-none select-none"
              style={{ top: '650vh', right: '4vw', width: '30vw', maxWidth: '360px', mixBlendMode: 'multiply', opacity: 0.42 }} />
          </div>
        ),
        layer3: (
          <div className="absolute inset-0 w-full" style={{ height: '1000vh' }}>
            <img src={assets.layer3} alt="" className="absolute pointer-events-none select-none animate-[float_12s_ease-in-out_infinite]"
              style={{ top: '80vh', left: '8vw', width: '36vw', maxWidth: '420px', mixBlendMode: 'multiply', opacity: 0.30 }} />
            <img src={assets.layer3} alt="" className="absolute pointer-events-none select-none animate-[float_9s_ease-in-out_infinite_3s]"
              style={{ top: '480vh', right: '6vw', width: '34vw', maxWidth: '400px', mixBlendMode: 'multiply', opacity: 0.25, transform: 'scaleX(-1)' }} />
          </div>
        ),
      };

    case 'pastel-rose-editorial':
    case 'pastel-sage-editorial':
    case 'pastel-sky-editorial':
      return { layer1: <></>, layer2: <></>, layer3: <></> };

    case 'ivory-editorial':
    case 'editorial':
    default:
      return {
        layer1: (
          <>
            {/* Centered Golden Wedding Rings watermarks in background layer 1 (slow parallax) */}
            <div className="absolute inset-0 w-full pointer-events-none select-none" style={{ height: '1000vh' }}>
              <GoldenWeddingRings
                className="absolute left-1/2 -translate-x-1/2 opacity-[0.05] md:opacity-[0.07]"
                style={{ top: '130vh' }}
              />
              <GoldenWeddingRings
                className="absolute left-1/2 -translate-x-1/2 opacity-[0.05] md:opacity-[0.07]"
                style={{ top: '440vh' }}
              />
              <GoldenWeddingRings
                className="absolute left-1/2 -translate-x-1/2 opacity-[0.05] md:opacity-[0.07]"
                style={{ top: '760vh' }}
              />

              {/* Large soft floral overlays in background */}
              <FloralOverlay className="absolute left-[2vw] opacity-[0.035]" style={{ top: '70vh' }} position="top-left" />
              <FloralOverlay className="absolute right-[2vw] opacity-[0.025]" style={{ top: '280vh' }} position="top-right" />
              <FloralOverlay className="absolute left-[3vw] opacity-[0.03]" style={{ top: '600vh' }} position="bottom-left" />
              <FloralOverlay className="absolute right-[2vw] opacity-[0.02]" style={{ top: '880vh' }} position="bottom-right" />
            </div>
          </>
        ),
        layer2: (
          <div className="absolute inset-0 w-full pointer-events-none select-none" style={{ height: '1000vh' }}>
            {/* Alternating Golden Laurel Branches along the sides in layer 2 */}
            <GoldenBranch className="absolute left-0 opacity-[0.14] md:opacity-[0.20]" style={{ top: '90vh' }} />
            <GoldenBranch className="absolute right-0 opacity-[0.14] md:opacity-[0.20]" style={{ top: '200vh' }} flipped />
            <GoldenBranch className="absolute left-0 opacity-[0.14] md:opacity-[0.20]" style={{ top: '310vh' }} flipped />
            <GoldenBranch className="absolute right-0 opacity-[0.14] md:opacity-[0.20]" style={{ top: '450vh' }} />
            <GoldenBranch className="absolute left-0 opacity-[0.14] md:opacity-[0.20]" style={{ top: '580vh' }} />
            <GoldenBranch className="absolute right-0 opacity-[0.14] md:opacity-[0.20]" style={{ top: '700vh' }} flipped />
            <GoldenBranch className="absolute left-0 opacity-[0.14] md:opacity-[0.20]" style={{ top: '820vh' }} />
            <GoldenBranch className="absolute right-0 opacity-[0.14] md:opacity-[0.20]" style={{ top: '930vh' }} flipped />

            {/* Golden Floral Corners to frame major transitions */}
            <GoldenFloralCorner className="absolute left-0 opacity-[0.18]" style={{ top: '10vh' }} />
            <GoldenFloralCorner className="absolute right-0 opacity-[0.18]" style={{ top: '10vh', transform: 'scaleX(-1)' }} />
            <GoldenFloralCorner className="absolute left-0 opacity-[0.12]" style={{ top: '260vh' }} />
            <GoldenFloralCorner className="absolute right-0 opacity-[0.12]" style={{ top: '510vh', transform: 'scaleX(-1)' }} />
            <GoldenFloralCorner className="absolute left-0 opacity-[0.15]" style={{ top: '800vh' }} />
          </div>
        ),
        layer3: <></>,
      };
  }
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface MultilayerBackgroundProps {
  theme: Theme;
  children?: React.ReactNode;
}

export default function MultilayerBackground({ theme, children }: MultilayerBackgroundProps) {
  const themeV2 = useThemeV2();
  const bgAssets = resolveThemeBackgroundAssets(themeV2);
  const layerContent = buildLayerContent(themeV2.id, bgAssets);



  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* Texture post-hero — only when theme requests it (not rendered in InvitationRenderer) */}
      {!!themeV2.assets?.texture && themeV2.assets.textureStartAfterHero && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${themeV2.assets.texture})`,
            backgroundSize: themeV2.assets.textureSize ?? '100% auto',
            backgroundPosition: 'top center',
            backgroundRepeat: themeV2.assets.textureRepeat ?? 'repeat-y',
            opacity: themeV2.assets.textureOpacity ?? 0.35,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* 0. Section-scoped Ambient Glow Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Base gradient — transparent for ivory-editorial (fondo único on root wrapper) */}
        <div
          className="absolute inset-0 transition-colors duration-1000"
          style={{
            background: (themeV2.id === 'ivory-editorial' || themeV2.id === 'editorial')
              ? 'transparent'
              : `var(--v2-background-main, ${theme.backgrounds.main || theme.bgSolid || 'transparent'})`,
          }}
        />

        {/* Paper texture — disabled for ivory-editorial (fondo único handles it) */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage: (themeV2.id === 'ivory-editorial' || themeV2.id === 'editorial')
              ? 'none'
              : 'var(--kompralo-invitation-paper-bg)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll',
            backgroundPosition: 'center top',
          }}
        />

        {/* Subtle radial center brightening (makes content area feel lit) */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 20%, var(--v2-color-overlay, ${theme.colors.overlay || 'rgba(255,252,248,0.28)'}) 0%, transparent 70%)`,
          }}
        />

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
      {/* 1. Static Layer 1 */}
      <div
        className="invitation-bg-layer invitation-bg-layer-1"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      >
        {layerContent.layer1}
      </div>

      {/* 2. Static Layer 2 */}
      <div
        className="invitation-bg-layer invitation-bg-layer-2"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      >
        {layerContent.layer2}
      </div>

      {/* 3. Static Layer 3 */}
      <div
        className="invitation-bg-layer invitation-bg-layer-3"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      >
        {layerContent.layer3}
      </div>
      {themeV2.effects.particles && <FloatingHearts />}
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

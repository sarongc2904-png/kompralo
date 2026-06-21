'use client';

import React, { useRef, useEffect } from 'react';
import { Theme } from '@/domain/themes/types';
import { InvitationProtagonist } from '@/domain/invitations/types';
import { Sparkles } from 'lucide-react';
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FinalMessageProps {
  protagonists?: InvitationProtagonist[];
  brideName?: string;
  groomName?: string;
  quote?: string;
  imageUrl?: string;
  theme: Theme;
}

// Calligraphic SVG paths for each letter — hand-drawn feel
// We use a single <path> per name as a stroke-draw animation
function SignatureSVG({
  name,
  delay = 0,
  color = '#1a1a1a',
}: {
  name: string;
  delay?: number;
  color?: string;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isInView = useInView(svgRef, { once: true, margin: '-10% 0px' });

  useEffect(() => {
    if (!pathRef.current || !isInView) return;
    const length = pathRef.current.getTotalLength();
    gsap.set(pathRef.current, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 1,
    });
    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 2.2,
      delay,
      ease: 'power2.inOut',
    });
  }, [isInView, delay]);

  // Generate a stylized cursive-like path for the name using letter-spaced control points
  // We use viewBox wide enough to fit the name text rendered via SVG <text> with font, then use
  // a single flowing organic SVG path to simulate calligraphy per name.
  // Since actual font outline extraction is complex, we use a stroke-animated text approach:
  const chars = name.length;
  const vbWidth = Math.max(160, chars * 38);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${vbWidth} 80`}
      className="w-full h-full overflow-visible"
      style={{ maxWidth: `${vbWidth * 2}px` }}
      aria-label={name}
    >
      {/* Invisible filled text as baseline shape reference (visible after stroke draw) */}
      <text
        x="50%"
        y="62"
        textAnchor="middle"
        fontFamily="var(--font-calligraphy), 'Pinyon Script', cursive"
        fontSize="58"
        fill={color}
        opacity="0"
        className="select-none"
      >
        {name}
      </text>
      {/* Stroke-draw animated text (same font, no fill, stroke only during draw then fill fades in) */}
      <text
        ref={pathRef as unknown as React.RefObject<SVGTextElement>}
        x="50%"
        y="62"
        textAnchor="middle"
        fontFamily="var(--font-calligraphy), 'Pinyon Script', cursive"
        fontSize="58"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        opacity="0"
        className="select-none"
        style={{ strokeDasharray: 9999, strokeDashoffset: 9999 }}
      >
        {name}
      </text>
    </svg>
  );
}

// GSAP approach: animate strokeDashoffset on a <text> SVG element as signature reveal
function SignatureReveal({
  name,
  delay = 0,
  color = '#1a1a1a',
  accentColor = '#C5A880',
}: {
  name: string;
  delay?: number;
  color?: string;
  accentColor?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const fillTextRef = useRef<SVGTextElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-5% 0px' });

  const chars = name.length;
  const vbWidth = Math.max(160, chars * 42);

  useEffect(() => {
    if (!textRef.current || !fillTextRef.current || !isInView) return;

    const el = textRef.current;
    const fillEl = fillTextRef.current;

    // Approximate stroke length based on character count (works well for calligraphy fonts)
    const approxLen = chars * 220;

    gsap.set(el, {
      strokeDasharray: approxLen,
      strokeDashoffset: approxLen,
      opacity: 1,
    });
    gsap.set(fillEl, { opacity: 0 });

    const tl = gsap.timeline({ delay });

    // 1. Draw the stroke (signature draw)
    tl.to(el, {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: 'power2.inOut',
    });

    // 2. Fade out stroke, fade in fill (ink settles)
    tl.to(el, { opacity: 0, duration: 0.5, ease: 'power1.in' }, '-=0.3');
    tl.to(fillEl, { opacity: 1, duration: 0.5, ease: 'power1.out' }, '<');

    return () => {
      tl.kill();
    };
  }, [isInView, delay, chars]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ minWidth: 0, flex: 1 }}
    >
      <svg
        viewBox={`0 0 ${vbWidth} 90`}
        className="w-full overflow-visible"
        style={{ maxWidth: `${Math.min(vbWidth * 2.2, 420)}px`, height: '90px' }}
        aria-label={name}
      >
        {/* Final filled version (fades in after stroke draw) */}
        <text
          ref={fillTextRef}
          x="50%"
          y="68"
          textAnchor="middle"
          fontFamily="var(--font-calligraphy), 'Pinyon Script', cursive"
          fontSize="64"
          fill={color}
          opacity="0"
          className="select-none"
          style={{ filter: `drop-shadow(0 0 8px ${accentColor}22)` }}
        >
          {name}
        </text>
        {/* Stroke-draw animated text */}
        <text
          ref={textRef}
          x="50%"
          y="68"
          textAnchor="middle"
          fontFamily="var(--font-calligraphy), 'Pinyon Script', cursive"
          fontSize="64"
          fill="none"
          stroke={color}
          strokeWidth="1.4"
          opacity="0"
          className="select-none"
        >
          {name}
        </text>
      </svg>
    </div>
  );
}

export default function FinalMessage({ protagonists, brideName, groomName, quote, imageUrl, theme }: FinalMessageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef      = useRef<HTMLDivElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);
  const primaryName = protagonists?.[0]?.name ?? brideName ?? '';
  const secondaryName = protagonists?.[1]?.name ?? groomName ?? '';
  const closingQuote = quote ?? 'Sin ti este día no estaría completo. Te esperamos con los brazos abiertos para celebrar la vida, el amor y el inicio de nuestra historia.';

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const smooth  = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const imgY    = useTransform(smooth, [0, 1], ['-12%', '12%']);
  const contentY = useTransform(smooth, [0, 1], ['6%', '-6%']);

  // GSAP ScrollTrigger for section background depth parallax
  useEffect(() => {
    if (!bgRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Depth atmosphere shift on scroll into final section
      gsap.fromTo(
        bgRef.current,
        { scale: 1.08, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'top 20%',
            scrub: false,
            once: true,
          },
        }
      );

      // Floating depth particles inside final section
      gsap.utils.toArray<HTMLElement>('.final-depth-particle').forEach((el, i) => {
        gsap.to(el, {
          y: `${-30 - i * 10}px`,
          x: `${(i % 2 === 0 ? 1 : -1) * (15 + i * 5)}px`,
          opacity: 0.12 + i * 0.04,
          duration: 3 + i * 0.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // When there's a photo the text goes over a dark overlay → use white
  const textColor    = imageUrl ? '#FAF6EE' : 'var(--v2-color-text-primary, #1F1A16)';
  // V2: accent color comes from the CSS var injected by ThemeProviderV2.
  // Falls back to the champagne gold for contexts without ThemeProviderV2.
  const accentColor  = imageUrl ? 'var(--v2-color-accent, #D4B870)' : 'var(--v2-color-accent, #C5A880)';
  const quoteClass   = imageUrl ? 'text-[#FAF6EE]/95' : 'text-stone-800';

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-36 px-6 md:px-8 text-center select-none overflow-hidden"
    >
      {/* Background photo — parallax */}
      {imageUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            ref={imgRef}
            style={{ y: imgY, position: 'absolute', top: '-15%', left: 0, right: 0, bottom: '-15%' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              aria-hidden="true"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.48) saturate(0.85)' }}
            />
          </motion.div>
          {/* Gradient overlays */}
          <div className="absolute inset-0 z-10" style={{
            background: `linear-gradient(180deg, var(--v2-background-main, #FBF7EF) 0%, rgba(31,26,22,0.18) 25%, rgba(31,26,22,0.18) 75%, var(--v2-background-main, #FBF7EF) 100%)`,
          }} />
          <div className="absolute inset-0 z-10" style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 25%, rgba(31,26,22,0.4) 100%)',
          }} />
        </div>
      )}

      {/* GSAP 3D Background atmosphere for final section */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none opacity-0"
        style={{ zIndex: 1 }}
      >
        {/* Depth gradient radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 80%, ${accentColor}10 0%, transparent 70%)`,
          }}
        />
        {/* Floating depth particles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="final-depth-particle absolute rounded-full opacity-0"
            style={{
              width: `${8 + i * 4}px`,
              height: `${8 + i * 4}px`,
              backgroundColor: accentColor,
              left: `${15 + i * 17}%`,
              top: `${20 + (i % 3) * 25}%`,
              filter: 'blur(3px)',
            }}
          />
        ))}
        {/* Corner calligraphic flourishes */}
        <svg
          className="absolute top-6 left-6 opacity-10"
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          stroke={accentColor}
          strokeWidth="0.8"
        >
          <path d="M5,75 Q25,55 40,40 Q55,25 75,5" />
          <path d="M5,60 Q20,45 35,35" opacity="0.5" />
          <circle cx="75" cy="5" r="2" fill={accentColor} />
        </svg>
        <svg
          className="absolute top-6 right-6 opacity-10 scale-x-[-1]"
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          stroke={accentColor}
          strokeWidth="0.8"
        >
          <path d="M5,75 Q25,55 40,40 Q55,25 75,5" />
          <path d="M5,60 Q20,45 35,35" opacity="0.5" />
          <circle cx="75" cy="5" r="2" fill={accentColor} />
        </svg>
      </div>

      <motion.div style={{ y: contentY }} className="max-w-2xl mx-auto flex flex-col items-center justify-center relative z-10">

        {/* Subtle decorative icon */}
        <motion.div
          className="mb-8 opacity-40"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 0.4, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Sparkles className="w-6 h-6" style={{ color: 'var(--v2-color-accent, #C8A75D)' }} strokeWidth={1} />
        </motion.div>

        {/* Closing Quote */}
        <motion.blockquote
          className={`font-light italic leading-relaxed mb-10 max-w-lg ${theme.headingFont} ${quoteClass}`}
          style={{ 
            fontSize: 'clamp(1.35rem, 2.5vw + 0.5rem, 2rem)',
            textShadow: imageUrl ? '0 2px 12px rgba(0,0,0,0.4)' : 'none', 
            fontFamily: 'var(--v2-font-heading, inherit)' 
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {closingQuote}
        </motion.blockquote>

        {/* Ornamental Divider */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.8, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center mb-12 text-amber-800/40" 
          style={{ color: imageUrl ? 'var(--v2-color-accent, #FAF6EE)' : 'var(--v2-divider-color, var(--v2-color-accent, inherit))' }}
        >
          <svg className="w-28 h-4" viewBox="0 0 120 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="8" x2="48" y2="8" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
            <path d="M60 3 L64 8 L60 13 L56 8 Z" fill="currentColor" fillOpacity="0.8" />
            <circle cx="52" cy="8" r="1.5" fill="currentColor" fillOpacity="0.5" />
            <circle cx="68" cy="8" r="1.5" fill="currentColor" fillOpacity="0.5" />
            <line x1="72" y1="8" x2="120" y2="8" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
          </svg>
        </motion.div>

        {/* Couples Signatures — SVG stroke-draw handwriting reveal */}
        <div className="flex items-center justify-center gap-4 w-full px-4 overflow-visible">
          <SignatureReveal
            name={primaryName}
            delay={0.8}
            color={textColor}
            accentColor={accentColor}
          />

          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 2.0 }}
            className="flex-shrink-0 text-3xl md:text-4xl font-light"
            style={{ color: accentColor }}
          >
            &
          </motion.span>

          <SignatureReveal
            name={secondaryName}
            delay={2.2}
            color={textColor}
            accentColor={accentColor}
          />
        </div>

        {/* Elegant Footer */}
        <motion.footer
          className={`w-full pt-16 border-t ${imageUrl ? 'border-white/20' : 'border-stone-200'}`}
          style={{ borderColor: imageUrl ? 'rgba(255, 255, 255, 0.15)' : 'var(--v2-color-border, rgba(200, 167, 93, 0.25))' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <p className={`text-[10px] uppercase tracking-[0.25em] opacity-45 font-medium ${theme.bodyFont} ${imageUrl ? 'text-white' : theme.bodyText}`}>
            Creado con{' '}
            <span className="hover:opacity-100 transition-opacity font-semibold tracking-widest cursor-pointer text-[#C5A880]">
              Kompralo
            </span>
          </p>
        </motion.footer>
      </motion.div>
    </section>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '@/domain/themes/types';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InkRevealText from './InkRevealText';
import { ThemeDivider } from '@/components/theme-v2';

interface HorizontalGalleryProps {
  images: string[];
  theme: Theme;
}

interface GalleryImageCardProps {
  img: string;
  index: number;
  theme: Theme;
  hasScrolled: boolean;
}

// Unified Deluxe Responsive Image Card with Viewport Visibility Observer
const GalleryImageCard = ({ img, index, theme, hasScrolled }: GalleryImageCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.25, // Trigger when 25% of the photo is visible
        rootMargin: '0px -60px 0px -60px', // Inward margins for premium focus framing
      }
    );

    const currentCard = cardRef.current;
    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, []);

  // Colored state is active ONLY when the card is in viewport AND the user has started scrolling
  const isColored = isInView && hasScrolled;

  return (
    <div 
      ref={cardRef}
      className="relative flex-shrink-0 w-[82vw] md:w-[450px] h-[380px] md:h-[550px] bg-white p-3 md:p-4 shadow-xl md:shadow-2xl transition-transform duration-[1200ms] ease-out snap-center select-none"
      style={{
        border: `1px solid var(--v2-color-border, ${theme.colors.border})`,
        transform: isColored ? 'scale(1.02)' : 'scale(0.98)',
      }}
    >
      {/* Editorial inner double-frame */}
      <div className="absolute inset-3 md:inset-4 pointer-events-none z-10"
        style={{ border: `1px solid var(--v2-color-border-strong, ${theme.colors.accent})`, opacity: 0.4 }} />
      <div className="absolute inset-4 md:inset-5 pointer-events-none z-10"
        style={{ border: `1px solid var(--v2-color-border, ${theme.colors.border})`, opacity: 0.4 }} />
      
      {/* Photo with smooth luxury grayscale transition */}
      <div className="w-full h-full overflow-hidden relative" style={{ backgroundColor: `var(--v2-color-surface-alt, ${theme.bgSolid ?? '#F8F2E6'})` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={img} 
          alt={`Galería ${index + 1}`} 
          className={`w-full h-full object-cover select-none transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isColored 
              ? 'grayscale-0 contrast-[1.02] brightness-[1] saturate-[1.05]' 
              : 'grayscale contrast-[0.8] brightness-[0.88] saturate-0 opacity-80'
          }`}
        />
        {/* Soft elegant overlay vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none mix-blend-multiply" />
      </div>


      <span className={`absolute bottom-5 md:bottom-6 right-6 md:right-8 text-[10px] md:text-xs font-serif italic opacity-60 ${theme.bodyText}`}>
        N° {index + 1}
      </span>
    </div>
  );
};

export default function HorizontalGallery({ images, theme }: HorizontalGalleryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const scrollContainer = scrollRef.current;
    const section = sectionRef.current;
    if (!scrollContainer || !section) return;

    // GSAP ScrollTrigger only for desktop/tablet (> 768px)
    const ctx = gsap.context(() => {
      const isDesktop = window.innerWidth > 768;
      
      if (isDesktop) {
        const calculateScroll = () => {
          return -(scrollContainer.scrollWidth - window.innerWidth + 80);
        };

        gsap.to(scrollContainer, {
          x: calculateScroll,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 0.6,
            start: 'top top',
            end: () => `+=${scrollContainer.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
          }
        });
      }
    }, sectionRef);

    // Dynamic scroll detector to enforce black-and-white on load
    const handleScrollDetection = () => {
      const currentSection = sectionRef.current;
      const currentScrollContainer = scrollRef.current;
      if (!currentSection) return;

      // Detect horizontal transform applied by GSAP ScrollTrigger
      let desktopScrolled = false;
      if (currentScrollContainer) {
        const transform = window.getComputedStyle(currentScrollContainer).transform;
        if (transform && transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
          // Check if it translated more than 15 pixels
          const matrixValues = transform.match(/matrix.*\((.+)\)/);
          if (matrixValues) {
            const translateX = parseFloat(matrixValues[1].split(', ')[4]);
            if (Math.abs(translateX) > 15) {
              desktopScrolled = true;
            }
          }
        }
      }

      // Detect horizontal scroll on mobile containers
      const mobileScrolled = currentScrollContainer ? currentScrollContainer.scrollLeft > 15 : false;

      // Detect vertical scroll height compared to section start
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const verticalScrolled = scrollTop > currentSection.offsetTop + 15;

      if (desktopScrolled || mobileScrolled || verticalScrolled) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScrollDetection);
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScrollDetection);
    }

    // Trigger initial detection in case page loads scrolled
    handleScrollDetection();

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
      window.removeEventListener('scroll', handleScrollDetection);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScrollDetection);
      }
    };
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div
      ref={sectionRef}
      id="gallery-section"
      className="relative overflow-hidden"
      style={{ backgroundColor: '#fdf6ec', zIndex: 2 }}
    >
      {/* Desktop Horizontal Scroll Track */}
      <div className="hidden md:flex h-screen items-center relative">
        {/* Moving Image Track */}
        <div 
          ref={scrollRef} 
          className="flex gap-16 pl-[10vw] pr-[20vw] items-center will-change-transform"
        >
          {/* Editorial Titles as the first element in the track */}
          <div className="relative flex-shrink-0 w-[320px] flex flex-col justify-center select-none pr-8">
            <p className={`text-xs uppercase tracking-[0.25em] mb-2 ${theme.accentText} ${theme.bodyFont}`}>
              Nuestra Galería
            </p>
            <h3 className={`text-4xl font-light tracking-wide leading-tight ${theme.headingFont} ${theme.bodyText}`}>
              Momentos Capturados
            </h3>
            <ThemeDivider className="mt-6" />
          </div>

          {images.map((img, index) => (
            <GalleryImageCard 
              key={index} 
              img={img} 
              index={index} 
              theme={theme} 
              hasScrolled={hasScrolled}
            />
          ))}
        </div>
      </div>

      {/* Mobile Native Snap Scroll Track */}
      <div className="md:hidden py-16 px-6">
        <div className="mb-8 text-center">
          <p className={`text-xs uppercase tracking-[0.25em] mb-2 ${theme.accentText} ${theme.bodyFont}`}>
            Nuestra Galería
          </p>
          <h3 className={`text-3xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`}>
            Momentos Capturados
          </h3>
          <ThemeDivider className="mt-4" />
        </div>



        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 no-scrollbar pb-6">
          {images.map((img, index) => (
            <GalleryImageCard 
              key={index} 
              img={img} 
              index={index} 
              theme={theme} 
              hasScrolled={hasScrolled}
            />
          ))}
        </div>
        
        <p className={`text-[10px] text-center uppercase tracking-widest opacity-50 mt-2 ${theme.bodyFont} ${theme.bodyText}`}>
          Desliza para ver más
        </p>
      </div>
    </div>
  );
}

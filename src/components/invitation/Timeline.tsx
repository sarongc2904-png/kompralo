'use client';

import React, { useRef } from 'react';
import { Theme } from '@/domain/themes/types';
import { TimelineEvent } from '@/domain/invitations/types';
import { motion, useScroll } from 'framer-motion';
import { Heart } from 'lucide-react';
import InkRevealText from './InkRevealText';

interface TimelineProps {

  events: TimelineEvent[];
  theme: Theme;
}

export default function Timeline({ events, theme }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position inside the timeline to connect hearts dynamically
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center']
  });

  if (!events || events.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-6 md:px-8 bg-transparent select-none">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <p className={`text-xs uppercase tracking-[0.25em] mb-3 ${theme.accentText} ${theme.bodyFont}`}>
            Nuestra Historia
          </p>
          <h3 className={`text-3xl md:text-4xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`} style={{ fontFamily: 'var(--v2-font-heading, inherit)' }}>
            Línea del Tiempo
          </h3>
          <div
            className="w-12 mx-auto mt-6"
            aria-hidden="true"
            style={{ height: '1px', background: `var(--v2-divider-color, ${theme.colors.accent})`, opacity: 0.6 }}
          />
        </div>




        {/* Timeline Path Container */}
        <div ref={containerRef} className="relative">
          {/* Static Background Line */}
          <div
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 z-0"
            style={{ background: `var(--v2-color-border, #EDE8DF)` }}
          />

          {/* Active Growing Connecting Line */}
          <motion.div
            style={{ scaleY: scrollYProgress, originY: 0, background: `var(--v2-color-accent, #C5A880)` }}
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 z-0"
          />

          {/* Events Grid */}
          <div className="space-y-12 md:space-y-24">
            {events.map((event, index) => {
              const isEven = index % 2 === 0;
              return (
                <div 
                  key={event.id} 
                  className={`relative flex flex-col md:flex-row ${isEven ? 'md:flex-row-reverse' : ''} items-start md:items-center`}
                >
                  {/* Pulsing Heart Marker (Bigger and animated) */}
                  <div className="absolute left-4 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="flex items-center justify-center"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1, 1.15, 1], // Realistic double heartbeat pulse
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.8,
                          ease: "easeInOut",
                          repeatDelay: 0.8
                        }}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md transition-colors duration-300"
                        style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: `var(--v2-color-border, #EDE8DF)`, color: `var(--v2-color-accent, #C5A880)` }}
                      >
                        <Heart className="w-4 h-4 fill-current" strokeWidth={1} />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Spacer Column */}
                  <div className="w-full md:w-1/2" />

                  {/* Content Card Column */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`w-full md:w-1/2 ${
                      isEven 
                        ? 'pl-16 pr-4 md:pl-4 md:pr-16 text-left md:text-right' 
                        : 'pl-16 pr-4 md:pl-16 md:pr-4 text-left md:text-left'
                    }`}
                  >
                    <div className={`text-left ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                      {/* Year badge */}
                      <span className={`inline-block text-sm font-semibold tracking-widest ${theme.accentText} font-mono mb-2`}>
                        {event.year}
                      </span>
                      
                      {/* Event Title */}
                      <h4 className={`text-xl font-light mb-3 tracking-wide ${theme.headingFont} ${theme.bodyText}`}>
                        {event.title}
                      </h4>
                      
                      {/* Event Description */}
                      <p className={`text-sm leading-relaxed opacity-75 max-w-sm ${isEven ? 'md:ml-auto md:mr-0' : 'md:mr-auto md:ml-0'} ${theme.bodyFont} ${theme.bodyText}`}>
                        {event.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}

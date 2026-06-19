'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InkRevealTextProps {
  text: string;
  className?: string;
}

export default function InkRevealText({ text, className = '' }: InkRevealTextProps) {
  const [scale, setScale] = useState(70);
  const [hasEntered, setHasEntered] = useState(false);

  const handleViewportEnter = () => {
    if (hasEntered) return;
    setHasEntered(true);
    
    // Smoothly animate scale down to 0
    let currentScale = 70;
    const interval = setInterval(() => {
      currentScale -= 2.5;
      if (currentScale <= 0) {
        setScale(0);
        clearInterval(interval);
      } else {
        setScale(currentScale);
      }
    }, 25);
  };

  // Generate a clean safe ID based on text
  const filterId = `ink-bleed-${text.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;

  return (
    <motion.span 
      onViewportEnter={handleViewportEnter}
      viewport={{ once: true, margin: '-50px' }}
      className="relative inline-block w-full"
    >
      {scale > 0 && (
        <svg className="absolute w-0 h-0 pointer-events-none select-none" width="0" height="0">
          <defs>
            <filter id={filterId}>
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.04" 
                numOctaves="3" 
                result="noise" 
              />
              <feDisplacementMap 
                in="SourceGraphic" 
                in2="noise" 
                scale={scale} 
                xChannelSelector="R" 
                yChannelSelector="G" 
              />
            </filter>
          </defs>
        </svg>
      )}
      <span 
        className={className} 
        style={{ 
          filter: scale > 0 ? `url(#${filterId})` : 'none',
          transition: 'letter-spacing 1.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {text}
      </span>
    </motion.span>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '@/domain/themes/types';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicControllerProps {
  audioUrl: string;
  theme: Theme;
  autoPlayTrigger: boolean;
}

export default function MusicController({ audioUrl, autoPlayTrigger }: MusicControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playError, setPlayError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio element — runs whenever audioUrl changes
  useEffect(() => {
    const validUrl = audioUrl?.trim();
    if (!validUrl) return;

    const audio = new Audio(validUrl);
    audio.loop    = true;
    audio.volume  = 0.4;
    audio.preload = 'none';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl]);

  // Attempt autoplay when intro is dismissed (Platinum flow: user tapped "Entrar").
  // For Gold (showIntro=false), autoPlayTrigger is always true, so the browser
  // will block the silent attempt — that is expected. The button still works.
  useEffect(() => {
    if (!autoPlayTrigger || !audioRef.current) return;
    audioRef.current.play()
      .then(() => { setIsPlaying(true); setPlayError(false); })
      .catch(() => { /* blocked — user will activate via button */ });
  }, [autoPlayTrigger]);

  const handleToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setPlayError(false);

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => { setIsPlaying(true); })
        .catch((err) => {
          console.warn('[music] playback error:', err);
          setPlayError(true);
        });
    }
  };

  // Don't render anything if there is no valid audio source
  if (!audioUrl?.trim()) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">

      {/* Soundwave animation — visible while playing */}
      {isPlaying && (
        <div className="flex gap-1 items-end h-4 px-2 py-0.5 bg-white/70 backdrop-blur-md border border-[#EDE8DF] rounded-full pointer-events-none">
          <span className="w-[1.5px] h-2 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" />
          <span className="w-[1.5px] h-3 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_0.2s_infinite]" />
          <span className="w-[1.5px] h-1 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_0.4s_infinite]" />
          <span className="w-[1.5px] h-3.5 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_0.1s_infinite]" />
        </div>
      )}

      {/* Toggle button with visible label so users know to tap it */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 pl-3 pr-4 h-10 rounded-full border shadow-md bg-white border-[#EDE8DF] cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 select-none"
        aria-label={isPlaying ? 'Pausar música' : 'Activar música'}
        style={{ color: '#4A4740' }}
      >
        {isPlaying ? (
          <Volume2 className="w-4 h-4 animate-pulse flex-shrink-0" strokeWidth={1.3} />
        ) : (
          <VolumeX className="w-4 h-4 opacity-60 flex-shrink-0" strokeWidth={1.3} />
        )}
        <span className="text-[11px] tracking-wide whitespace-nowrap" style={{ color: '#6B5B4E' }}>
          {playError
            ? 'Toca para reintentar'
            : isPlaying
              ? 'Música activa'
              : 'Activar música'}
        </span>
      </button>

      {/* Soundwave keyframes */}
      <style jsx global>{`
        @keyframes soundwave {
          0%, 100% { transform: scaleY(1); }
          50%       { transform: scaleY(0.3); }
        }
      `}</style>
    </div>
  );
}

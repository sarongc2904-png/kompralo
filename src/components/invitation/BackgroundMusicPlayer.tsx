'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { InvitationMusic } from '@/domain/invitations/types';

interface BackgroundMusicPlayerProps {
  music: InvitationMusic;
}

export default function BackgroundMusicPlayer({ music }: BackgroundMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [retryPrompt, setRetryPrompt] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Derive whether music should be available
  const isEnabled = music.enabled !== false;
  const audioUrl = music.audioUrl?.trim() ?? '';

  useEffect(() => {
    if (!isEnabled || !audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.loop    = true;
    audio.volume  = 0.4;
    audio.preload = 'none';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [isEnabled, audioUrl]);

  // Guard: nothing to show if disabled or no URL
  if (!isEnabled || !audioUrl) return null;

  const handleToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setRetryPrompt(false);

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => { setIsPlaying(true); })
        .catch((err) => {
          console.warn('[BackgroundMusicPlayer] playback blocked:', err);
          setRetryPrompt(true);
        });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-1.5">

      {/* Retry hint */}
      {retryPrompt && (
        <p className="text-[10px] px-3 py-1 rounded-full bg-white/90 border border-[#EDE8DF] shadow-sm"
          style={{ color: '#9B8878' }}>
          Toca nuevamente para activar la música
        </p>
      )}

      {/* Soundwave animation — visible while playing */}
      {isPlaying && (
        <div className="flex gap-1 items-end h-4 px-2 py-0.5 bg-white/70 backdrop-blur-md border border-[#EDE8DF] rounded-full pointer-events-none">
          <span className="w-[1.5px] h-2 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" />
          <span className="w-[1.5px] h-3 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_0.2s_infinite]" />
          <span className="w-[1.5px] h-1 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_0.4s_infinite]" />
          <span className="w-[1.5px] h-3.5 bg-[#C5A880] rounded-full animate-[soundwave_0.8s_ease-in-out_0.1s_infinite]" />
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 pl-3 pr-4 h-10 rounded-full border shadow-md bg-white border-[#EDE8DF] cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 select-none"
        aria-label={isPlaying ? 'Pausar música' : 'Activar música'}
        style={{ color: '#4A4740' }}
      >
        {/* Speaker icon using inline SVG to avoid lucide import coupling */}
        {isPlaying ? (
          <svg className="w-4 h-4 animate-pulse flex-shrink-0" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        ) : (
          <svg className="w-4 h-4 opacity-60 flex-shrink-0" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        )}
        <span className="text-[11px] tracking-wide whitespace-nowrap" style={{ color: '#6B5B4E' }}>
          {isPlaying ? 'Música activa' : 'Activar música'}
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
